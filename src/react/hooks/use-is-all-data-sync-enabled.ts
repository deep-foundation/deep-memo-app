import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { packageLog } from "../../package-log";

export function useIsAllDataSyncEnabled() {
  const log = packageLog.extend(useIsAllDataSyncEnabled.name);
  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
  log({ isContactsSyncEnabled, setIsContactsSyncEnabled });
  const [lastContactsSyncTime, setLastContactsSyncTime] = useLocalStore<
    number | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime], undefined);
  log({ lastContactsSyncTime, setLastContactsSyncTime });
  const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled], undefined);
  log({ isCallHistorySyncEnabled, setIsCallHistorySyncEnabled });
  const [lastCallHistorySyncTime, setLastCallHistorySyncTime] = useLocalStore<
    number | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime], undefined);
  log({ lastCallHistorySyncTime, setLastCallHistorySyncTime });
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled], false);
  log({ isNetworkSyncEnabled, setIsNetworkSyncEnabled });
  const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled], undefined);
  log({ isVoiceRecorderEnabled, setIsVoiceRecorderEnabled });
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled], undefined);
  log({ isMotionSyncEnabled, setIsMotionSyncEnabled });
  const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] = useLocalStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled], undefined);
  log({ isGeolocationSyncEnabled, setIsGeolocationSyncEnabled });

  const isAllDataSyncEnabled =
    isContactsSyncEnabled &&
    lastContactsSyncTime &&
    isCallHistorySyncEnabled &&
    lastCallHistorySyncTime &&
    isNetworkSyncEnabled &&
    isVoiceRecorderEnabled &&
    isMotionSyncEnabled &&
    isGeolocationSyncEnabled;
  log({ isAllDataSyncEnabled });

  return isAllDataSyncEnabled;
}
