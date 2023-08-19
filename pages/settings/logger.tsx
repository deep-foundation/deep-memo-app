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

function Content(options: ContentOptions) {
  const log = debug(`deep-foundation:pages:settings:logger:content`)
  const toast = useToast();
  const {deep} = options;
  const [isLoggerEnabled, setIsLoggerEnabled] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsLoggerEnabled],
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleLoggerToggle = async (event: ChangeEvent<HTMLInputElement>) => {
    // Prevent the immediate toggle
    event.preventDefault();

    setIsLoading(true);

    // Simulating a network request
    // Replace with your actual network request code
    try {
      if(isLoggerEnabled) {
        await deep.delete({
          up: {
            tree_id: {
              _id: ["@deep-foundation/core", "containTree"]
            },
            parent: {
              type_id: {
                _id: ["@deep-foundation/core", "Contain"]
              },
              to: {
                _or: [
                  {
                    type_id: {
                      _id: ["@deep-foundation/core", "HandleInsert"]
                    }
                  },
                  {
                    type_id: {
                      _id: ["@deep-foundation/core", "HandleUpdate"]
                    }
                  },
                  {
                    type_id: {
                      _id: ["@deep-foundation/core", "HandleDelete"]
                    }
                  },
                ],
                to: {
                  _or: [
                    {
                      id: {
                        _id: ["@deep-foundation/logger", "InsertHandler"]
                      }
                    },
                    {
                      id: {
                        _id: ["@deep-foundation/logger", "UpdateHandler"]
                      }
                    },
                    {
                      id: {
                        _id: ["@deep-foundation/logger", "DeleteHandler"]
                      }
                    },
                  ]
                }
              }
            }
          }
        })
      } else {
        const handleInsertTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleInsert")
        const insertHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "InsertHandler")
        const handleUpdateTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleUpdate")
        const updateHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "UpdateHandler")
        const handleDeleteTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleDelete")
        const deleteHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "DeleteHandler")
        const deviceTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-device'], "Device");
        const motionTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-motion'], "Motion");
        const positionTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-geolocation'], "Position");
        const networkTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-network'], "Network");
        const typesLinkIdsToLog = [
          deviceTypeLinkId,
          motionTypeLinkId,
          positionTypeLinkId,
          networkTypeLinkId
        ]
        const containTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "Contain")
        const insertData: Array<MutationInputLink> = typesLinkIdsToLog.flatMap(typeLinkId => [
          {
            type_id: handleInsertTypeLinkId,
            from_id: typeLinkId,
            to_id: insertHandlerTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId
              }
            }
          },
          {
            type_id: handleUpdateTypeLinkId,
            from_id: typeLinkId,
            to_id: updateHandlerTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId
              }
            }
          },
          {
            type_id: handleDeleteTypeLinkId,
            from_id: typeLinkId,
            to_id: deleteHandlerTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId
              }
            }
          }
        
        ]);
        log({insertData})
        await deep.insert(insertData)
      }
      setIsLoggerEnabled(!isLoggerEnabled);
    } catch (error) {
      toast({
        title: 'Failed to toggle logger',
        description: error.message,
        status: 'error',
        duration: null,
        isClosable: true,
      })
    } finally {
      setIsLoading(false);
    }
  };

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
            onChange={handleLoggerToggle}
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
    <Content deep={deep} />
    </WithPackagesInstalled>
  </SettingContent>} />
  );
}

interface ContentOptions {
  deep: DeepClient;
}