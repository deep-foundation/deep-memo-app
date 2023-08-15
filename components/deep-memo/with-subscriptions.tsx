import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import { saveAllCallHistory } from '../../imports/callhistory/callhistory';
import { saveAllContacts } from '../../imports/contact/contact';
import { useEffect } from 'react';

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
    onLastCallHistorySyncTimeChange
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
     }) {

  useEffect(() => {
    new Promise(async () => {
      const currentTime = new Date().getTime();
      if (isContactsSyncEnabled) {
        if (currentTime - lastContactsSyncTime) {
          await saveAllContacts({ deep, deviceLinkId });
          onLastContactsSyncTimeChange(currentTime);
        }
      }
      if (isCallHistorySyncEnabled) {
        if (currentTime - lastCallHistorySyncTime) {
          await saveAllCallHistory({ deep, deviceLinkId });
          onLastCallHistorySyncTimeChange(currentTime);
        }
      }
      if (isNetworkSubscriptionEnabled) {
        // TODO
      }
    })
  })

  return <>
                </>
}
