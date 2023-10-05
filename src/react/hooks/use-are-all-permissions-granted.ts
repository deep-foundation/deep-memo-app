import { useGeolocationPermissionsStatus } from "@deep-foundation/capacitor-geolocation";
import { useMotionPermissionsStatus } from "@deep-foundation/capacitor-motion";

export function useAreAllPermissionsGranted() {
  const geolocationStatus = useGeolocationPermissionsStatus();
  const motionStatus = useMotionPermissionsStatus();

  return (
    geolocationStatus.permissionsStatus?.coarseLocation === "granted" &&
    geolocationStatus.permissionsStatus?.location === "granted" &&
    motionStatus === "granted"
  );
}
