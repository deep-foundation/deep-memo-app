import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { NetworkStatus } from "@deep-foundation/capacitor-network";
import {
  GeolocationDecorator,
  createGeolocationDecorator,
} from "@deep-foundation/capacitor-geolocation";
import { WithPositionSync } from "@deep-foundation/capacitor-geolocation/dist/react/components/with-position-sync";
import { saveAllCallHistory } from "../../callhistory/callhistory";
import { WithMotionSync } from "@deep-foundation/capacitor-motion";
import { WithRecording } from "@deep-foundation/capacitor-voice-recorder";
import { DecoratedDeep } from "./with-decorated-deep";
import { packageLog } from "../../package-log";
import { ErrorAlert } from "./error-alert";
import {WithContactsSync} from '@deep-foundation/capacitor-contact'

export function WithSync(options: {
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
  const log = packageLog.extend(WithSync.name)
  log({options})
  const {
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
  } = options;
  const toast = useToast();

  useEffect(() => {
    new Promise(async () => {
      const currentTime = new Date().getTime();
      // if (isContactsSyncEnabled) {
      //   if (currentTime - lastContactsSyncTime) {
      //     try {
      //       // TODO
      //       // await saveAllContacts({ deep, deviceLinkId });
      //       // onLastContactsSyncTimeChange(currentTime);
      //       // toast({
      //       //   title: "Contacts synchronized successfully",
      //       //   status: "success",
      //       //   duration: 5000,
      //       //   isClosable: true,
      //       // });
      //     } catch (error) {
      //       toast({
      //         title: "Failed to synchronize contacts",
      //         description: error.message,
      //         status: "error",
      //         duration: null,
      //         isClosable: true,
      //       });
      //     }
      //   }
      // }
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
        // isMotionSyncEnabled && <WithMotionSync deep={deep} containerLinkId={deviceLinkId}/>
      }
      {
        // isNetworkSyncEnabled && <NetworkStatus deep={deep} containerLinkId={deviceLinkId} />
      }
      {
        // isGeolocationSyncEnabled && <WithPositionSync containerLinkId={deviceLinkId} deep={deep}/>
      }
      {
        // isVoiceRecorderEnabled && <WithRecording deep={deep} containerLinkId={deviceLinkId} savingIntervalInMs={10*1000} renderIfError={(error) => (
        //   <ErrorAlert title={error instanceof Error ? error.message : JSON.stringify(error)}/>
        // )} />
      }
      {
        isContactsSyncEnabled && <WithContactsSync deep={deep} containerLinkId={deviceLinkId} />
      }
      {
        children
      }
    </>
  );
}
