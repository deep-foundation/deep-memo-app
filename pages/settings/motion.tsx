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
  const [isMotionSyncEnabled, setIsMotionSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsMotionSyncEnabled],
    undefined
  );

  return (
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
  );
}

export default function MotionSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}
