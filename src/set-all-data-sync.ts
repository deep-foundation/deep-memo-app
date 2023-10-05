import { CapacitorStoreKeys } from "./capacitor-store-keys";
import { Preferences } from "@capacitor/preferences";
import {checkPermissions as checkGeolocationPermissions} from '@deep-foundation/capacitor-geolocation'
import {checkVoiceRecorderPermissions} from '@deep-foundation/capacitor-voice-recorder'

export async function setAllDataSync(toggle: boolean) {

  const packages = [
    {
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled],
      // TODO: Check permissions
      arePermissionsGranted: true,
    },
    {
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled],
      arePermissionsGranted: await checkGeolocationPermissions(),
    },
    { 
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
      // TODO: Check permissions
      arePermissionsGranted: true,
    },
    {
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSyncEnabled],
      arePermissionsGranted: true,
    },
    {
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled],
      arePermissionsGranted: await checkVoiceRecorderPermissions(),
    },
    {
      storeKey: CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
      arePermissionsGranted: true,
    },
  ]

  await Promise.all(
    packages.map(async (_package) =>
      _package.arePermissionsGranted ? Preferences.set({ key: _package.storeKey, value: JSON.stringify(toggle) }) : undefined
    )
  );
}
