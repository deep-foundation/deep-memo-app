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
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LinkIcon } from "@chakra-ui/icons";
import { Page } from "../src/react/components/page";
import { SETTINGS_ROUTES } from "../src/settings-routes";
import { capitalCase } from "case-anything";
import { DecoratedDeep } from "../src/react/components/with-decorated-deep";
import { WithSync } from "../src/react/components/with-sync";
import { NavBar } from "../src/react/components/navbar";
import { useIsAllDataSyncEnabled } from "../src/react/hooks/use-is-all-data-sync-enabled";
import {
  useVoiceRecorderPermissionsStatus,
  requestVoiceRecorderPermissions,
} from "@deep-foundation/capacitor-voice-recorder";
import {
  usePermissionsStatus as useGeolocationPermissionsStatus,
  requestPermissions as requestGeolocationPermissions,
} from "@deep-foundation/capacitor-geolocation";
import { packageLog } from "../src/package-log";
import { useSyncSettings } from "../src/react/hooks/use-sync-settings";
import { IfPlatformSupportedForContacts, requestContactsPermissions, useContactsPermissionsStatus } from "@deep-foundation/capacitor-contacts";
import CircularJSON from 'circular-json';
import { WithPackagesInstalled } from "@deep-foundation/react-with-packages-installed";
import { ErrorAlert } from "../src/react/components/error-alert";
import { OptionalPackages } from "../src/optional-packages";
import { Monitoring } from "../src/react/components/monitoring";
// import debug from "debug";
// function debugObjectFormatter(v) {
//   return CircularJSON.stringify(v);
// }
// debug.formatters.o = debugObjectFormatter;
// debug.formatters.O = debugObjectFormatter
// debug.enable('@deep-foundation/capacitor-contacts:*, @deep-foundation/deep-memo-app:*')


interface ContentParam {
  deep: DecoratedDeep;
  deviceLinkId: number;
}

function IndexContent({ deep, deviceLinkId }: ContentParam) {
  const log = packageLog.extend(IndexContent.name);
  const toast = useToast();
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

  const {
    isCallHistorySyncEnabled,
    isContactsSyncEnabled,
    isGeolocationSyncEnabled,
    isMotionSyncEnabled,
    isNetworkSyncEnabled,
    isVoiceRecorderEnabled,
    lastCallHistorySyncTime,
    lastContactsSyncTime,
    isLoading: isSyncSettingsLoading,
    setLastCallHistorySyncTime,
    setLastContactsSyncTime,
    setIsSyncEnabled,
    isSyncEnabled,
    isLoggerEnabled,
    setIsCallHistorySyncEnabled,
    setIsContactsSyncEnabled,
    setIsGeolocationSyncEnabled,
    setIsLoggerEnabled,
    setIsMotionSyncEnabled,
    setIsNetworkSyncEnabled,
    setIsVoiceRecorderEnabled,
  } = useSyncSettings()
  console.log({isVoiceRecorderEnabled})

  const isAllDataSyncEnabled = useIsAllDataSyncEnabled();

  const voiceRecorderPermissionsStatus = useVoiceRecorderPermissionsStatus();
  log({ voiceRecorderPermissionsStatus });

  const geolocationPermissionsStatus = useGeolocationPermissionsStatus();
  log({ geolocationPermissionsStatus });

  const contactsPermissionsStatus = useContactsPermissionsStatus();
  log({contactsPermissionsStatus})

  const allPermissionsGranted =
    voiceRecorderPermissionsStatus.permissionsStatus &&
    geolocationPermissionsStatus.permissionsStatus?.coarseLocation ===
      "granted" &&
    geolocationPermissionsStatus.permissionsStatus?.location === "granted";

  const arePermissionsLoading =
    voiceRecorderPermissionsStatus.isLoading &&
    geolocationPermissionsStatus.isLoading;

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
      {
        !isSyncSettingsLoading && <WithSync
        deep={deep}
        deviceLinkId={deviceLinkId}
        isContactsSyncEnabled={isContactsSyncEnabled!}
        lastContactsSyncTime={lastContactsSyncTime!}
        onLastContactsSyncTimeChange={setLastContactsSyncTime}
        isCallHistorySyncEnabled={isCallHistorySyncEnabled!}
        lastCallHistorySyncTime={lastCallHistorySyncTime!}
        onLastCallHistorySyncTimeChange={setLastCallHistorySyncTime}
        isNetworkSyncEnabled={isNetworkSyncEnabled!}
        isVoiceRecorderEnabled={isVoiceRecorderEnabled!}
        isMotionSyncEnabled={isMotionSyncEnabled!}
        isGeolocationSyncEnabled={isGeolocationSyncEnabled!}
      />
      }
      
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
              isChecked={isSyncEnabled}
              onChange={(event) => {
                const {checked} = event.target;
                if(voiceRecorderPermissionsStatus.permissionsStatus) {
                  setIsVoiceRecorderEnabled(checked);
                }
                if(geolocationPermissionsStatus.permissionsStatus?.coarseLocation === "granted" && geolocationPermissionsStatus.permissionsStatus?.location === "granted") {
                  setIsGeolocationSyncEnabled(checked);
                }
                if(contactsPermissionsStatus.permissionsStatus === "granted") {
                  setIsContactsSyncEnabled(checked);
                }
                setIsCallHistorySyncEnabled(checked);
                setIsNetworkSyncEnabled(checked);
                setIsMotionSyncEnabled(checked);
                setIsGeolocationSyncEnabled(checked);
                setIsSyncEnabled(checked);
              }}
            />
          </FormControl>
        </CardBody>
      </Card>
      {!voiceRecorderPermissionsStatus.permissionsStatus && (
        <Button
          onClick={async () => {
            try {
              await requestVoiceRecorderPermissions();
              voiceRecorderPermissionsStatus.updatePermissionsStatus();
            } catch (error) {
              log({ error });
              toast({
                title: `Failed to request voice recorder permissions`,
                description: error.message,
                status: "error",
                duration: null,
                isClosable: true,
                position: "top-right",
              });
            }
          }}
        >
          Grant Voice Recorder Permissions
        </Button>
      )}
      {}
      {(geolocationPermissionsStatus.permissionsStatus?.coarseLocation !==
        "granted" ||
        geolocationPermissionsStatus.permissionsStatus?.location !==
          "granted") && (
        <Button
          onClick={async () => {
            try {
              await requestGeolocationPermissions();
            } catch (error) {
              log({ error });
              toast({
                title: `Failed to request geolocation permissions`,
                description: error.message,
                status: "error",
                duration: null,
                isClosable: true,
                position: "top-right",
              });
            }
          }}
        >
          Grant Geolocation Permissions
        </Button>
      )}
      {
        <IfPlatformSupportedForContacts>
          {
            (contactsPermissionsStatus.permissionsStatus !== "granted") ? <></> : (
              <Button
                onClick={async () => {
                  try {
                    await requestContactsPermissions();
                    contactsPermissionsStatus.updatePermissionsStatus();
                  } catch (error) {
                    log({ error });
                    toast({
                      title: `Failed to request Contacts permissions`,
                      description: error.message,
                      status: "error",
                      duration: null,
                      isClosable: true,
                      position: "top-right",
                    });
                  }
                }}
              >
                Grant Contacts Permissions
              </Button>
            )
          }
        </IfPlatformSupportedForContacts>
      }
      {isLoggerEnabled ? (
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
    )}
    </Stack>
  );
}

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <IndexContent deep={deep} deviceLinkId={deviceLinkId} />
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
