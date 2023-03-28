import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { PACKAGE_NAME } from './package-name';
import { Device, DeviceInfo } from '@capacitor/device';
import { BoolExpLink, MutationInputLink, MutationInputValue } from '@deep-foundation/deeplinks/imports/client_types';
import _ from 'lodash';

export async function updateOrInsertGeneralInfoToDeep({ deep, deviceLinkId, deviceGeneralInfo }: { deep: DeepClient, deviceLinkId: number, deviceGeneralInfo: DeviceInfo }) {
  if (!deviceLinkId) {
    throw new Error("deviceLinkId must not be 0")
  }

  const containTypeLinkId = deep.idLocal('@deep-foundation/core', 'Contain');
  const falseTypeLinkId = deep.idLocal('@deep-foundation/boolean', 'False');
  const trueTypeLinkId = deep.idLocal('@deep-foundation/boolean', 'True');
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

  const deletesData: BoolExpLink[] = [];
  const insertsData: MutationInputLink[] = [];

  for (const [key, value] of Object.entries(deviceGeneralInfo)) {
    const typeLinkId = deep.idLocal(PACKAGE_NAME, _.chain(key).camelCase().upperFirst().value())
    const link = deviceTreeLinksDownToParentDevice.find(link => link.type_id ===  typeLinkId);
    // Update instead of delete+insert when deep add this feature
    if(typeof value === 'boolean') {
      deletesData.push({
        type_id: typeLinkId,
        from_id: deviceLinkId,
      })
      insertsData.push({
        type_id: typeLinkId,
        from_id: deviceLinkId,
        to_id: value ? trueTypeLinkId : falseTypeLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          },
        },
      })
    } else if(link) {
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
    } else if(!link) {
      insertsData.push({
        type_id: typeLinkId,
        [typeof value]: { data: { value: value } },
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deviceLinkId,
          },
        },
      });
    }
  }

  await deep.delete({
    _or: deletesData
  });
  await deep.insert(insertsData);
  // Update in one query when it will be available
  for (const updateData of updatesData) {
    await deep.update(
      updateData.exp,
      updateData.value,
      updateData.options
    )
  }
}
