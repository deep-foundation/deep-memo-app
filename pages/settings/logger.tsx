import {
  Button,
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
  useToast,
} from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useLocalStore } from '@deep-foundation/store/local';
import { Provider } from '../../imports/provider';
import { CapacitorStoreKeys } from '../../imports/capacitor-store-keys';
import { Page } from '../../components/page';
import { ChangeEvent, useState } from 'react';
import { deepCopy } from '@firebase/util';
import {SerialTransitionsBuilder} from '@deep-foundation/deeplinks/imports/experimental/serial-transitions-builder'
import { REQUIRED_PACKAGES } from '../../imports/required-packages';
import { SettingContent } from '../../components/setting-page';
import { MutationInputLink } from '@deep-foundation/deeplinks/imports/client_types';
import debug from 'debug'
import { OPTIONAL_PACKAGES } from '../../imports/optional-packages';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { ErrorAlert } from '../../components/error-alert';
import { PackageManagementProxy } from '../../imports/package-management-proxy';
import { makeLoggerToggleHandler } from '../../imports/make-logger-toggle-handler';

export function LoggerSettingsContent(options: ContentOptions) {
  const log = debug(`deep-foundation:pages:settings:logger:content`)
  const toast = useToast();
  const {deep} = options;
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);


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
            onChange={makeLoggerToggleHandler({
              isLoggerEnabled,
              setIsLoading,
              setIsLoggerEnabled,
              toast
            })}
            isDisabled={isLoading}
          />
        </FormControl>
      </CardBody>
    </Card>
  );
}


export default function LoggerSettingsPage() {
  const toast = useToast()
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <WithPackagesInstalled
    deep={deep}
    packageNames={[OPTIONAL_PACKAGES['@deep-foundation/logger']]}
    renderIfError={(error) => (
      <ErrorAlert title={`Failed to check whether ${OPTIONAL_PACKAGES['@deep-foundation/logger']} is intalled`} description={error.message}/>
    )}
    renderIfLoading={() => (
      <VStack height="100vh" justifyContent={"center"}>
        <CircularProgress isIndeterminate />
        <Text>Checking whether {OPTIONAL_PACKAGES['@deep-foundation/logger']} is installed...</Text>
      </VStack>
    )}
    renderIfNotInstalled={() => (
      <VStack>
        <ErrorAlert title={`${OPTIONAL_PACKAGES['@deep-foundation/logger']} is not installed`} />
        <Button onClick={async () => {
          try {
            const packageManagementProxy = new PackageManagementProxy(deep)
          await packageManagementProxy.install(OPTIONAL_PACKAGES['@deep-foundation/logger'])
          toast({
            title: `Successfully installed ${OPTIONAL_PACKAGES['@deep-foundation/logger']}`,
            status: "success",
            duration: 5000,
            isClosable: true
          })
          } catch (error) {
            toast({
              title: `Failed to install ${OPTIONAL_PACKAGES['@deep-foundation/logger']}`,
              description: error.message,
              status: "error",
              duration: null,
              isClosable: true
            })
          }
        }}>
          Install {OPTIONAL_PACKAGES['@deep-foundation/logger']}
        </Button>
      </VStack>
    )}
    >
    <LoggerSettingsContent deep={deep} />
    </WithPackagesInstalled>
  </SettingContent>} />
  );
}

interface ContentOptions {
  deep: DeepClient;
}