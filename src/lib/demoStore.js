import { doctorCatalog, seedAppointments, seedUsers } from "../data/siteData";

export const APP_STATE_KEY = "medizyra:hms-state:v1";
export const SESSION_KEY = "medizyra:session:v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeById(seedItems, storedItems = []) {
  const merged = new Map(seedItems.map((item) => [item.id, item]));

  storedItems.forEach((item) => {
    merged.set(item.id, { ...merged.get(item.id), ...item });
  });

  return Array.from(merged.values());
}

export function createSeedState() {
  return {
    users: clone(seedUsers),
    doctors: clone(doctorCatalog),
    appointments: clone(seedAppointments),
    contactMessages: [],
  };
}

export function readStoredState() {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  try {
    const raw = window.localStorage.getItem(APP_STATE_KEY);
    if (!raw) {
      return createSeedState();
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.users || !parsed?.doctors || !parsed?.appointments) {
      return createSeedState();
    }

    return {
      users: mergeById(seedUsers, parsed.users),
      doctors: mergeById(doctorCatalog, parsed.doctors),
      appointments: mergeById(seedAppointments, parsed.appointments),
      contactMessages: parsed.contactMessages ?? [],
    };
  } catch {
    return createSeedState();
  }
}

export function writeStoredState(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

export function readStoredSession() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SESSION_KEY) ?? "";
}

export function writeStoredSession(userId) {
  if (typeof window === "undefined") {
    return;
  }

  if (userId) {
    window.localStorage.setItem(SESSION_KEY, userId);
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export function resetStoredDemo() {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  const seed = createSeedState();
  window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(seed));
  window.localStorage.removeItem(SESSION_KEY);
  return seed;
}
