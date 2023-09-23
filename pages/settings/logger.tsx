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
  Stack,
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
import { RequiredPackages } from '../../imports/required-packages';
import { SettingContent } from '../../components/setting-page';
import { MutationInputLink } from '@deep-foundation/deeplinks/imports/client_types';
import debug from 'debug'
import { OptionalPackages } from '../../imports/optional-packages';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { ErrorAlert } from '../../components/error-alert';
import { makeLoggerToggleHandler } from '../../imports/make-logger-toggle-handler';
import { NpmPackagerProxy } from '../../imports/npm-packager-proxy';

export function LoggerSettingsContent(options: ContentOptions) {
  const log = debug(`deep-foundation:pages:settings:logger:content`)
  const toast = useToast();
  const {deep,isInstalled} = options;
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggerInstallationLoading, setIsLoggerInstallationLoading] = useState(false);

  return (
    <Stack>
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
                deep,
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
      {
        !isInstalled && <Stack>
        <ErrorAlert title={`${OptionalPackages.Logger} is not installed`} description={`Disable and install ${OptionalPackages.Logger}`} />
        <Button 
        isLoading={isLoggerInstallationLoading}
        onClick={async () => {
          setIsLoggerInstallationLoading(true)
          try {
            const npmPackagerProxy = new NpmPackagerProxy(deep)
            await npmPackagerProxy.install(OptionalPackages.Logger)
          toast({
            title: `Successfully installed ${OptionalPackages.Logger}`,
            status: "success",
            duration: 5000,
            isClosable: true
          })
          } catch (error) {
            toast({
              title: `Failed to install ${OptionalPackages.Logger}`,
              description: error.message,
              status: "error",
              duration: null,
              isClosable: true
            })
          } finally {
            setIsLoggerInstallationLoading(false)
          }
        }}>
          Install {OptionalPackages.Logger}
        </Button>
      </Stack>
      }
    </Stack>
  );
}


export default function LoggerSettingsPage() {
  const toast = useToast()
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <WithPackagesInstalled
    deep={deep}
    packageNames={[OptionalPackages.Logger]}
    renderIfError={(error) => (
      <ErrorAlert title={`Failed to check whether ${OptionalPackages.Logger} is intalled`} description={error.message}/>
    )}
    renderIfLoading={() => (
      <VStack height="100vh" justifyContent={"center"}>
        <CircularProgress isIndeterminate />
        <Text>Checking whether {OptionalPackages.Logger} is installed...</Text>
      </VStack>
    )}
    renderIfNotInstalled={() => (
      <LoggerSettingsContent deep={deep} isInstalled={false} />
    )}
    >
    <LoggerSettingsContent deep={deep} isInstalled={true} />
    </WithPackagesInstalled>
  </SettingContent>} />
  );
}

interface ContentOptions {
  deep: DeepClient;
  isInstalled: boolean;
}