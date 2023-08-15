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
import { Provider } from '../../imports/provider';
import { CapacitorStoreKeys } from '../../imports/capacitor-store-keys';
import { Page } from '../../components/page';

function Content() {
  const [isDeviceSyncEnabled, setIsDeviceSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsDeviceSyncEnabled],
    undefined
  );

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
                isChecked={isDeviceSyncEnabled}
                onChange={(event) => {
                  setIsDeviceSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function DeviceSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <Content />} />
  );
}