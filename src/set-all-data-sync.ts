import { CapacitorStoreKeys } from "./capacitor-store-keys";
import { Preferences } from "@capacitor/preferences";

export async function setAllDataSync(toggle: boolean) {
  const allKeys = [
    CapacitorStoreKeys.IsContactsSyncEnabled,
    CapacitorStoreKeys.IsCallHistorySyncEnabled,
    CapacitorStoreKeys.IsNetworkSubscriptionEnabled,
    CapacitorStoreKeys.IsVoiceRecorderEnabled,
    CapacitorStoreKeys.IsMotionSyncEnabled,
    CapacitorStoreKeys.IsGeolocationSyncEnabled,
  ];

  await Promise.all(
    allKeys.map(async (key) =>
      Preferences.set({
        key: CapacitorStoreKeys[key],
        value: JSON.stringify(toggle),
      })
    )
  );
}
