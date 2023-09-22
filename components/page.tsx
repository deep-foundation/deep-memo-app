import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { DEEP_MEMO_PACKAGE_NAME } from '../imports/package-name';
import { WithProvidersAndLogin } from './with-providers-and-login';
import { StoreProvider } from './store-provider';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, CircularProgress, Heading, List, ListIcon, ListItem, Stack, Text, Toast, VStack, useToast } from '@chakra-ui/react';
import { useCapacitorStore } from '@deep-foundation/store/capacitor';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { WithDeviceSync } from '@deep-foundation/capacitor-device';
import {
  DeepClient,
  DeepProvider,
  SerialOperation,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { WithMinilinksApplied } from './with-minilinks-applied';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql';
import error from 'next/error';
import { ErrorAlert } from './error-alert';
import { RequiredPackages } from '../imports/required-packages';
import { useEffect, useState } from 'react';
import { NpmPackagerProxy } from '../imports/npm-packager-proxy';
import debug from 'debug';
import { WithDecoratedDeep } from './with-decorated-deep';
import { Contacts } from '@capacitor-community/contacts';
import { Device } from '@capacitor/device';
import { Motion } from '@capacitor/motion';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { DecoratedDeep } from '../imports/decorated-deep';

export interface PageParam {
  renderChildren: (param: {
    deep: DecoratedDeep;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const log = debug(`deep-memo-app:${Page.name}`)
  const toast = useToast();
  const [isInstallationLoading, setIsInstallationLoading] = useState<boolean|undefined>(undefined);
  log({isInstallationLoading, setIsInstallationLoading})

  useEffect(() => {
    self['CapacitorDevice'] = Device
    self['CapacitorMotion'] = Motion
    self['CapacitorGeolocation'] = Geolocation
    self['CapacitorCamera'] = Camera
    self['CapacitorNetwork'] = Network
    self['CapacitorContact'] = Contacts
    self['CapacitorPreferences'] = Preferences
  })

  return (
    <StoreProvider>
      <WithProvidersAndLogin>
        <WithDeep
          renderChildren={({ deep }) => (
            <WithDecoratedDeep deep={deep} renderChildren={({deep}) => (
              <WithPackagesInstalled
              deep={deep}
              packageNames={[DEEP_MEMO_PACKAGE_NAME, ...Object.values(RequiredPackages)]}
              renderIfError={(error) => <VStack height="100vh" justifyContent={"center"}><ErrorAlert title={"Failed to check whether required packages are installed"} description={error.message} /></VStack>}
              renderIfNotInstalled={(notInstalledPackageNames) => {
                log({notInstalledPackageNames})
                const isDeepMemoInstalled = !notInstalledPackageNames.includes(DEEP_MEMO_PACKAGE_NAME);
                log({isDeepMemoInstalled})

                return (
                  <VStack height="100vh" justifyContent={"center"}>
                    {
                      isDeepMemoInstalled ? (
                        <ErrorAlert title={`${DEEP_MEMO_PACKAGE_NAME} is installed but its dependencies-packages are not installed`} description={
                          <VStack>
                            <List styleType="disc">
                              {
                                notInstalledPackageNames.map((packageName) => (

                                  <ListItem >
                                    {packageName}
                                  </ListItem>
                                ))
                              }
                            </List>
                          </VStack>
                        } />
                      ) : (
                        <VStack>
                          <ErrorAlert title={`${DEEP_MEMO_PACKAGE_NAME} is not installed`} />
                          {/* <Button
                          isLoading={isInstallationLoading}
                            onClick={async () => {
                              setIsInstallationLoading(true)
                              try {
                                const npmPackagerProxy = new NpmPackagerProxy(deep);
                                await npmPackagerProxy.applyMinilinks()
                                await npmPackagerProxy.install(DEEP_MEMO_PACKAGE_NAME)
                              } catch (error) {
                                toast({
                                  title: `Failed to install ${DEEP_MEMO_PACKAGE_NAME}`,
                                  description: error.message,
                                  status: "error",
                                  duration: null,
                                  isClosable: true,
                                })
                              } finally {
                                setIsInstallationLoading(false)
                              }
                            }}
                          >
                            Install {DEEP_MEMO_PACKAGE_NAME}
                          </Button> */}
                        </VStack>
                      )
                    }
                  </VStack>
                );
              }}
              renderIfLoading={() => (
                <VStack height="100vh" justifyContent={"center"}>
                  <CircularProgress isIndeterminate />
                  <Text>Checking if deep packages are installed...</Text>
                </VStack>
              )}
            >
              <WithMinilinksApplied deep={deep}>
                <WithDeviceLinkId
                  deep={deep}
                  renderChildren={({ deviceLinkId }) =>
                    renderChildren({ deep, deviceLinkId })
                  }
                />
              </WithMinilinksApplied>
            </WithPackagesInstalled>
            )} />
          )}
        />
      </WithProvidersAndLogin>
    </StoreProvider>
  );
}

interface WithDeepProps {
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}

function WithDeep({ renderChildren }: WithDeepProps) {
  const deep = useDeep();
  return renderChildren({ deep });
}

interface WithDeviceLinkIdProps {
  deep: DecoratedDeep;
  renderChildren: (param: { deviceLinkId: number }) => JSX.Element;
}

function WithDeviceLinkId({ deep, renderChildren }: WithDeviceLinkIdProps) {
  const [deviceLinkId, setDeviceLinkId] = useCapacitorStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    undefined
  );

  return (
    <WithDeviceSync
      containerLinkId={deep.linkId}
      deep={deep}
      deviceLinkId={deviceLinkId}
      renderIfLoading={() => (
        <VStack height="100vh" justifyContent={"center"}>
          <CircularProgress isIndeterminate />
          <Text>Initializing device...</Text>
        </VStack>
      )}
      renderIfNotInserted={() => (
        <VStack height="100vh" justifyContent={"center"}>
          <CircularProgress isIndeterminate />
          <Text>Initializing device...</Text>
        </VStack>
      )}
      renderChildren={renderChildren}
    />
  );
}
