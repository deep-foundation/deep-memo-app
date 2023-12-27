import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { useCapacitorStore } from '@deep-foundation/store/capacitor';
import { CapacitorStoreKeys } from '../../src/capacitor-store-keys';
import { Page } from '../../src/react/components/page';
import { useState } from 'react';
import debug from 'debug'
import { OptionalPackages } from '../../src/optional-packages';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { ErrorAlert } from '../../src/react/components/error-alert';
import { makeLoggerToggleHandler } from '../../src/make-logger-toggle-handler';
import { NpmPackagerProxy } from '../../src/npm-packager-proxy';
import { SettingContent } from '../../src/react/components/setting-page';

export function LoggerSettingsContent(options: ContentOptions) {
  return null
  const log = debug(`deep-foundation:pages:settings:logger:content`)
  const toast = useToast();
  const {deep,isInstalled} = options;
  const [isLoggerEnabled, setIsLoggerEnabled, isLogger] = useCapacitorStore<boolean|undefined>(
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
                isLoggerEnabled: isLoggerEnabled!,
                setIsLoading,
                setIsLoggerEnabled,
                toast
              })}
              isDisabled={isLoading || !isInstalled}
            />
          </FormControl>
        </CardBody>
      </Card>
      {
        !isInstalled && <Stack>
        <ErrorAlert title={`${OptionalPackages.Logger} is not installed`} description={`Install ${OptionalPackages.Logger}`} />
        {/* <Button 
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
        </Button> */}
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