import React, { useEffect } from 'react';
import {
  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
} from '@chakra-ui/react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import NextLink from 'next/link';


import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { WithSubscriptions } from '../components/deep-memo/with-subscriptions';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { useLocalStore } from '@deep-foundation/store/local';

interface ContentParam {
  deep: DeepClient;
  deviceLinkId: number;
}

function Content({ deep, deviceLinkId }: ContentParam) {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    });
  }, [deep]);

  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled],
    undefined
  );
  const [lastContactsSyncTime, setLastContactsSyncTime] = useLocalStore<number|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime],
    undefined
  );
  const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
    undefined
  );
  const [lastCallHistorySyncTime, setLastCallHistorySyncTime] = useLocalStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime],
    undefined
  );
  const [isNetworkSubscriptionEnabled, setIsNetworkSubscriptionEnabled] =
    useLocalStore<boolean|undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled],
      false
    );
  const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled],
    undefined
  );
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
    undefined
  );

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>DeepMemo</Heading>
      <WithSubscriptions 
        deep={deep}
        deviceLinkId={deviceLinkId}
        isContactsSyncEnabled={isContactsSyncEnabled}
        lastContactsSyncTime={lastContactsSyncTime}
        onLastContactsSyncTimeChange={setLastContactsSyncTime}
        isCallHistorySyncEnabled={isCallHistorySyncEnabled}
        lastCallHistorySyncTime={lastCallHistorySyncTime}
        onLastCallHistorySyncTimeChange={setLastCallHistorySyncTime}
        isNetworkSubscriptionEnabled={isNetworkSubscriptionEnabled}
        isVoiceRecorderEnabled={isVoiceRecorderEnabled}
        isMotionSyncEnabled={isMotionSyncEnabled}
        />
    </Stack>
  );
}

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <Content deep={deep} deviceLinkId={deviceLinkId} />
      )}
    />
  );
}

function Pages() {
  return (
    <Stack>
      <Link as={NextLink} href="/settings">
        Settings
      </Link>

      <Link as={NextLink} href="/device">
        Device
      </Link>

      <Link as={NextLink} href="/call-history">
        Call History
      </Link>

      <Link as={NextLink} href="/contact">
        Contact
      </Link>

      <Link as={NextLink} href="/network">
        Network
      </Link>

      <Link as={NextLink} href="/camera">
        Camera
      </Link>

      <Link as={NextLink} href="/motion">
        Motion
      </Link>
    </Stack>
  );
}
