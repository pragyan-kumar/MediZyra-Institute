import path from "node:path";
import pptxgen from "pptxgenjs";

const root = process.cwd();
const assets = path.join(root, "presentation-assets");
const logoPath = path.join(root, "src", "assets", "reference", "logo.jpeg");
const cyberImage = path.join(assets, "cyber-attack.jpg");
const doctorPatientImage = path.join(assets, "doctor-patient.jpg");
const hospitalDiscussionImage = path.join(assets, "hospital-discussion.jpg");
const outputPath = path.join(root, "MediZyra_Cyber_Resilience_Presentation.pptx");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "OpenAI";
pptx.subject = "MediZyra cyber-resilient healthcare system presentation";
pptx.title = "MediZyra Healthcare Solutions - Cyber Resilience Presentation";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Georgia",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};

const C = {
  navy: "123B6D",
  navyDeep: "0C274A",
  blue: "2F79C6",
  teal: "20B8C9",
  aqua: "9EEAF2",
  ink: "18324F",
  softInk: "52708E",
  white: "FFFFFF",
  offWhite: "F6FAFE",
  pale: "EAF4FB",
  gold: "E5B85A",
  red: "D35D6E",
  green: "27A676",
  line: "CFE1EE",
};

function addSlideBase(slide, { title, kicker, bg = C.offWhite } = {}) {
  slide.background = { color: bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: bg },
    line: { color: bg },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.35,
    fill: { color: C.teal },
    line: { color: C.teal },
  });

  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.6,
      y: 0.55,
      w: 3.4,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      color: C.teal,
      charSpace: 1.5,
      margin: 0,
    });
  }

  if (title) {
    slide.addText(title, {
      x: 0.6,
      y: 0.82,
      w: 7.5,
      h: 0.7,
      fontFace: "Georgia",
      fontSize: 24,
      bold: true,
      color: C.navyDeep,
      margin: 0,
    });
  }
}

function addFooter(slide, index) {
  slide.addText(`MediZyra Presentation  |  Slide ${index}`, {
    x: 0.6,
    y: 7.08,
    w: 3.8,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8,
    color: C.softInk,
    margin: 0,
  });
}

function addBulletList(slide, items, opts) {
  const {
    x,
    y,
    w,
    h,
    fontSize = 16,
    color = C.ink,
    bulletColor = C.teal,
    gap = 0.48,
  } = opts;

  items.forEach((item, idx) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x,
      y: y + idx * gap + 0.12,
      w: 0.11,
      h: 0.11,
      fill: { color: bulletColor },
      line: { color: bulletColor },
    });
    slide.addText(item, {
      x: x + 0.18,
      y: y + idx * gap,
      w: w - 0.18,
      h: 0.34,
      fontFace: "Aptos",
      fontSize,
      color,
      margin: 0,
      breakLine: false,
      valign: "mid",
    });
  });
}

function addPortalCard(slide, { x, y, w, title, subtitle, bullets, accent, iconText }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 3.05,
    rectRadius: 0.12,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
    shadow: { type: "outer", color: "A8C3D8", blur: 2, angle: 45, distance: 2, opacity: 0.18 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.2,
    y: y + 0.22,
    w: 0.6,
    h: 0.6,
    rectRadius: 0.08,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(iconText, {
    x: x + 0.2,
    y: y + 0.27,
    w: 0.6,
    h: 0.28,
    align: "center",
    fontFace: "Aptos",
    fontSize: 20,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText(title, {
    x: x + 0.95,
    y: y + 0.2,
    w: w - 1.1,
    h: 0.3,
    fontFace: "Georgia",
    fontSize: 20,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  slide.addText(subtitle, {
    x: x + 0.95,
    y: y + 0.56,
    w: w - 1.15,
    h: 0.38,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: C.softInk,
    margin: 0,
  });
  addBulletList(slide, bullets, {
    x: x + 0.28,
    y: y + 1.08,
    w: w - 0.4,
    h: 1.8,
    fontSize: 11.2,
    gap: 0.46,
    bulletColor: accent,
  });
}

function addStatusBox(slide, { x, y, label, color, textColor = C.white }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w: 2.05,
    h: 0.65,
    rectRadius: 0.08,
    fill: { color },
    line: { color },
  });
  slide.addText(label, {
    x,
    y: y + 0.18,
    w: 2.05,
    h: 0.24,
    align: "center",
    fontFace: "Aptos",
    fontSize: 18,
    bold: true,
    color: textColor,
    margin: 0,
  });
}

function arrow(slide, x, y, w, h, color) {
  slide.addShape(pptx.ShapeType.chevron, {
    x,
    y,
    w,
    h,
    fill: { color },
    line: { color },
  });
}

// Slide 1: Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navyDeep };
  slide.addImage({ path: doctorPatientImage, x: 6.65, y: 0, w: 6.68, h: 7.5 });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: C.navyDeep, transparency: 48 },
    line: { color: C.navyDeep, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 7.55,
    h: 7.5,
    fill: { color: C.navyDeep, transparency: 0 },
    line: { color: C.navyDeep, transparency: 100 },
  });
  slide.addImage({ path: logoPath, x: 0.72, y: 0.55, w: 0.72, h: 0.72, rounding: true });
  slide.addText("MediZyra Healthcare Solutions", {
    x: 0.72,
    y: 1.25,
    w: 5.8,
    h: 0.7,
    fontFace: "Georgia",
    fontSize: 26,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText("Offline-first hospital operations demo for cyber-resilient care delivery", {
    x: 0.72,
    y: 1.95,
    w: 5.9,
    h: 0.6,
    fontFace: "Aptos",
    fontSize: 17,
    color: C.aqua,
    margin: 0,
  });
  slide.addText("Project presentation focused on why the system was built, how it works, and how local-only operation helps reduce ransomware exposure during demonstration and training use.", {
    x: 0.72,
    y: 2.75,
    w: 5.85,
    h: 1.0,
    fontFace: "Aptos",
    fontSize: 13.5,
    color: "E8F4FF",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.72,
    y: 4.55,
    w: 5.55,
    h: 1.45,
    rectRadius: 0.08,
    fill: { color: C.white, transparency: 86 },
    line: { color: C.aqua, transparency: 55, pt: 1.1 },
  });
  slide.addText("Student Name: __________________________\nRoll No / ID: __________________________\nCourse / Department: ____________________", {
    x: 1.0,
    y: 4.9,
    w: 4.9,
    h: 0.85,
    fontFace: "Aptos",
    fontSize: 15,
    color: C.white,
    breakLine: true,
    margin: 0,
  });
  slide.addText("Cyber-resilient healthcare demo", {
    x: 0.72,
    y: 6.45,
    w: 2.35,
    h: 0.26,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: C.aqua,
    margin: 0,
  });
}

// Slide 2: Motivation
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "Project Rationale", title: "Why this project was created" });
  slide.addImage({ path: cyberImage, x: 7.72, y: 0.95, w: 5.0, h: 4.2 });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.55,
    y: 5.35,
    w: 5.2,
    h: 1.15,
    rectRadius: 0.06,
    fill: { color: C.navyDeep },
    line: { color: C.navyDeep },
  });
  slide.addText("Core reason", {
    x: 7.82,
    y: 5.58,
    w: 1.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: C.aqua,
    margin: 0,
  });
  slide.addText("Build a hospital system demo that can run locally without depending on the internet, reducing the attack surface exposed during demonstration and helping teams think about continuity during ransomware-style disruption.", {
    x: 7.82,
    y: 5.84,
    w: 4.6,
    h: 0.5,
    fontFace: "Aptos",
    fontSize: 11.2,
    color: C.white,
    margin: 0,
  });
  addBulletList(slide, [
    "WannaCry showed how a hospital cyberattack can disrupt appointments, records access, and clinical continuity.",
    "Healthcare is a high-impact target because downtime affects both business operations and patient care.",
    "This project demonstrates a safer local workflow where the demo stack remains usable without external internet dependence.",
    "The aim is not to claim perfect immunity, but to illustrate continuity-focused design and reduced exposure in academic demos.",
  ], {
    x: 0.82,
    y: 1.55,
    w: 6.2,
    h: 3.6,
    fontSize: 14.2,
    gap: 0.78,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: 5.45,
    w: 5.95,
    h: 1.1,
    rectRadius: 0.05,
    fill: { color: C.pale },
    line: { color: C.line, pt: 1 },
  });
  slide.addText("Message for presentation: hospitals need systems that keep essential workflows running even when cyber incidents interrupt connected infrastructure.", {
    x: 1.02,
    y: 5.75,
    w: 5.5,
    h: 0.45,
    fontFace: "Aptos",
    fontSize: 11.6,
    italic: true,
    color: C.navy,
    margin: 0,
  });
  addFooter(slide, 2);
}

// Slide 3: Evidence and response
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "Threat Context", title: "Healthcare cyberattacks make resilience a patient-safety issue" });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 1.25,
    w: 3.95,
    h: 2.0,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("WannaCry impact", {
    x: 0.95,
    y: 1.5,
    w: 2.0,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 19,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  slide.addText("The NAO reported disruption at at least 34% of NHS trusts in England, with at least 81 of 236 trusts affected and 595 GP practices infected.", {
    x: 0.95,
    y: 1.92,
    w: 3.35,
    h: 0.8,
    fontFace: "Aptos",
    fontSize: 12.2,
    color: C.ink,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.7,
    y: 1.25,
    w: 3.95,
    h: 2.0,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("Growing sector risk", {
    x: 4.95,
    y: 1.5,
    w: 2.2,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 19,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  slide.addText("HHS notes that cyberattacks on hospitals and health systems more than doubled from 2016 to 2021, stressing operational continuity and patient safety.", {
    x: 4.95,
    y: 1.92,
    w: 3.3,
    h: 0.8,
    fontFace: "Aptos",
    fontSize: 12.2,
    color: C.ink,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.7,
    y: 1.25,
    w: 3.95,
    h: 2.0,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("Practical lesson", {
    x: 8.95,
    y: 1.5,
    w: 2.0,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 19,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  slide.addText("CISA recommends offline backups and strong patching discipline. This project applies the same continuity mindset to a local hospital workflow demo.", {
    x: 8.95,
    y: 1.92,
    w: 3.25,
    h: 0.8,
    fontFace: "Aptos",
    fontSize: 12.2,
    color: C.ink,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.72,
    y: 3.7,
    w: 12.0,
    h: 2.6,
    rectRadius: 0.08,
    fill: { color: C.navyDeep },
    line: { color: C.navyDeep },
  });
  slide.addText("How MediZyra responds in this demo", {
    x: 1.0,
    y: 4.02,
    w: 3.4,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 21,
    bold: true,
    color: C.white,
    margin: 0,
  });
  addBulletList(slide, [
    "Local MongoDB database keeps records available without internet access.",
    "Role-based workflows continue through patient, admin, and doctor portals on a single local machine.",
    "Appointment data persists across restarts, supporting continuity during rehearsals or outages.",
    "The design demonstrates resilience thinking for hospitals: continue essential operations even when connected systems become risky or unavailable.",
  ], {
    x: 1.0,
    y: 4.45,
    w: 10.9,
    h: 1.6,
    fontSize: 12.2,
    color: "EAF5FF",
    bulletColor: C.gold,
    gap: 0.43,
  });
  addFooter(slide, 3);
}

// Slide 4: Architecture
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "Solution Design", title: "Offline-first architecture for a hospital operations demo" });
  slide.addText("The project is intentionally designed to work on a local machine: UI, API, and database all stay inside the demo environment.", {
    x: 0.72,
    y: 1.15,
    w: 8.4,
    h: 0.42,
    fontFace: "Aptos",
    fontSize: 14,
    color: C.softInk,
    margin: 0,
  });

  addStatusBox(slide, { x: 0.9, y: 2.05, label: "Patient", color: C.teal });
  addStatusBox(slide, { x: 0.9, y: 3.0, label: "Admin", color: C.blue });
  addStatusBox(slide, { x: 0.9, y: 3.95, label: "Doctor", color: C.navy });
  slide.addText("Role-based web portals", {
    x: 0.84,
    y: 4.8,
    w: 2.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 11,
    color: C.softInk,
    align: "center",
    margin: 0,
  });

  arrow(slide, 3.05, 3.15, 0.75, 0.4, C.aqua);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.78,
    y: 2.38,
    w: 2.65,
    h: 1.8,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("Local React + Vite frontend", {
    x: 4.02,
    y: 2.7,
    w: 2.1,
    h: 0.38,
    fontFace: "Georgia",
    fontSize: 18,
    bold: true,
    color: C.navyDeep,
    align: "center",
    margin: 0,
  });
  slide.addText("Runs in the browser but serves a local hospital workflow only.", {
    x: 4.06,
    y: 3.28,
    w: 2.0,
    h: 0.45,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: C.ink,
    align: "center",
    margin: 0,
  });

  arrow(slide, 6.55, 3.15, 0.75, 0.4, C.aqua);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.27,
    y: 2.38,
    w: 2.65,
    h: 1.8,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("Local Express API", {
    x: 7.52,
    y: 2.7,
    w: 2.15,
    h: 0.38,
    fontFace: "Georgia",
    fontSize: 18,
    bold: true,
    color: C.navyDeep,
    align: "center",
    margin: 0,
  });
  slide.addText("Handles authentication, triage updates, doctor notes, and role checks.", {
    x: 7.53,
    y: 3.28,
    w: 2.1,
    h: 0.45,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: C.ink,
    align: "center",
    margin: 0,
  });

  arrow(slide, 10.02, 3.15, 0.75, 0.4, C.aqua);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.75,
    y: 2.38,
    w: 1.8,
    h: 1.8,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, pt: 1.2 },
  });
  slide.addText("Local MongoDB", {
    x: 10.95,
    y: 2.7,
    w: 1.4,
    h: 0.38,
    fontFace: "Georgia",
    fontSize: 16,
    bold: true,
    color: C.navyDeep,
    align: "center",
    margin: 0,
  });
  slide.addText("Persistent demo records", {
    x: 10.94,
    y: 3.28,
    w: 1.42,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 9.8,
    color: C.ink,
    align: "center",
    margin: 0,
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 5.45,
    w: 11.45,
    h: 0.72,
    rectRadius: 0.06,
    fill: { color: C.pale },
    line: { color: C.line, pt: 1 },
  });
  slide.addText("Security idea for the demo: keep the operational loop local, reduce unnecessary external dependency, and preserve continuity even if internet-connected environments become unsafe or unavailable.", {
    x: 1.22,
    y: 5.68,
    w: 11.0,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 11.7,
    color: C.navy,
    margin: 0,
  });
  addFooter(slide, 4);
}

// Slide 5: Patient portal
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "User Roles", title: "Patient portal: request care and track the treatment journey" });
  slide.addImage({ path: hospitalDiscussionImage, x: 8.55, y: 1.15, w: 3.95, h: 5.35 });
  slide.addText("Main patient powers", {
    x: 0.78,
    y: 1.28,
    w: 2.5,
    h: 0.3,
    fontFace: "Georgia",
    fontSize: 21,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "Sign in with a patient account or self-register locally.",
    "Browse specialists and inspect doctor profiles before booking.",
    "Choose date, slot, consultation mode, and symptoms while raising a request.",
    "View appointment history, admin intake notes, doctor notes, prescriptions, and follow-up plans.",
    "See only meaningful upcoming visits: requested and confirmed slots, not cancelled or completed ones.",
  ], {
    x: 0.86,
    y: 1.82,
    w: 6.8,
    h: 2.9,
    fontSize: 13.1,
    gap: 0.58,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: 5.2,
    w: 7.2,
    h: 1.15,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, pt: 1 },
  });
  slide.addText("Patient value", {
    x: 1.06,
    y: 5.48,
    w: 1.3,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: C.teal,
    margin: 0,
  });
  slide.addText("The patient gets a simple journey: request care, wait for triage, attend the visit, and keep a clean digital record of what happened next.", {
    x: 1.06,
    y: 5.72,
    w: 6.55,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 11.4,
    color: C.ink,
    margin: 0,
  });
  addFooter(slide, 5);
}

// Slide 6: Admin portal
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "User Roles", title: "Admin portal: coordinate triage and control hospital-side setup" });
  addPortalCard(slide, {
    x: 0.78,
    y: 1.35,
    w: 3.82,
    title: "Triage board",
    subtitle: "Admin handles queue coordination and editable request details.",
    bullets: [
      "Review patient requests with contact details, reason, and symptoms.",
      "Edit date, slot, consultation mode, and intake note, then save those changes to the local database.",
      "Confirm requested appointments.",
      "Cancel requested or confirmed appointments when needed.",
    ],
    accent: C.blue,
    iconText: "A",
  });
  addPortalCard(slide, {
    x: 4.75,
    y: 1.35,
    w: 3.82,
    title: "Admin controls",
    subtitle: "Separated control page for setup and communication workflows.",
    bullets: [
      "Manage specialist profiles, fees, availability, contact details, and portal-linked doctor accounts.",
      "Review patient messages in the support inbox.",
      "Maintain a cleaner separation between triage work and configuration work.",
      "Keep the demo organized for presentation and evaluation.",
    ],
    accent: C.teal,
    iconText: "C",
  });
  addPortalCard(slide, {
    x: 8.72,
    y: 1.35,
    w: 3.82,
    title: "Admin limits",
    subtitle: "Role hierarchy protects clinical ownership and prevents bad state changes.",
    bullets: [
      "Admin cannot complete a consultation.",
      "Admin cannot cancel an appointment after it has already been completed.",
      "Admin edits are allowed only while a request is still operationally active.",
      "This mirrors better real-world control discipline inside care systems.",
    ],
    accent: C.navy,
    iconText: "L",
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1,
    y: 5.65,
    w: 11.0,
    h: 0.55,
    rectRadius: 0.05,
    fill: { color: C.navyDeep },
    line: { color: C.navyDeep },
  });
  slide.addText("Admin role in one line: coordinate the patient queue, keep records current, and prepare the case for the doctor without taking over clinical closure.", {
    x: 1.32,
    y: 5.82,
    w: 10.5,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 11.2,
    color: C.white,
    align: "center",
    margin: 0,
  });
  addFooter(slide, 6);
}

// Slide 7: Doctor portal
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "User Roles", title: "Doctor portal: clinical ownership begins after triage" });
  slide.addImage({ path: doctorPatientImage, x: 8.55, y: 1.05, w: 3.92, h: 5.48 });
  slide.addText("Main doctor powers", {
    x: 0.82,
    y: 1.25,
    w: 2.8,
    h: 0.3,
    fontFace: "Georgia",
    fontSize: 21,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "See only the appointments assigned to the signed-in doctor.",
    "Confirm a requested visit when the doctor is ready to take it forward.",
    "Mark a confirmed visit as completed only after entering a consultation summary.",
    "Add prescription items and a follow-up date as part of the completion flow.",
    "Doctor cannot cancel completed cases, preserving logical record integrity.",
  ], {
    x: 0.9,
    y: 1.82,
    w: 6.9,
    h: 3.0,
    fontSize: 13.1,
    gap: 0.58,
    bulletColor: C.blue,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.86,
    y: 5.25,
    w: 7.2,
    h: 1.08,
    rectRadius: 0.05,
    fill: { color: C.white },
    line: { color: C.line, pt: 1 },
  });
  slide.addText("Doctor value", {
    x: 1.08,
    y: 5.48,
    w: 1.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0,
  });
  slide.addText("The doctor becomes the clinical finisher of the workflow, which is why only the doctor can move a case from confirmed to completed.", {
    x: 1.08,
    y: 5.72,
    w: 6.55,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 11.4,
    color: C.ink,
    margin: 0,
  });
  addFooter(slide, 7);
}

// Slide 8: Lifecycle
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "Workflow Logic", title: "Appointment lifecycle and role hierarchy" });
  slide.addText("The project now enforces a clearer real-world power structure for status changes.", {
    x: 0.78,
    y: 1.18,
    w: 7.2,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 14,
    color: C.softInk,
    margin: 0,
  });

  addStatusBox(slide, { x: 0.95, y: 2.2, label: "Requested", color: C.gold, textColor: C.navyDeep });
  arrow(slide, 3.22, 2.33, 0.72, 0.38, C.aqua);
  addStatusBox(slide, { x: 4.0, y: 2.2, label: "Confirmed", color: C.blue });
  arrow(slide, 6.28, 2.33, 0.72, 0.38, C.aqua);
  addStatusBox(slide, { x: 7.05, y: 2.2, label: "Completed", color: C.green });

  slide.addShape(pptx.ShapeType.line, {
    x: 5.0,
    y: 2.88,
    w: 0,
    h: 1.05,
    line: { color: C.red, pt: 2.2, beginArrowType: "none", endArrowType: "triangle" },
  });
  addStatusBox(slide, { x: 3.98, y: 4.02, label: "Cancelled", color: C.red });

  slide.addText("Admin or Doctor", {
    x: 2.85,
    y: 1.8,
    w: 1.55,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: C.softInk,
    align: "center",
    margin: 0,
  });
  slide.addText("Doctor only", {
    x: 5.96,
    y: 1.8,
    w: 1.1,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: C.softInk,
    align: "center",
    margin: 0,
  });
  slide.addText("Admin only\n(from requested or confirmed)", {
    x: 4.38,
    y: 3.15,
    w: 1.25,
    h: 0.44,
    fontFace: "Aptos",
    fontSize: 9.5,
    color: C.softInk,
    align: "center",
    margin: 0,
  });

  addBulletList(slide, [
    "Requested -> Confirmed can be done by admin or doctor.",
    "Confirmed -> Completed can be done only by the doctor handling the patient.",
    "Requested/Confirmed -> Cancelled can be done only by admin.",
    "Completed appointments are locked from illogical cancellation or re-triage.",
    "Cancelled appointments do not count as upcoming visits in patient view.",
  ], {
    x: 0.95,
    y: 5.0,
    w: 11.1,
    h: 1.4,
    fontSize: 12.5,
    gap: 0.33,
    bulletColor: C.teal,
  });
  addFooter(slide, 8);
}

// Slide 9: Benefits and future scope
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "Outcome", title: "What this demo proves and where it can go next" });
  slide.addImage({ path: hospitalDiscussionImage, x: 7.95, y: 1.18, w: 4.6, h: 5.0 });
  slide.addText("Current strengths", {
    x: 0.82,
    y: 1.35,
    w: 2.2,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 21,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "Runs locally with persistent data, so the demo remains usable without internet dependence.",
    "Shows clear separation of responsibility across patient, admin, and doctor workflows.",
    "Applies status rules that better reflect real hospital process control.",
    "Useful as an academic demonstration of cyber resilience, continuity planning, and secure workflow thinking.",
  ], {
    x: 0.88,
    y: 1.82,
    w: 6.4,
    h: 2.2,
    fontSize: 12.9,
    gap: 0.52,
  });
  slide.addText("Possible next enhancements", {
    x: 0.82,
    y: 4.45,
    w: 3.1,
    h: 0.28,
    fontFace: "Georgia",
    fontSize: 21,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "Add encrypted local backups and recovery snapshots.",
    "Introduce audit logs for every role-driven change.",
    "Support offline export of appointment summaries for continuity packs.",
    "Extend the project into a fuller cybersecurity-aware hospital operations platform.",
  ], {
    x: 0.88,
    y: 4.92,
    w: 6.4,
    h: 1.5,
    fontSize: 12.3,
    gap: 0.37,
    bulletColor: C.gold,
  });
  addFooter(slide, 9);
}

// Slide 10: References
{
  const slide = pptx.addSlide();
  addSlideBase(slide, { kicker: "References", title: "Sources and image credits" });
  slide.addText("Cybersecurity and healthcare references", {
    x: 0.82,
    y: 1.25,
    w: 4.0,
    h: 0.25,
    fontFace: "Georgia",
    fontSize: 19,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "National Audit Office. Investigation: WannaCry cyber attack and the NHS. https://www.nao.org.uk/reports/investigation-wannacry-cyber-attack-and-the-nhs/",
    "HHS ASPR. Cybersecurity in Health Care: Protecting Patients from Attacks. https://aspr.hhs.gov/cyber/Pages/default.aspx",
    "CISA. Stop Ransomware. https://www.cisa.gov/Ransomware",
  ], {
    x: 0.9,
    y: 1.72,
    w: 11.8,
    h: 1.5,
    fontSize: 11.4,
    gap: 0.55,
  });
  slide.addText("Image credits", {
    x: 0.82,
    y: 4.05,
    w: 2.0,
    h: 0.25,
    fontFace: "Georgia",
    fontSize: 19,
    bold: true,
    color: C.navyDeep,
    margin: 0,
  });
  addBulletList(slide, [
    "Doctor-patient image: RDNE Stock Project / Pexels",
    "Cyber monitoring image: Tima Miroshnichenko / Pexels",
    "Hospital discussion image: OfficialDesign Africa / Pexels",
    "Project logo used from the local MediZyra workspace assets",
  ], {
    x: 0.9,
    y: 4.52,
    w: 7.2,
    h: 1.3,
    fontSize: 11.8,
    gap: 0.4,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.45,
    y: 4.35,
    w: 3.8,
    h: 1.4,
    rectRadius: 0.06,
    fill: { color: C.navyDeep },
    line: { color: C.navyDeep },
  });
  slide.addText("Student details can be filled before submission.\nThe deck is designed for direct classroom presentation.", {
    x: 8.72,
    y: 4.75,
    w: 3.25,
    h: 0.55,
    fontFace: "Aptos",
    fontSize: 11.2,
    color: C.white,
    align: "center",
    margin: 0,
  });
  addFooter(slide, 10);
}

await pptx.writeFile({ fileName: outputPath });
console.log(`Presentation created at: ${outputPath}`);
