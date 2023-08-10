import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { DEEP_MEMO_PACKAGE_NAME } from '../imports/deep-memo/package-name';
import { ProvidersAndLoginOrContent } from './providers-and-login-or-content';
import { StoreProvider } from './store-provider';
import { ErrorAlert } from './error-alert';
import { Button, Stack, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { CapacitorDevicePackage, WithDeviceInsertionIfDoesNotExistAndSavingData, getDeviceInsertSerialOperations } from '@deep-foundation/capacitor-device';
import {
  DeepClient,
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';

export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
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
                packageNames={[DEEP_MEMO_PACKAGE_NAME]}
                renderIfError={(error) => <ErrorAlert error={error} />}
                renderIfNotInstalled={(packageNames) => (
                  <>
                    <ErrorAlert
                      error={
                        new Error(
                          `Install these deep packages to proceed: ${packageNames.join(
                            ', '
                          )}`
                        )
                      }
                    />
                    <Stack>
                      {packageNames.map((packageName) => (
                        <Button
                          onClick={async () => {
                            const containTypeLinkId = await deep.id(
                              '@deep-foundation/core',
                              'Contain'
                            );
                            const reservedLinkIds = await deep.reserve(2  )
                            const packageQueryLinkId = reservedLinkIds.pop()!;
                            const installLinkId = reservedLinkIds.pop()!;
                            await deep.serial({
                              operations: [
                                {
                                  type: 'insert',
                                  table: 'links',
                                  objects: {
                                    id: packageQueryLinkId,
                                    type_id: await deep.id(
                                      '@deep-foundation/core',
                                      'PackageQuery'
                                    ),
                                  }
                                },
                                {
                                  type: 'insert',
                                  table: 'strings',
                                  objects: {
                                    link_id: packageQueryLinkId,
                                    value: packageName
                                  }
                                },
                                {
                                  type: 'insert',
                                  table: 'links',
                                  objects: {
                                    type_id: containTypeLinkId,
                                    from_id: deep.linkId,
                                    to_id: packageQueryLinkId
                                  }
                                },
                                {
                                  type: 'insert',
                                  table: 'links',
                                  objects: {
                                    id: installLinkId,
                                    type_id: await deep.id(
                                      '@deep-foundation/npm-packager',
                                      'Install'
                                    ),
                                    from_id: deep.linkId,
                                    to_id: packageQueryLinkId
                                  }
                                },
                                {
                                  type: 'insert',
                                  table: 'links',
                                  objects: {
                                    type_id: containTypeLinkId,
                                    from_id: deep.linkId,
                                    to_id: installLinkId
                                  }
                                },
                              ]
                            })
                            await deep.insert([
                              {
                                type_id: await deep.id(
                                  '@deep-foundation/npm-packager',
                                  'Install'
                                ),
                                from_id: deep.linkId,
                                to: {
                                  data: {
                                    type_id: await deep.id(
                                      '@deep-foundation/core',
                                      'PackageQuery'
                                    ),
                                    string: { data: { value: packageName } },
                                  },
                                },
                              },
                            ]);
                          }}
                        >
                          Install {packageName}
                        </Button>
                      ))}
                    </Stack>
                  </>
                )}
                renderIfLoading={() => (
                  <Text>Checking if deep packages are installed...</Text>
                )}
              >
                <WithDeviceLinkId
                  deep={deep}
                  renderChildren={({ deviceLinkId }) =>
                    renderChildren({ deep, deviceLinkId })
                  }
                />
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
