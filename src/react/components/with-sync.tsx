import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { NetworkStatus } from "@deep-foundation/capacitor-network";
import {
  GeolocationDecorator,
  createGeolocationDecorator,
} from "@deep-foundation/capacitor-geolocation";
import { WithPositionWatch } from "@deep-foundation/capacitor-geolocation/dist/react/components/with-position-watch";
import { saveAllCallHistory } from "../../callhistory/callhistory";
import { WithMotionSync } from "@deep-foundation/capacitor-motion";
import { DecoratedDeep } from "./with-decorated-deep";

export function WithSync({
  deep,
  deviceLinkId,
  isContactsSyncEnabled,
  lastContactsSyncTime,
  isCallHistorySyncEnabled,
  lastCallHistorySyncTime,
  isNetworkSyncEnabled: isNetworkSyncEnabled,
  isVoiceRecorderEnabled,
  onLastContactsSyncTimeChange,
  onLastCallHistorySyncTimeChange,
  isMotionSyncEnabled,
  isGeolocationSyncEnabled,
  children,
}: {
  deep: DecoratedDeep;
  deviceLinkId: number;
  isContactsSyncEnabled: boolean;
  lastContactsSyncTime: number;
  isCallHistorySyncEnabled: boolean;
  lastCallHistorySyncTime: number;
  isNetworkSyncEnabled: boolean;
  isVoiceRecorderEnabled: boolean;
  onLastContactsSyncTimeChange: (currentTime: number) => void;
  onLastCallHistorySyncTimeChange: (currentTime: number) => void;
  isMotionSyncEnabled: boolean;
  isGeolocationSyncEnabled: boolean;
  children?: JSX.Element;
}) {
  const toast = useToast();

  useEffect(() => {
    new Promise(async () => {
      const currentTime = new Date().getTime();
      if (isContactsSyncEnabled) {
        if (currentTime - lastContactsSyncTime) {
          try {
            // TODO
            // await saveAllContacts({ deep, deviceLinkId });
            // onLastContactsSyncTimeChange(currentTime);
            // toast({
            //   title: "Contacts synchronized successfully",
            //   status: "success",
            //   duration: 5000,
            //   isClosable: true,
            // });
          } catch (error) {
            toast({
              title: "Failed to synchronize contacts",
              description: error.message,
              status: "error",
              duration: null,
              isClosable: true,
            });
          }
        }
      }
      if (isCallHistorySyncEnabled) {
        if (currentTime - lastCallHistorySyncTime) {
          try {
            await saveAllCallHistory({ deep, deviceLinkId });
            onLastCallHistorySyncTimeChange(currentTime);
            toast({
              title: "Call history synchronized successfully",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } catch (error) {
            toast({
              title: "Failed to synchronize call history",
              description: error.message,
              status: "error",
              duration: null,
              isClosable: true,
            });
          }
        }
      }
      if (isNetworkSyncEnabled) {
        // TODO
      }
      if (isVoiceRecorderEnabled) {
        // const startTime = await Recorder.startRecording()
        // const timeout = setTimeout(async () => {
        //   await Recorder.stopRecording({
        //     deep,
        //     containerLinkId: deep.linkId!,
        //   })
        // }, 1*60*1000)
        // returnFn = () => {
        //   clearTimeout(timeout)
        // }
      }
    });
  });

  return (
    <>
      {
        isMotionSyncEnabled && <WithMotionSync deep={deep} containerLinkId={deviceLinkId}/>
      }
      {
        isNetworkSyncEnabled && <NetworkStatus deep={deep} containerLinkId={deviceLinkId} />
      }
      {
        isGeolocationSyncEnabled && <WithPositionWatch containerLinkId={deviceLinkId} deep={deep}/>
      }
      {
        // isVoiceRecorderEnabled && <VoiceRecorder deep={deep} containerLinkId={deviceLinkId} />
      }
      {
        children
      }
    </>
  );
}
