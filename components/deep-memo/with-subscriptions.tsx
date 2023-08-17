import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import { saveAllCallHistory } from '../../imports/callhistory/callhistory';
import { saveAllContacts } from '../../imports/contact/contact';
import { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { WithMotionSubscription } from '@deep-foundation/capacitor-motion';
import Recorder from "@deep-foundation/capacitor-voice-recorder";

export function WithSubscriptions({
   deep, 
   deviceLinkId ,
    isContactsSyncEnabled,
    lastContactsSyncTime,
    isCallHistorySyncEnabled,
    lastCallHistorySyncTime,
    isNetworkSubscriptionEnabled,
    isVoiceRecorderEnabled,
    onLastContactsSyncTimeChange,
    onLastCallHistorySyncTimeChange,
    isMotionSyncEnabled
  }: { 
    deep: DeepClient,
     deviceLinkId: number,
      isContactsSyncEnabled: boolean,
      lastContactsSyncTime: number,
      isCallHistorySyncEnabled: boolean,
      lastCallHistorySyncTime: number,
      isNetworkSubscriptionEnabled: boolean,
      isVoiceRecorderEnabled: boolean,
      onLastContactsSyncTimeChange: (currentTime: number) => void,
      onLastCallHistorySyncTimeChange: (currentTime: number) => void,
      isMotionSyncEnabled: boolean,
     }) {
      const toast = useToast();

  useEffect(() => {
    let returnFn: () => void;
    new Promise(async () => {
      const currentTime = new Date().getTime();
      if (isContactsSyncEnabled) {
        if (currentTime - lastContactsSyncTime) {
          try {
            await saveAllContacts({ deep, deviceLinkId });
            onLastContactsSyncTimeChange(currentTime);
            toast({
              title: 'Contacts synchronized successfully',
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
          } catch (error) {
            toast({
              title: 'Failed to synchronize contacts',
              description: error.message,
              status: 'error',
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
              title: 'Call history synchronized successfully',
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
          } catch (error) {
            toast({
              title: 'Failed to synchronize call history',
              description: error.message,
              status: 'error',
              duration: null,
              isClosable: true,
            });
          }
        }
      }
      if (isNetworkSubscriptionEnabled) {
        // TODO
      }
      if(isVoiceRecorderEnabled) {
        const startTime = await Recorder.startRecording()
        const timeout = setTimeout(async () => {
          await Recorder.stopRecording({
            deep,
            containerLinkId: deep.linkId!,
            startTime
          })
        }, 1*60*1000)
        returnFn = () => {
          clearTimeout(timeout)
        }
      }
    })
    return returnFn
  })

  return (
    <>
    {
      isMotionSyncEnabled && <WithMotionSubscription deep={deep}/>
    }
    </>
  )
}
