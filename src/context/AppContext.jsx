import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { attachDoctorPhotos } from "../lib/doctorMedia";
import { createSeedState, readStoredSession, writeStoredSession } from "../lib/demoStore";
import { AppContext } from "./useAppContext";

const EMPTY_STATE = {
  appointments: [],
  contactMessages: [],
  doctors: [],
  users: [],
};

function normalizeAppState(state) {
  return {
    appointments: state?.appointments ?? [],
    contactMessages: state?.contactMessages ?? [],
    doctors: attachDoctorPhotos(state?.doctors ?? []),
    users: state?.users ?? [],
  };
}

function asErrorMessage(error) {
  return error instanceof Error ? error.message : "The care workspace could not complete that request.";
}

export function AppProvider({ children }) {
  const [appState, setAppState] = useState(EMPTY_STATE);
  const [sessionUserId, setSessionUserId] = useState(readStoredSession);
  const [isHydrating, setIsHydrating] = useState(true);
  const [backendError, setBackendError] = useState("");

  const refreshAppState = useCallback(async ({ allowSeedFallback = false } = {}) => {
    try {
      const state = await api.getAppState();
      setAppState(normalizeAppState(state));
      setBackendError("");
      return { ok: true, state };
    } catch (error) {
      const message = asErrorMessage(error);

      if (allowSeedFallback) {
        setAppState(normalizeAppState(createSeedState()));
      }

      setBackendError(message);
      return { ok: false, error: message };
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    void refreshAppState({ allowSeedFallback: true });
  }, [refreshAppState]);

  useEffect(() => {
    writeStoredSession(sessionUserId);
  }, [sessionUserId]);

  const currentUser =
    appState.users.find((user) => user.id === sessionUserId) ?? null;

  const login = useCallback(async ({ email, password }) => {
    try {
      const result = await api.login({ email, password });
      setSessionUserId(result.user.id);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: asErrorMessage(error),
      };
    }
  }, []);

  const logout = useCallback(async () => {
    setSessionUserId("");
    return { ok: true };
  }, []);

  const registerPatient = useCallback(
    async (form) => {
      try {
        const result = await api.registerPatient(form);
        setSessionUserId(result.user.id);
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState],
  );

  const bookAppointment = useCallback(
    async (form) => {
      try {
        const result = await api.bookAppointment({
          actorUserId: sessionUserId,
          ...form,
        });
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState, sessionUserId],
  );

  const updateAppointmentByAdmin = useCallback(
    async ({
      adminSummary,
      appointmentDate,
      appointmentId,
      appointmentSlot,
      consultationMode,
      status,
    }) => {
      try {
        const result = await api.updateAppointmentByAdmin(appointmentId, {
          actorUserId: sessionUserId,
          adminSummary,
          appointmentDate,
          appointmentSlot,
          consultationMode,
          status,
        });
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState, sessionUserId],
  );

  const completeAppointmentByDoctor = useCallback(
    async ({
      appointmentId,
      doctorSummary,
      followUpDate,
      prescriptionItems,
    }) => {
      try {
        const result = await api.completeAppointmentByDoctor(appointmentId, {
          actorUserId: sessionUserId,
          doctorSummary,
          followUpDate,
          prescriptionItems,
        });
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState, sessionUserId],
  );

  const submitContactMessage = useCallback(
    async (form) => {
      try {
        const result = await api.submitContactMessage({
          actorUserId: sessionUserId,
          ...form,
        });
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState, sessionUserId],
  );

  const saveDoctorProfile = useCallback(
    async (form) => {
      try {
        const result = await api.saveDoctorProfile({
          actorUserId: sessionUserId,
          form,
        });
        await refreshAppState();
        return result;
      } catch (error) {
        return {
          ok: false,
          error: asErrorMessage(error),
        };
      }
    },
    [refreshAppState, sessionUserId],
  );

  const resetDemoData = useCallback(async () => {
    try {
      const result = await api.resetDemoData();
      setSessionUserId("");
      await refreshAppState({ allowSeedFallback: true });
      return result;
    } catch (error) {
      return {
        ok: false,
        error: asErrorMessage(error),
      };
    }
  }, [refreshAppState]);

  const value = useMemo(
    () => ({
      appointmentCount: appState.appointments.length,
      appointments: appState.appointments,
      backendError,
      bookAppointment,
      completeAppointmentByDoctor,
      contactMessages: appState.contactMessages,
      currentUser,
      doctors: appState.doctors,
      isHydrating,
      login,
      logout,
      refreshAppState,
      registerPatient,
      resetDemoData,
      saveDoctorProfile,
      submitContactMessage,
      updateAppointmentByAdmin,
      users: appState.users,
    }),
    [
      appState.appointments,
      appState.contactMessages,
      appState.doctors,
      appState.users,
      backendError,
      bookAppointment,
      completeAppointmentByDoctor,
      currentUser,
      isHydrating,
      login,
      logout,
      refreshAppState,
      registerPatient,
      resetDemoData,
      saveDoctorProfile,
      submitContactMessage,
      updateAppointmentByAdmin,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
