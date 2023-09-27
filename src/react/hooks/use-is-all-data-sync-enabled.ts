import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";

export function useIsAllDataSyncEnabled() {
  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
const [lastContactsSyncTime, setLastContactsSyncTime] = useLocalStore<
  number | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime], undefined);
const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled], undefined);
const [lastCallHistorySyncTime, setLastCallHistorySyncTime] = useLocalStore<
  number | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime], undefined);
const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled], false);
const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled], undefined);
const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled], undefined);
const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled], undefined);

const isAllDataSyncEnabled =
  isContactsSyncEnabled &&
  lastContactsSyncTime &&
  isCallHistorySyncEnabled &&
  lastCallHistorySyncTime &&
  isNetworkSyncEnabled &&
  isVoiceRecorderEnabled &&
  isMotionSyncEnabled &&
  isGeolocationSyncEnabled;

  return isAllDataSyncEnabled;
}