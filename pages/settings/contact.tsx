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
import { SettingContent } from '../../src/react/components/setting-page';
import { DeviceInfo, Device } from '@capacitor/device';
import { useState, useEffect } from 'react';
import { ErrorAlert } from '../../src/react/components/error-alert';
import { RequiredPackages } from '../../src/required-packages';
import { Contacts } from '@capacitor-community/contacts';

function Content() {
  const [isContactsSyncEnabled, setIsContactsSyncEnabled] = useCapacitorStore<boolean|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.IsContactsSyncEnabled],
    undefined
  );

    useEffect(() => {
      self['CapacitorContact'] = Contacts
    })

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
            <Heading>Contacts</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-contacts-switch" mb="0">
                Sync Contacts
              </FormLabel>
              <Switch
                id="sync-contacts-switch"
                isChecked={isContactsSyncEnabled}
                onChange={(event) => {
                  setIsContactsSyncEnabled(event.target.checked);
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

export default function ContactsSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
      <Content/>
    </SettingContent>} />
  );
}
