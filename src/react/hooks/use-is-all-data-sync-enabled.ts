import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { packageLog } from "../../package-log";

export function useIsAllDataSyncEnabled() {
  const log = packageLog.extend(useIsAllDataSyncEnabled.name);
  const {value: isContactsSyncEnabled, setValue: setIsContactsSyncEnabled} = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
  log({ isContactsSyncEnabled, setIsContactsSyncEnabled });
  const {value: lastContactsSyncTime, setValue: setLastContactsSyncTime} = useCapacitorStore<
    number | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime], undefined);
  log({ lastContactsSyncTime, setLastContactsSyncTime });
  const {value: isCallHistorySyncEnabled, setValue: setIsCallHistorySyncEnabled} = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled], undefined);
  log({ isCallHistorySyncEnabled, setIsCallHistorySyncEnabled });
  const {value: lastCallHistorySyncTime, setValue: setLastCallHistorySyncTime} = useCapacitorStore<
    number | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime], undefined);
  log({ lastCallHistorySyncTime, setLastCallHistorySyncTime });
  const {value: isNetworkSyncEnabled, setValue: setIsNetworkSyncEnabled} = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled], false);
  log({ isNetworkSyncEnabled, setIsNetworkSyncEnabled });
  const {value: isVoiceRecorderEnabled, setValue: setIsVoiceRecorderEnabled} = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled], undefined);
  log({ isVoiceRecorderEnabled, setIsVoiceRecorderEnabled });
  const {value: isMotionSyncEnabled, setValue: setIsMotionSyncEnabled} = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled], undefined);
  log({ isMotionSyncEnabled, setIsMotionSyncEnabled });
  const {value: isGeolocationSyncEnabled, setValue: setIsGeolocationSyncEnabled} = useCapacitorStore<
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
