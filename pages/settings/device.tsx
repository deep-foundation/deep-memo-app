import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  FormControl,
  FormLabel,
  Heading,
  Switch,
} from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useLocalStore } from '@deep-foundation/store/local';
import { Provider } from '../../src/provider';
import { CapacitorStoreKeys } from '../../src/capacitor-store-keys';
import { Page } from '../../src/react/components/page';
import { SettingContent } from '../../src/react/components/setting-page';

function Content() {
  return (
    <Card>
          <CardHeader>
            <Heading>Device</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-device-switch" mb="0">
                Sync Device
              </FormLabel>
              <Switch
                id="sync-device-switch"
                isChecked={true}
                isDisabled={true}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function DeviceSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
      <Content />
    </SettingContent>} />
  );
}
