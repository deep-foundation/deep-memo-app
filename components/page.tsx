import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { DEEP_MEMO_PACKAGE_NAME } from '../imports/deep-memo/package-name';
import { ProvidersAndLoginOrContent } from './providers-and-login-or-content';
import { StoreProvider } from './store-provider';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, CircularProgress, Heading, List, ListIcon, ListItem, Stack, Text, Toast, VStack, useToast } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { CapacitorDevicePackage, WithDeviceInsertionIfDoesNotExistAndSavingData, getDeviceInsertSerialOperations } from '@deep-foundation/capacitor-device';
import {
  DeepClient,
  DeepProvider,
  SerialOperation,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { WithMinilinksApplied } from './with-minilinks-applied';
import { REQUIRED_PACKAGES } from '../imports/required-packages';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql';
import error from 'next/error';
import { ErrorAlert } from './error-alert';


export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const toast = useToast();
  return (
    <StoreProvider>
      <ProvidersAndLoginOrContent>
        <WithDeep
          renderChildren={({ deep }) => {
            console.log({ deep });
            const _package = new CapacitorDevicePackage({ deep });
            console.log({_package})
            return (
              <WithPackagesInstalled
              deep={deep}
                packageNames={[DEEP_MEMO_PACKAGE_NAME, ...Object.values(REQUIRED_PACKAGES)]}
                renderIfError={(error) => <Alert status="error">
                <AlertIcon />
                <AlertTitle>Failed to check whether required packages are installed</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>}
                renderIfNotInstalled={(packageNames) => {
                  const isDeepMemoInstalled = !packageNames.includes(DEEP_MEMO_PACKAGE_NAME);
                  
                  return (
                    <VStack height="100vh" justifyContent={"center"}>
                      {
                        isDeepMemoInstalled && packageNames.length > 1 ? (
                          <ErrorAlert title={`${DEEP_MEMO_PACKAGE_NAME} is installed but its dependencies-packages are not installed`} description={
                            <VStack>
                              <List styleType="disc">
                                {
                                  packageNames.map((packageName) => (
                                    
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
                          <Button
                            onClick={async () => {
                              const serialOperations = await makeInstallPackagesOperations({deep,packageNames: [DEEP_MEMO_PACKAGE_NAME]})
                              try{
                                await deep.serial({
                                  operations: serialOperations
                                })
                              } catch (error) {
                                toast({
                                  title: `Failed to install ${DEEP_MEMO_PACKAGE_NAME}`,
                                  description: error.message,
                                  status: "error",
                                  duration: null,
                                  isClosable: true,
                                })
                              }
                            }}
                          >
                            Install {DEEP_MEMO_PACKAGE_NAME}
                          </Button>
                          </VStack>
                        )
                      }
                    </VStack>
                  );
                }}
                renderIfLoading={() => (
                  <VStack height="100vh" justifyContent={"center"}>
                    <CircularProgress isIndeterminate/>
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
            );
          }}
        />
      </ProvidersAndLoginOrContent>
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
  deep: DeepClient;
  renderChildren: (param: { deviceLinkId: number }) => JSX.Element;
}

function WithDeviceLinkId({ deep, renderChildren }: WithDeviceLinkIdProps) {
  const [deviceLinkId, setDeviceLinkId] = useLocalStore<number|undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    undefined
  );

  return (
    deep.linkId ? <WithDeviceInsertionIfDoesNotExistAndSavingData
      containerLinkId={deep.linkId}
      deep={deep}
      deviceLinkId={deviceLinkId}
      renderIfLoading={() => <Text>Initializing device...</Text>}
      renderIfNotInserted={() => <Text>Initializing device...</Text>}
      insertDeviceCallback={async () => {
        const [deviceLinkId] = await deep.reserve(1);
        const serialOperations = await getDeviceInsertSerialOperations({
          deep,
          reservedLinkIds:{
            deviceLinkId: deviceLinkId
          }
        });
        await deep.serial({
          operations: serialOperations
        })
        setDeviceLinkId(deviceLinkId)
      }}
    >
      {renderChildren({ deviceLinkId })}
    </WithDeviceInsertionIfDoesNotExistAndSavingData> : null
  );
}

interface InstallRequiredPackagesOptions {
  deep: DeepClient;
}

async function installRequiredPackages(options: InstallRequiredPackagesOptions) {
  const {deep} = options;
  const operations = await makeInstallPackagesOperations({
    deep,
    packageNames: Object.values(REQUIRED_PACKAGES)
  })
  return await deep.serial({
    operations 
  })
}

interface InstallPackageOptions {
  deep: DeepClient;
  packageNames: Array<string>;
}

async function makeInstallPackagesOperations(options: InstallPackageOptions): Promise<Array<SerialOperation>> {
  const { deep, packageNames } = options;
  const containTypeLinkId = deep.idLocal(
    REQUIRED_PACKAGES['@deep-foundation/core'],
    'Contain'
  );
  const reservedLinkIds = await deep.reserve(2  )
  const packageQueryLinkId = reservedLinkIds.pop()!;
  const installLinkId = reservedLinkIds.pop()!;
  return packageNames.flatMap((packageName) => [
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: packageQueryLinkId,
        type_id: deep.idLocal(
          REQUIRED_PACKAGES['@deep-foundation/core'],
          'PackageQuery'
        ),
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'strings',
      objects: {
        link_id: packageQueryLinkId,
        value: packageName
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
        to_id: packageQueryLinkId
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: installLinkId,
        type_id: deep.idLocal(
          REQUIRED_PACKAGES['@deep-foundation/npm-packager'],
          'Install'
        ),
        from_id: deep.linkId,
        to_id: packageQueryLinkId
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
        to_id: installLinkId
      }
    }),
  ])
}