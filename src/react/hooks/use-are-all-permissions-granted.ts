import { useGeolocationPermissionsStatus } from "@deep-foundation/capacitor-geolocation";
import { useMotionPermissionsStatus } from "@deep-foundation/capacitor-motion";

export function useAreAllPermissionsGranted() {
  const geolocationStatus = useGeolocationPermissionsStatus();
  const motionStatus = useMotionPermissionsStatus();

  return (
    geolocationStatus.coarseLocation === "granted" &&
    geolocationStatus.location === "granted" &&
    motionStatus === "granted"
  );
}
