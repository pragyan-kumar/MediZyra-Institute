import cors from "cors";
import express from "express";
import { closeDb, getDb, getMongoConfig } from "./db.js";
import { createSeedState } from "./seedData.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const PHONE_MIN_DIGITS = 10;
const DEFAULT_DOCTOR_PASSWORD = "Doctor@123";
const DEFAULT_DOCTOR_SLOTS = [
  ["10:00 AM", "01:00 PM", "04:00 PM"],
  ["09:30 AM", "12:30 PM", "03:30 PM"],
  ["11:00 AM", "02:00 PM", "05:00 PM"],
];

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

function hasValidPhone(phone) {
  return normalizePhone(phone).length >= PHONE_MIN_DIGITS;
}

function buildAvatarLabel(name) {
  return String(name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatScheduleLabel(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function createDoctorSchedule(startDate) {
  const baseDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date("2026-03-30T00:00:00");

  return Array.from({ length: 3 }, (_, index) => {
    const date = addDays(baseDate, index * 2);

    return {
      date: date.toISOString().slice(0, 10),
      label: formatScheduleLabel(date),
      slots: DEFAULT_DOCTOR_SLOTS[index % DEFAULT_DOCTOR_SLOTS.length],
    };
  });
}

function buildDoctorRecord({ existingDoctor, form }) {
  const schedule = createDoctorSchedule(form.availabilityDate || existingDoctor?.schedule?.[0]?.date);
  const focusAreas = String(form.focusAreas ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = String(form.languages ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: existingDoctor?.id ?? `dr-${slugify(form.name) || createId("doctor")}`,
    userId: existingDoctor?.userId ?? createId("usr-doc"),
    name: String(form.name).trim(),
    specialty: String(form.specialty).trim(),
    clinic: String(form.clinic).trim(),
    experience: String(form.experience).trim(),
    fee: Number(form.fee),
    location: String(form.location).trim(),
    languages,
    nextAvailable: `${schedule[0].label} at ${schedule[0].slots[0]}`,
    intro: String(form.intro).trim(),
    about: String(form.about).trim(),
    focusAreas,
    credentials: String(form.credentials).trim(),
    tone: form.tone,
    avatarLabel: buildAvatarLabel(form.name),
    schedule,
  };
}

function stripMongoFields(document) {
  const sanitized = { ...document };
  delete sanitized._id;
  delete sanitized._seedIndex;
  delete sanitized.password;
  return sanitized;
}

async function getCollections() {
  const db = await getDb();
  return {
    appointments: db.collection("appointments"),
    contactMessages: db.collection("contactMessages"),
    doctors: db.collection("doctors"),
    users: db.collection("users"),
  };
}

async function ensureSeedData() {
  const collections = await getCollections();
  const seed = createSeedState();

  await collections.users.createIndex({ email: 1 }, { unique: true });

  const specs = [
    ["users", seed.users],
    ["doctors", seed.doctors],
    ["appointments", seed.appointments],
    ["contactMessages", seed.contactMessages],
  ];

  await Promise.all(
    specs.map(async ([name, items]) => {
      const collection = collections[name];
      const count = await collection.estimatedDocumentCount();

      if (count === 0 && items.length) {
        await collection.insertMany(items.map((item, index) => ({ ...item, _seedIndex: index })));
      }
    }),
  );
}

function compareSeedOrder(left, right) {
  const leftCreatedAt = Date.parse(left.createdAt ?? "") || 0;
  const rightCreatedAt = Date.parse(right.createdAt ?? "") || 0;

  if (leftCreatedAt !== rightCreatedAt) {
    return rightCreatedAt - leftCreatedAt;
  }

  return (left._seedIndex ?? Number.MAX_SAFE_INTEGER) - (right._seedIndex ?? Number.MAX_SAFE_INTEGER);
}

async function readAppState() {
  const collections = await getCollections();
  const [users, doctors, appointments, contactMessages] = await Promise.all([
    collections.users.find({}, { projection: { _id: 0, password: 0 } }).toArray(),
    collections.doctors.find({}, { projection: { _id: 0 } }).toArray(),
    collections.appointments.find({}, { projection: { _id: 0 } }).toArray(),
    collections.contactMessages.find({}, { projection: { _id: 0 } }).toArray(),
  ]);

  return {
    appointments,
    contactMessages: contactMessages.sort(compareSeedOrder),
    doctors: doctors.sort(compareSeedOrder),
    users: users.sort(compareSeedOrder),
  };
}

async function findActor(actorUserId) {
  if (!actorUserId) {
    return null;
  }

  const { users } = await getCollections();
  return users.findOne({ id: actorUserId });
}

async function resetDatabase() {
  const collections = await getCollections();
  const seed = createSeedState();

  await Promise.all([
    collections.users.deleteMany({}),
    collections.doctors.deleteMany({}),
    collections.appointments.deleteMany({}),
    collections.contactMessages.deleteMany({}),
  ]);

  await Promise.all([
    seed.users.length
      ? collections.users.insertMany(seed.users.map((item, index) => ({ ...item, _seedIndex: index })))
      : null,
    seed.doctors.length
      ? collections.doctors.insertMany(seed.doctors.map((item, index) => ({ ...item, _seedIndex: index })))
      : null,
    seed.appointments.length
      ? collections.appointments.insertMany(
          seed.appointments.map((item, index) => ({ ...item, _seedIndex: index })),
        )
      : null,
  ]);
}

app.get("/api/health", async (_request, response) => {
  const { dbName, mongoUri } = getMongoConfig();

  response.json({
    dbName,
    mongoUri,
    ok: true,
  });
});

app.get("/api/app-state", async (_request, response) => {
  response.json(await readAppState());
});

app.post("/api/auth/login", async (request, response) => {
  const { users } = await getCollections();
  const email = normalizeEmail(request.body.email);
  const password = String(request.body.password ?? "");

  const matchedUser = await users.findOne({ email, password });
  if (!matchedUser) {
    response.status(401).json({
      error: "We could not match that email and password in the system.",
    });
    return;
  }

  response.json({ ok: true, user: stripMongoFields(matchedUser) });
});

app.post("/api/patients/register", async (request, response) => {
  const { users } = await getCollections();
  const email = normalizeEmail(request.body.email);
  const name = String(request.body.name ?? "").trim();
  const password = String(request.body.password ?? "").trim();
  const phone = String(request.body.phone ?? "");
  const cleanedPhone = normalizePhone(phone);

  if (!name || !email || !password || !phone.trim()) {
    response.status(400).json({ error: "Please complete all registration fields." });
    return;
  }

  if (!hasValidPhone(phone)) {
    response.status(400).json({
      error: "Please enter a valid mobile number with at least 10 digits.",
    });
    return;
  }

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    response.status(409).json({
      error: "That email is already in the system. Please sign in instead.",
    });
    return;
  }

  const newPatient = {
    id: createId("usr-patient"),
    role: "patient",
    name,
    email,
    password,
    phone: cleanedPhone,
    createdAt: new Date().toISOString(),
  };

  await users.insertOne(newPatient);
  response.status(201).json({ ok: true, user: stripMongoFields(newPatient) });
});

app.post("/api/appointments", async (request, response) => {
  const actor = await findActor(request.body.actorUserId);
  if (!actor || actor.role !== "patient") {
    response.status(403).json({
      error: "Please sign in with a patient account before booking.",
    });
    return;
  }

  const { doctors, appointments } = await getCollections();
  const doctorId = String(request.body.doctorId ?? "");
  const doctor = await doctors.findOne({ id: doctorId });

  if (!doctor) {
    response.status(404).json({ error: "Selected doctor was not found." });
    return;
  }

  const selectedDate = String(request.body.selectedDate ?? "");
  const selectedSlot = String(request.body.selectedSlot ?? "");
  const reason = String(request.body.reason ?? "");
  const symptoms = String(request.body.symptoms ?? "");
  const patientPhone = normalizePhone(request.body.phone || actor.phone || "");

  if (!selectedDate || !selectedSlot || !reason.trim() || !symptoms.trim()) {
    response.status(400).json({
      error: "Please complete the visit details before sending the request.",
    });
    return;
  }

  if (!hasValidPhone(patientPhone)) {
    response.status(400).json({
      error: "Please enter a valid mobile number with at least 10 digits.",
    });
    return;
  }

  const appointment = {
    id: createId("apt"),
    patientId: actor.id,
    patientName: actor.name,
    patientEmail: actor.email,
    phone: patientPhone,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    appointmentDate: selectedDate,
    appointmentSlot: selectedSlot,
    consultationMode: String(request.body.consultationMode ?? "In-clinic"),
    priority: String(request.body.priority ?? "Routine"),
    reason: reason.trim(),
    symptoms: symptoms.trim(),
    status: "Requested",
    adminSummary: "",
    doctorSummary: "",
    prescription: [],
    followUpDate: "",
    bookedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await appointments.insertOne(appointment);
  response.status(201).json({ ok: true, appointment });
});

app.patch("/api/appointments/:appointmentId/admin", async (request, response) => {
  const actor = await findActor(request.body.actorUserId);
  if (!actor || actor.role !== "admin") {
    response.status(403).json({
      error: "Only admin accounts can update the triage board.",
    });
    return;
  }

  const { appointments } = await getCollections();
  const result = await appointments.updateOne(
    { id: request.params.appointmentId },
    {
      $set: {
        status: String(request.body.status ?? "Requested"),
        consultationMode: String(request.body.consultationMode ?? "In-clinic"),
        appointmentDate: String(request.body.appointmentDate ?? ""),
        appointmentSlot: String(request.body.appointmentSlot ?? ""),
        adminSummary: String(request.body.adminSummary ?? "").trim(),
        updatedAt: new Date().toISOString(),
      },
    },
  );

  if (!result.matchedCount) {
    response.status(404).json({ error: "Appointment not found." });
    return;
  }

  response.json({ ok: true });
});

app.patch("/api/appointments/:appointmentId/doctor", async (request, response) => {
  const actor = await findActor(request.body.actorUserId);
  if (!actor || actor.role !== "doctor") {
    response.status(403).json({
      error: "Only doctor accounts can save clinical notes.",
    });
    return;
  }

  const doctorSummary = String(request.body.doctorSummary ?? "").trim();
  if (!doctorSummary) {
    response.status(400).json({
      error: "Please add a consultation summary before completing the visit.",
    });
    return;
  }

  const prescription = String(request.body.prescriptionItems ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { appointments } = await getCollections();
  const result = await appointments.updateOne(
    { id: request.params.appointmentId, doctorId: actor.linkedDoctorId },
    {
      $set: {
        status: "Completed",
        doctorSummary,
        prescription,
        followUpDate: String(request.body.followUpDate ?? ""),
        updatedAt: new Date().toISOString(),
      },
    },
  );

  if (!result.matchedCount) {
    response.status(404).json({ error: "Appointment not found for this doctor." });
    return;
  }

  response.json({ ok: true });
});

app.post("/api/contact-messages", async (request, response) => {
  const actor = await findActor(request.body.actorUserId);
  const email = normalizeEmail(request.body.email || actor?.email || "");
  const phone = normalizePhone(request.body.phone || actor?.phone || "");
  const name = String(request.body.name ?? "").trim() || actor?.name || "Visitor";
  const subject = String(request.body.subject ?? "").trim();
  const message = String(request.body.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    response.status(400).json({
      error: "Please complete the contact form before sending it.",
    });
    return;
  }

  if (phone && !hasValidPhone(phone)) {
    response.status(400).json({
      error: "Please enter a valid mobile number with at least 10 digits.",
    });
    return;
  }

  const { contactMessages } = await getCollections();
  const contactMessage = {
    id: createId("msg"),
    name,
    email,
    phone,
    category: String(request.body.category ?? "General question"),
    subject,
    message,
    submittedByRole: actor?.role ?? "guest",
    createdAt: new Date().toISOString(),
  };

  await contactMessages.insertOne(contactMessage);
  response.status(201).json({ ok: true, contactMessage });
});

app.post("/api/doctors/upsert", async (request, response) => {
  const actor = await findActor(request.body.actorUserId);
  if (!actor || actor.role !== "admin") {
    response.status(403).json({
      error: "Only admin accounts can manage doctor profiles.",
    });
    return;
  }

  const form = request.body.form ?? {};
  const requiredFields = [
    form.name,
    form.specialty,
    form.clinic,
    form.experience,
    form.fee,
    form.location,
    form.languages,
    form.focusAreas,
    form.credentials,
    form.intro,
    form.about,
    form.email,
    form.phone,
    form.availabilityDate,
  ];

  if (requiredFields.some((value) => !String(value ?? "").trim())) {
    response.status(400).json({ error: "Please complete all doctor profile fields." });
    return;
  }

  if (!hasValidPhone(form.phone)) {
    response.status(400).json({
      error: "Doctor contact number must contain at least 10 digits.",
    });
    return;
  }

  if (!Number.isFinite(Number(form.fee)) || Number(form.fee) <= 0) {
    response.status(400).json({
      error: "Consultation fee must be a valid amount.",
    });
    return;
  }

  const { doctors, users } = await getCollections();
  const doctorId = String(form.doctorId ?? "");
  const existingDoctor = doctorId ? await doctors.findOne({ id: doctorId }) : null;
  const existingUser = doctorId ? await users.findOne({ linkedDoctorId: doctorId }) : null;
  const normalizedEmail = normalizeEmail(form.email);
  const conflictingUser = await users.findOne({
    email: normalizedEmail,
    ...(existingUser ? { id: { $ne: existingUser.id } } : {}),
  });

  if (conflictingUser) {
    response.status(409).json({
      error: "That doctor email is already assigned to another account.",
    });
    return;
  }

  const doctorRecord = buildDoctorRecord({ existingDoctor, form });
  const doctorUser = {
    id: existingUser?.id ?? doctorRecord.userId,
    role: "doctor",
    name: doctorRecord.name,
    email: normalizedEmail,
    password: existingUser?.password ?? DEFAULT_DOCTOR_PASSWORD,
    phone: normalizePhone(form.phone),
    linkedDoctorId: doctorRecord.id,
    createdAt: existingUser?.createdAt ?? new Date().toISOString(),
  };

  if (existingDoctor) {
    await doctors.updateOne(
      { id: existingDoctor.id },
      {
        $set: {
          ...doctorRecord,
          createdAt: existingDoctor.createdAt ?? new Date().toISOString(),
        },
      },
    );
  } else {
    await doctors.insertOne({
      ...doctorRecord,
      createdAt: new Date().toISOString(),
    });
  }

  if (existingUser) {
    await users.updateOne({ id: existingUser.id }, { $set: doctorUser });
  } else {
    await users.insertOne(doctorUser);
  }

  response.json({
    ok: true,
    message: existingDoctor
      ? "Doctor profile updated successfully."
      : `Doctor profile created. Default password: ${doctorUser.password}`,
  });
});

app.post("/api/reset", async (_request, response) => {
  await resetDatabase();
  response.json({ ok: true });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: "The care workspace could not complete that request right now.",
  });
});

async function start() {
  await ensureSeedData();

  app.listen(port, () => {
    console.log(`MediZyra API listening on http://127.0.0.1:${port}`);
  });
}

start().catch(async (error) => {
  console.error("Failed to start MediZyra API", error);
  await closeDb();
  process.exit(1);
});
