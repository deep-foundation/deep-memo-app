import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { PACKAGE_NAME } from './package-name';
import { Device, DeviceInfo } from '@capacitor/device';
import { BoolExpLink, MutationInputLink, MutationInputValue } from '@deep-foundation/deeplinks/imports/client_types';
import _ from 'lodash';

export async function insertGeneralInfoToDeep({ deep, deviceLinkId, deviceGeneralInfo }: { deep: DeepClient, deviceLinkId: number, deviceGeneralInfo: DeviceInfo }) {
  if (!deviceLinkId) {
    throw new Error("deviceLinkId must not be 0")
  }

  const containTypeLinkId = deep.idLocal('@deep-foundation/core', 'Contain');
  const { data: deviceTreeLinksDownToParentDevice } = await deep.select({
    up: {
      tree_id: {
        _id: [PACKAGE_NAME, "DeviceTree"]
      },
      parent_id: { _eq: deviceLinkId }
    }
  });

  const updatesData: {
    exp: any,
    value: any,
    options: any
  }[] = [];

  const insertsData: MutationInputLink[] = [];

  for (const [key, value] of Object.entries(deviceGeneralInfo)) {
    const typeLinkId = deep.idLocal(PACKAGE_NAME, _.camelCase(key))
    const link = deviceTreeLinksDownToParentDevice.find(link => link.type_id ===  typeLinkId);
    if(link) {
      updatesData.push({
        exp: {
          link_id: link.id,
        },
        value: {
          value: value,
        },
        options: {
          // @ts-ignore
          table: (typeof value) + 's'
        }
      })
    } else {
      insertsData.push({
        type_id: typeLinkId,
        string: { data: { value: value } },
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deviceLinkId,
          },
        },
      });
    }
  }

  await deep.insert(insertsData);

  for (const updateData of updatesData) {
    await deep.update(
      updateData.exp,
      updateData.value,
      updateData.options
    )
  }
}
