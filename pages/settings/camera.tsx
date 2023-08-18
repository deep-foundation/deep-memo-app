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
import { SettingContent } from '../../components/setting-page';

function Content() {
  const [isCameraSyncEnabled, setIsCameraSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCameraSyncEnabled],
    undefined
  );

  return (
    <Card>
          <CardHeader>
            <Heading>Camera</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-camera-switch" mb="0">
                Sync Camera
              </FormLabel>
              <Switch
                id="sync-camera-switch"
                isChecked={isCameraSyncEnabled}
                onChange={(event) => {
                  setIsCameraSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function CameraSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
      <Content />
    </SettingContent>} />
  );
}
