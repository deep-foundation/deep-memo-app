import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { packageLog } from "../../package-log";

export function useIsAllDataSyncEnabled() {
  const log = packageLog.extend(useIsAllDataSyncEnabled.name);
  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
  log({ isContactsSyncEnabled, setIsContactsSyncEnabled });
  const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled], undefined);
  log({ isCallHistorySyncEnabled, setIsCallHistorySyncEnabled });
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSyncEnabled], false);
  log({ isNetworkSyncEnabled, setIsNetworkSyncEnabled });
  const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled], undefined);
  log({ isVoiceRecorderEnabled, setIsVoiceRecorderEnabled });
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled], undefined);
  log({ isMotionSyncEnabled, setIsMotionSyncEnabled });
  const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled], undefined);
  log({ isGeolocationSyncEnabled, setIsGeolocationSyncEnabled });

  const isAllDataSyncEnabled =
    isContactsSyncEnabled &&
    isCallHistorySyncEnabled &&
    isNetworkSyncEnabled &&
    isVoiceRecorderEnabled &&
    isMotionSyncEnabled &&
    isGeolocationSyncEnabled;
  log({ isAllDataSyncEnabled });

  return isAllDataSyncEnabled;
}
