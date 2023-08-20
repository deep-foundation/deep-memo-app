import { DeepClient, Exp } from "@deep-foundation/deeplinks/imports/client";
import { REQUIRED_PACKAGES } from "../imports/required-packages";
import { MutationInputLink } from "@deep-foundation/deeplinks/imports/client_types";
import debug from "debug";

export async function toggleLogger(options: ToggleLoggerOptions) {
  const log = debug(`deep-memo-app:${toggleLogger.name}`);
  log({options})
  const { deep, isLoggerEnabled,onError,onSuccess } = options;

  try {
    if(isLoggerEnabled) {
      await toggleEnabledLogger({deep})
    } else {
      await toggleDisabledFunction({deep})
    }
    onSuccess()
  } catch (error) {
    onError(error)
  }
};

export interface ToggleLoggerOptions {
  deep: DeepClient;
  isLoggerEnabled: boolean;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

async function toggleEnabledLogger(options: ToggleEnabledLoggerOptions) {
  const log = debug(`deep-memo-app:${toggleEnabledLogger.name}`);
  log({options})
  const {deep} = options
  const deleteData: Exp<'links'> = {
    up: {
      tree_id: {
        _id: [REQUIRED_PACKAGES['@deep-foundation/core'], "containTree"]
      },
      parent: {
        type_id: {
          _id: [REQUIRED_PACKAGES['@deep-foundation/core'], "Contain"]
        },
        to: {
          _or: [
            {
              type_id: {
                _id: [REQUIRED_PACKAGES['@deep-foundation/core'], "HandleInsert"]
              }
            },
            {
              type_id: {
                _id: [REQUIRED_PACKAGES['@deep-foundation/core'], "HandleUpdate"]
              }
            },
            {
              type_id: {
                _id: [REQUIRED_PACKAGES['@deep-foundation/core'], "HandleDelete"]
              }
            },
          ],
          to: {
            _or: [
              {
                id: {
                  _id: [REQUIRED_PACKAGES['@deep-foundation/logger'], "InsertHandler"]
                }
              },
              {
                id: {
                  _id: [REQUIRED_PACKAGES['@deep-foundation/logger'], "UpdateHandler"]
                }
              },
              {
                id: {
                  _id: [REQUIRED_PACKAGES['@deep-foundation/logger'], "DeleteHandler"]
                }
              },
            ]
          }
        }
      }
    }
  }
  log({deleteData})
  await deep.delete(deleteData)
}

export interface ToggleEnabledLoggerOptions {
  deep: DeepClient;
}

async function toggleDisabledFunction(options: ToggleDisabledFunctionOptions) {
  const log = debug(`deep-memo-app:${toggleDisabledFunction.name}`);
  log({options})
  const {deep} = options
  
  const handleInsertTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleInsert")
  log({handleInsertTypeLinkId})
  const insertHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "InsertHandler")
  log({insertHandlerTypeLinkId})
  const handleUpdateTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleUpdate")
  log({handleUpdateTypeLinkId})
  const   updateHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "UpdateHandler")
  log({updateHandlerTypeLinkId})
  const handleDeleteTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "HandleDelete")
  log({handleDeleteTypeLinkId})
  const deleteHandlerTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/logger'], "DeleteHandler")
  log({deleteHandlerTypeLinkId})
  const deviceTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-device'], "Device");
  log({deviceTypeLinkId})
  const motionTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-motion'], "Motion");
  log({motionTypeLinkId})
  const positionTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-geolocation'], "Position");
  log({positionTypeLinkId})
  const networkTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/capacitor-network'], "Network");
  log({networkTypeLinkId})
  const typesLinkIdsToLog = [
    deviceTypeLinkId,
    motionTypeLinkId,
    positionTypeLinkId,
    networkTypeLinkId
  ]
  log({typesLinkIdsToLog})
  const containTypeLinkId = deep.idLocal(REQUIRED_PACKAGES['@deep-foundation/core'], "Contain")
  log({containTypeLinkId})
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

export interface ToggleDisabledFunctionOptions {
  deep: DeepClient;
}