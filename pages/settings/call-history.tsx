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
import { useCapacitorStore } from '@deep-foundation/store/capacitor';

import { CapacitorStoreKeys } from '../../src/capacitor-store-keys';
import { Page } from '../../src/react/components/page';
import { DeviceInfo, Device } from '@capacitor/device';
import { useState, useEffect } from 'react';
import { ErrorAlert } from '../../src/react/components/error-alert';
import { RequiredPackages } from '../../src/required-packages';
import { SettingContent } from '../../src/react/components/setting-page';

function Content() {
  const {value: isCallHistorySyncEnabled, setValue: setIsCallHistorySyncEnabled} = useCapacitorStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCallHistorySyncEnabled],
    undefined
  );

  const [platform, setPlatform] = useState<DeviceInfo['platform'] | undefined>(undefined)

  useEffect(() => {
    Device.getInfo().then(deviceInfo => {
      setPlatform(deviceInfo.platform)
    })
  }, [])

  return platform ? (
    platform === 'web' ? (
      <ErrorAlert title={`${RequiredPackages.CapacitorMotion} is not supported on web platform`} />
    ) : (
      <Card>
          <CardHeader>
            <Heading>Call History</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-call-history-switch" mb="0">
                Sync Call History
              </FormLabel>
              <Switch
                id="sync-call-history-switch"
                isChecked={isCallHistorySyncEnabled}
                onChange={(event) => {
                  setIsCallHistorySyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
    )
  ) : (
    <VStack height="100vh" justifyContent={"center"}>
    <CircularProgress isIndeterminate />
    <Text>Checking whether your platform supported...</Text>
  </VStack>
  )
}

export default function CallHistorySettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
      <Content/>
    </SettingContent>} />
  );
}
