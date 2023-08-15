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

  const [
    isActionSheetSubscriptionEnabled,
    setIsActionSheetSubscriptionEnabled,
  ] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsActionSheetSubscriptionEnabled],
    undefined
  );
  const [isDialogSubscriptionEnabled, setIsDialogSubscriptionEnabled] =
    useLocalStore<boolean|undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsDialogSubscriptionEnabled],
      undefined
    );
  const [
    isScreenReaderSubscriptionEnabled,
    setIsScreenReaderSubscriptionEnabled,
  ] = useLocalStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsScreenReaderSubscriptionEnabled],
    undefined
  );
  const [isHapticsSubscriptionEnabled, setIsHapticsSubscriptionEnabled] =
    useLocalStore<boolean|undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsHapticsSubscriptionEnabled],
      undefined
    );
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

  const generalInfoCard = (
    <Card>
      <CardHeader>
        <Heading as={'h2'}>General Info</Heading>
      </CardHeader>
      <CardBody>
        <Text suppressHydrationWarning>
          Authentication Link Id: {deep.linkId ?? ' '}
        </Text>
        <Text suppressHydrationWarning>
          Device Link Id: {deviceLinkId ?? ' '}
        </Text>
      </CardBody>
    </Card>
  );

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>DeepMemo</Heading>
      {generalInfoCard}
      <>
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
        />
        <Pages />
      </>
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

      <Link as={NextLink} href="/contacts">
        Contacts
      </Link>

      <Link as={NextLink} href="/telegram">
        Telegarm
      </Link>

      <Link as={NextLink} href="/action-sheet">
        Action Sheet
      </Link>

      <Link as={NextLink} href="/dialog">
        Dialog
      </Link>

      <Link as={NextLink} href="/screen-reader">
        Screen Reader
      </Link>

      <Link as={NextLink} href="/openai-completion">
        OpenAI Completion
      </Link>

      <Link as={NextLink} replace href="/browser-extension">
        Browser Extension
      </Link>

      <Link as={NextLink} href="/network">
        Network
      </Link>

      <Link as={NextLink} href="/camera">
        Camera
      </Link>

      <Link as={NextLink} href="/audiorecord">
        Audiorecord
      </Link>

      <Link as={NextLink} href="/haptics">
        Haptics
      </Link>

      <Link as={NextLink} href="/firebase-push-notification">
        Firebase Push Notification
      </Link>

      <Link as={NextLink} href="/motion">
        Motion
      </Link>
    </Stack>
  );
}
