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
import { useEffect } from 'react';
import { Network } from '@capacitor/network';

function Content() {
  const [isNetworkSyncEnabled, setIsNetworkSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsNetworkSyncEnabled],
    undefined
  );

  useEffect(() => {
    self["CapacitorNetwork"] = Network
  }, [])

  return (
    <Card>
          <CardHeader>
            <Heading>Network</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-network-switch" mb="0">
                Sync Network
              </FormLabel>
              <Switch
                id="sync-network-switch"
                isChecked={isNetworkSyncEnabled}
                onChange={(event) => {
                  setIsNetworkSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function NetworkSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}
