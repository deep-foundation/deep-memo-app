import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  CircularProgress,
  FormControl,
  FormLabel,
  Heading,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useLocalStore } from '@deep-foundation/store/local';
import { Provider } from '../../imports/provider';
import { CapacitorStoreKeys } from '../../imports/capacitor-store-keys';
import { Page } from '../../components/page';
import { SettingContent } from '../../components/setting-page';
import { Device } from '@capacitor/device';
import { useEffect, useState } from 'react';
import { DeviceInfo } from '@deep-foundation/capacitor-device';
import { ErrorAlert } from '../../components/error-alert';
import { RequiredPackages } from '../../imports/required-packages';
import {WithPlatformChecking} from '@deep-foundation/capacitor-motion'

function Content() {
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
    undefined
  );

  return <WithPlatformChecking 
  renderIfLoading={() => (
<VStack height="100vh" justifyContent={"center"}>
    <CircularProgress isIndeterminate />
    <Text>Checking whether your platform supported...</Text>
  </VStack>
  )}
  renderIfNotSupported={() => (
<ErrorAlert title={`${RequiredPackages.CapacitorMotion} is not supported on web platform`} />
  )}
  renderIfSupported={() => (
<Card>
          <CardHeader>
            <Heading>Motion</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-motion-switch" mb="0">
                Sync Motion
              </FormLabel>
              <Switch
                id="sync-motion-switch"
                isChecked={isMotionSyncEnabled}
                onChange={(event) => {
                  setIsMotionSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  )}
  />
}

export default function MotionSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}
