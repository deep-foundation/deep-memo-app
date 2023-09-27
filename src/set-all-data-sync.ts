import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "./capacitor-store-keys";

export function setAllDataSync(toggle: boolean) {
  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useLocalStore<
  boolean | undefined
>(CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled], undefined);
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

setIsContactsSyncEnabled(toggle);
setIsCallHistorySyncEnabled(toggle);
setIsNetworkSyncEnabled(toggle);
setIsVoiceRecorderEnabled(toggle);
setIsMotionSyncEnabled(toggle);
setIsGeolocationSyncEnabled(toggle);
}