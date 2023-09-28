import { WithPackagesInstalled } from "@deep-foundation/react-with-packages-installed";
import { WithProviders } from "./with-providers";
import { StoreProvider } from "./store-provider";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import {
  DeepClient,
  DeepProvider,
  SerialOperation,
  useDeep,
} from "@deep-foundation/deeplinks/imports/client";
import { ErrorAlert } from "./error-alert";
import { WithLogin } from "./with-login";
import debug from "debug";
import { useState, useEffect } from "react";
import { DEEP_MEMO_PACKAGE_NAME } from "../../package-name";
import { RequiredPackages } from "../../required-packages";
import { WithAddDebugFieldsToWindow } from "./with-add-debug-fields-to-window";
import { DecoratedDeep, WithDecoratedDeep } from "./with-decorated-deep";
import { WithMinilinksApplied } from "./with-minilinks-applied";
import {
  WithDeviceSync,
  useDeviceLink,
} from "@deep-foundation/capacitor-device";
import {WithDeviceLinkId,WithDeviceLinkIdOptions} from './with-device-link-id.js'

export interface PageParam {
  renderChildren: (param: {
    deep: DecoratedDeep;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const log = debug(`deep-memo-app:${Page.name}`);
  const toast = useToast();
  const [isInstallationLoading, setIsInstallationLoading] = useState<
    boolean | undefined
  >(undefined);
  log({ isInstallationLoading, setIsInstallationLoading });

  return (
    <WithProviders>
      <WithLogin>
        <WithDeep
          renderChildren={({ deep }) => (
            <WithDecoratedDeep
              deep={deep}
              renderChildren={({ deep }) => (
                <WithPackagesInstalled
                  deep={deep}
                  packageNames={[
                    DEEP_MEMO_PACKAGE_NAME,
                    ...Object.values(RequiredPackages),
                  ]}
                  renderIfError={(error) => (
                    <VStack height="100vh" justifyContent={"center"}>
                      <ErrorAlert
                        title={
                          "Failed to check whether required packages are installed"
                        }
                        description={error.message}
                      />
                    </VStack>
                  )}
                  renderIfNotInstalled={(notInstalledPackageNames) => {
                    log({ notInstalledPackageNames });
                    const isDeepMemoInstalled =
                      !notInstalledPackageNames.includes(
                        DEEP_MEMO_PACKAGE_NAME
                      );
                    log({ isDeepMemoInstalled });

                    return (
                      <VStack height="100vh" justifyContent={"center"}>
                        {isDeepMemoInstalled ? (
                          <ErrorAlert
                            title={`${DEEP_MEMO_PACKAGE_NAME} is installed but its dependencies-packages are not installed`}
                            description={
                              <VStack>
                                <List styleType="disc">
                                  {notInstalledPackageNames.map(
                                    (packageName) => (
                                      <ListItem>{packageName}</ListItem>
                                    )
                                  )}
                                </List>
                              </VStack>
                            }
                          />
                        ) : (
                          <VStack>
                            <ErrorAlert
                              title={`${DEEP_MEMO_PACKAGE_NAME} is not installed`}
                            />
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
                        )}
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
                    <>
                      <WithDeviceLinkId
                        deep={deep}
                        renderChildren={({ deviceLinkId }) =>
                          renderChildren({ deep, deviceLinkId })
                        }
                      />
                      {process.env.NODE_ENV === "development" && (
                        <WithAddDebugFieldsToWindow />
                      )}
                    </>
                  </WithMinilinksApplied>
                </WithPackagesInstalled>
              )}
            />
          )}
        />
      </WithLogin>
    </WithProviders>
  );
}

interface WithDeepProps {
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}

function WithDeep({ renderChildren }: WithDeepProps) {
  const deep = useDeep();
  useEffect(() => {
    self["deep"] = deep;
  });
  return renderChildren({ deep });
}

