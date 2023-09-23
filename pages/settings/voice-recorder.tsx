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
  const [isVoiceRecorderSyncEnabled, setIsVoiceRecorderSyncEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsVoiceRecorderSyncEnabled],
    undefined
  );

  return (
    <Card>
          <CardHeader>
            <Heading>VoiceRecorder</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-voicerecorder-switch" mb="0">
                Sync VoiceRecorder
              </FormLabel>
              <Switch
                id="sync-voicerecorder-switch"
                isChecked={isVoiceRecorderSyncEnabled}
                onChange={(event) => {
                  setIsVoiceRecorderSyncEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function VoiceRecorderSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}
