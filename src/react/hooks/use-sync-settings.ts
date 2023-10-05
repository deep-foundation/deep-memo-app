import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { packageLog } from "../../package-log";

export function useSyncSettings() {
  const log = packageLog.extend(useSyncSettings.name);

  const [
    isContactsSyncEnabled,
    setIsContactsSyncEnabled,
    unsetContactsSync,
    isContactsSyncLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled],
    undefined
  );
  log({
    isContactsSyncEnabled,
    setIsContactsSyncEnabled,
    unsetContactsSync,
    isContactsSyncLoading,
  });

  const [
    lastContactsSyncTime,
    setLastContactsSyncTime,
    unsetLastContactsSync,
    isLastContactsSyncLoading,
  ] = useCapacitorStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime],
    undefined
  );
  log({
    lastContactsSyncTime,
    setLastContactsSyncTime,
    unsetLastContactsSync,
    isLastContactsSyncLoading,
  });

  const [
    isCallHistorySyncEnabled,
    setIsCallHistorySyncEnabled,
    unsetCallHistorySync,
    isCallHistorySyncLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
    undefined
  );
  log({
    isCallHistorySyncEnabled,
    setIsCallHistorySyncEnabled,
    unsetCallHistorySync,
    isCallHistorySyncLoading,
  });

  const [
    lastCallHistorySyncTime,
    setLastCallHistorySyncTime,
    unsetLastCallHistorySync,
    isLastCallHistorySyncLoading,
  ] = useCapacitorStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime],
    undefined
  );
  log({
    lastCallHistorySyncTime,
    setLastCallHistorySyncTime,
    unsetLastCallHistorySync,
    isLastCallHistorySyncLoading,
  });

  const [
    isNetworkSyncEnabled,
    setIsNetworkSyncEnabled,
    unsetNetworkSync,
    isNetworkSyncLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSyncEnabled],
    false
  );
  log({
    isNetworkSyncEnabled,
    setIsNetworkSyncEnabled,
    unsetNetworkSync,
    isNetworkSyncLoading,
  });

  const [
    isVoiceRecorderEnabled,
    setIsVoiceRecorderEnabled,
    unsetVoiceRecorder,
    isVoiceRecorderLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled],
    undefined
  );
  log({
    isVoiceRecorderEnabled,
    setIsVoiceRecorderEnabled,
    unsetVoiceRecorder,
    isVoiceRecorderLoading,
  });

  const [isLoggerEnabled, setIsLoggerEnabled, unsetLogger, isLoggerLoading] =
    useCapacitorStore<boolean | undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
      undefined
    );
  log({ isLoggerEnabled, setIsLoggerEnabled, unsetLogger, isLoggerLoading });

  const [
    isMotionSyncEnabled,
    setIsMotionSyncEnabled,
    unsetMotionSync,
    isMotionSyncLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
    undefined
  );
  log({
    isMotionSyncEnabled,
    setIsMotionSyncEnabled,
    unsetMotionSync,
    isMotionSyncLoading,
  });

  const [
    isGeolocationSyncEnabled,
    setIsGeolocationSyncEnabled,
    unsetGeolocationSync,
    isGeolocationSyncLoading,
  ] = useCapacitorStore<boolean | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled],
    undefined
  );
  log({
    isGeolocationSyncEnabled,
    setIsGeolocationSyncEnabled,
    unsetGeolocationSync,
    isGeolocationSyncLoading,
  });

  const isLoading = isContactsSyncLoading ||
    isLastContactsSyncLoading ||
    isCallHistorySyncLoading ||
    isLastCallHistorySyncLoading ||
    isNetworkSyncLoading ||
    isVoiceRecorderLoading ||
    isLoggerLoading ||
    isMotionSyncLoading ||
    isGeolocationSyncLoading;
    log({isLoading})

  return {
    isContactsSyncEnabled,
    setIsContactsSyncEnabled,
    lastContactsSyncTime,
    setLastContactsSyncTime,
    isCallHistorySyncEnabled,
    setIsCallHistorySyncEnabled,
    lastCallHistorySyncTime,
    setLastCallHistorySyncTime,
    isNetworkSyncEnabled,
    setIsNetworkSyncEnabled,
    isVoiceRecorderEnabled,
    setIsVoiceRecorderEnabled,
    isLoggerEnabled,
    setIsLoggerEnabled,
    isMotionSyncEnabled,
    setIsMotionSyncEnabled,
    isGeolocationSyncEnabled,
    setIsGeolocationSyncEnabled,
    isLoading
  };
}
