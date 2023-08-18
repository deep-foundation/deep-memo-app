import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  FormControl,
  FormLabel,
  Heading,
  Switch,
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
import { PackagesInMinilinks } from '../../imports/packages-in-minilinks';
import { SettingContent } from '../../components/setting-page';
import { MutationInputLink } from '@deep-foundation/deeplinks/imports/client_types';
import debug from 'debug'

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
        const handleInsertTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/core'], "HandleInsert")
        const insertHandlerTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/logger'], "InsertHandler")
        const handleUpdateTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/core'], "HandleUpdate")
        const updateHandlerTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/logger'], "UpdateHandler")
        const handleDeleteTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/core'], "HandleDelete")
        const deleteHandlerTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/logger'], "DeleteHandler")
        const deviceTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/capacitor-device'], "Device");
        const motionTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/capacitor-motion'], "Motion");
        const positionTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/capacitor-geolocation'], "Position");
        const networkTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/capacitor-network'], "Network");
        const typesLinkIdsToLog = [
          deviceTypeLinkId,
          motionTypeLinkId,
          positionTypeLinkId,
          networkTypeLinkId
        ]
        const containTypeLinkId = deep.idLocal(PackagesInMinilinks['@deep-foundation/core'], "Contain")
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
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
    <Content deep={deep} />
  </SettingContent>} />
  );
}

interface ContentOptions {
  deep: DeepClient;
}