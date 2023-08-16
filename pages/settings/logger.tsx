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
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );

  return (
    <Card>
          <CardHeader>
            <Heading>Logger</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-logger-switch" mb="0">
                Logger
              </FormLabel>
              <Switch
                id="sync-logger-switch"
                isChecked={isLoggerEnabled}
                onChange={(event) => {
                  setIsLoggerEnabled(event.target.checked);
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function LoggerSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <Content />} />
  );
}
