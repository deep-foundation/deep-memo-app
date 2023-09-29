import { CapacitorStoreKeys } from "./capacitor-store-keys";

export function setAllDataSync(toggle: boolean) {
  const allKeys = [
    CapacitorStoreKeys.IsContactsSyncEnabled,
    CapacitorStoreKeys.IsCallHistorySyncEnabled,
    CapacitorStoreKeys.IsNetworkSubscriptionEnabled,
    CapacitorStoreKeys.IsVoiceRecorderEnabled,
    CapacitorStoreKeys.IsMotionSyncEnabled,
    CapacitorStoreKeys.IsGeolocationSyncEnabled,
  ];

  allKeys.forEach((key) => {
    localStorage.setItem(CapacitorStoreKeys[key], JSON.stringify(toggle));
  });
}
