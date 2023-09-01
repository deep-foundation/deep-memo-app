import React, { useEffect } from 'react';
import {
  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  VStack,
  Button,
} from '@chakra-ui/react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import NextLink from 'next/link';
import {LinkIcon} from '@chakra-ui/icons'


import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { WithSubscriptions } from '../components/deep-memo/with-subscriptions';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { useLocalStore } from '@deep-foundation/store/local';
import { Monitoring } from '../components/monitoring';
import { SETTINGS_ROUTES } from '../imports/settings-routes';
import { capitalCase } from 'case-anything';
import debug from 'debug';
import { ErrorAlert } from '../components/error-alert';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { OptionalPackages } from '../imports/optional-packages';
import {getDeviceValueUpdateSerialOperations} from '@deep-foundation/capacitor-device'
import { DecoratedDeep } from '../components/with-decorated-deep';

interface ContentParam {
  deep: DecoratedDeep;
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
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] =
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
      <Button onClick={async () => {
        const operations = await getDeviceValueUpdateSerialOperations({
          deep,
          deviceLinkId
        })
        await deep.serial({
          operations
        })
      }}>
        Update Device Info
      </Button>
      <WithSubscriptions 
        deep={deep}
        deviceLinkId={deviceLinkId}
        isContactsSyncEnabled={isContactsSyncEnabled}
        lastContactsSyncTime={lastContactsSyncTime}
        onLastContactsSyncTimeChange={setLastContactsSyncTime}
        isCallHistorySyncEnabled={isCallHistorySyncEnabled}
        lastCallHistorySyncTime={lastCallHistorySyncTime}
        onLastCallHistorySyncTimeChange={setLastCallHistorySyncTime}
        isNetworkSyncEnabled={isNetworkSyncEnabled}
        isVoiceRecorderEnabled={isVoiceRecorderEnabled}
        isMotionSyncEnabled={isMotionSyncEnabled}
        />
        {
          isLoggerEnabled ? (
            <WithPackagesInstalled
            deep={deep}
            packageNames={[OptionalPackages.Logger]}
            renderIfError={(error) => (
              <VStack>
                <ErrorAlert title="Error checking whether logger is installed" description={error.message} />
              </VStack>
            )}
            renderIfLoading={() => (
              <VStack>
                <Text>Checking whether logger installed...</Text>
              </VStack>
            )}
            renderIfNotInstalled={() => {
              setIsLoggerEnabled(false)
              return (
                <VStack>
                  <ErrorAlert title="Logger is not installed" description={
                    <VStack>
                      <Text>Disable logger in settings and then install it. Note: if you disable logger in settings you will see installation button</Text>
                      <Link as={NextLink} href="/settings/logger">
                        Logger Settings <LinkIcon mx='2px' />
                        </Link>
                      </VStack>
                  } />
                </VStack>
              )
            }}
            >
              <Monitoring deep={deep} isLoggerEnabled={isLoggerEnabled} deviceLinkId={deviceLinkId} />
            </WithPackagesInstalled>
          ) : (
            <VStack>
            <ErrorAlert title="Logger is disabled" description={
              <VStack>
                <Text>Enable the logger to see logs</Text>
                <Link as={NextLink} href="/settings/logger">
                  Logger Settings <LinkIcon mx='2px' />
                  </Link>
                </VStack>
            } />
          </VStack>
          )
        }
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
      {
        Object.entries(SETTINGS_ROUTES).map(([name, route]) => (
          <Link as={NextLink} href={route}>
            {capitalCase(name)} <LinkIcon mx='2px' />
          </Link>
        ))
      }
    </Stack>
  );
}