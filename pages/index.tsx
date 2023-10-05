import React, { useEffect } from "react";
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
  FormControl,
  FormLabel,
  Switch,
  CircularProgress,
} from "@chakra-ui/react";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import NextLink from "next/link";
import { LinkIcon } from "@chakra-ui/icons";
import { Page } from "../src/react/components/page";
import { CapacitorStoreKeys } from "../src/capacitor-store-keys";
import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { SETTINGS_ROUTES } from "../src/settings-routes";
import { capitalCase } from "case-anything";
import debug from "debug";
import { ErrorAlert } from "../src/react/components/error-alert";
import { WithPackagesInstalled } from "@deep-foundation/react-with-packages-installed";
import { OptionalPackages } from "../src/optional-packages";
import { DecoratedDeep } from "../src/react/components/with-decorated-deep";
import { WithSync } from "../src/react/components/with-sync";
import { NavBar } from "../src/react/components/navbar";
import { Monitoring } from "../src/react/components/monitoring";
import { setAllDataSync } from "../src/set-all-data-sync";
import { useIsAllDataSyncEnabled } from "../src/react/hooks/use-is-all-data-sync-enabled";
import { useVoiceRecorderPermissionsStatus,requestVoiceRecorderPermissions } from "@deep-foundation/capacitor-voice-recorder";

interface ContentParam {
  deep: DecoratedDeep;
  deviceLinkId: number;
}

function Content({ deep, deviceLinkId }: ContentParam) {
  useEffect(() => {
    import("@ionic/pwa-elements/loader").then(({ defineCustomElements }) => {
      defineCustomElements(window);
    });
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    });
  }, [deep]);

  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled], undefined);
  const [lastContactsSyncTime, setLastContactsSyncTime] = useCapacitorStore<
    number | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.ContactsLastSyncTime], undefined);
  const [isCallHistorySyncEnabled, setIsCallHistorySyncEnabled] =
    useCapacitorStore<boolean | undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
      undefined
    );
  const [lastCallHistorySyncTime, setLastCallHistorySyncTime] =
    useCapacitorStore<number | undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.CallHistoryLastSyncTime],
      undefined
    );
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSubscriptionEnabled], false);
  const [isVoiceRecorderEnabled, setIsVoiceRecorderEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderEnabled], undefined);
  const [isLoggerEnabled, setIsLoggerEnabled] = useCapacitorStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useCapacitorStore<
    boolean | undefined
  >(CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled], undefined);
  const [isGeolocationSyncEnabled, setIsGeolocationSyncEnabled] =
    useCapacitorStore<boolean | undefined>(
      CapacitorStoreKeys[CapacitorStoreKeys.IsGeolocationSyncEnabled],
      undefined
    );

  const isAllDataSyncEnabled = useIsAllDataSyncEnabled();

  const voiceRecorderPermissionsStatus = useVoiceRecorderPermissionsStatus();

  const allPermissionsGranted = voiceRecorderPermissionsStatus.permissionsStatus;

  const arePermissionsLoading = voiceRecorderPermissionsStatus.isLoading;

  return arePermissionsLoading ? (
    <VStack height="100vh" justifyContent={"center"}>
      <CircularProgress isIndeterminate />
      <Text>Checking checking whether permissions granted...</Text>
    </VStack>
  ) : (
    <Stack alignItems={"center"}>
      <NavBar />
      <Heading as={"h1"}>DeepMemo</Heading>
      <Button
        onClick={async () => {
          await deep.updateDevice({
            deviceLinkId,
          });
        }}
      >
        Update Device Info
      </Button>
      <WithSync
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
        isGeolocationSyncEnabled={isGeolocationSyncEnabled}
      />
      <Card>
        <CardHeader>
          <Heading>Data Synchronization</Heading>
        </CardHeader>
        <CardBody>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="sync-call-history-switch" mb="0">
              Synchronize All Data
            </FormLabel>
            <Switch
              id="sync-call-history-switch"
              isChecked={isAllDataSyncEnabled}
              onChange={(event) => {
                setAllDataSync(event.target.checked);
              }}
              isDisabled={!allPermissionsGranted}
            />
          </FormControl>
        </CardBody>
      </Card>
      {!voiceRecorderPermissionsStatus.permissionsStatus && (
        <Button onClick={requestVoiceRecorderPermissions}>
          Grant Voice Recorder Permissions
        </Button>
      )}
      {/* {isLoggerEnabled ? (
      <WithPackagesInstalled
        deep={deep}
        packageNames={[OptionalPackages.Logger]}
        renderIfError={(error) => (
          <VStack>
            <ErrorAlert
              title="Error checking whether logger is installed"
              description={error.message}
            />
          </VStack>
        )}
        renderIfLoading={() => (
          <VStack>
            <Text>Checking whether logger installed...</Text>
          </VStack>
        )}
        renderIfNotInstalled={() => {
          setIsLoggerEnabled(false);
          return (
            <VStack>
              <ErrorAlert
                title="Logger is not installed"
                description={
                  <VStack>
                    <Text>
                      Disable logger in settings and then install it. Note: if
                      you disable logger in settings you will see installation
                      button
                    </Text>
                    <Link as={NextLink} href="/settings/logger">
                      Logger Settings <LinkIcon mx="2px" />
                    </Link>
                  </VStack>
                }
              />
            </VStack>
          );
        }}
      >
        
        <Monitoring deep={deep} isLoggerEnabled={isLoggerEnabled} deviceLinkId={deviceLinkId} />
      </WithPackagesInstalled>
    ) : (
      <VStack>
        <ErrorAlert
          title="Logger is disabled"
          description={
            <VStack>
              <Text>Enable the logger to see logs</Text>
              <Link as={NextLink} href="/settings/logger">
                Logger Settings <LinkIcon mx="2px" />
              </Link>
            </VStack>
          }
        />
      </VStack>
    )} */}
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
      {Object.entries(SETTINGS_ROUTES).map(([name, route]) => (
        <Link as={NextLink} href={route}>
          {capitalCase(name)} <LinkIcon mx="2px" />
        </Link>
      ))}
    </Stack>
  );
}
