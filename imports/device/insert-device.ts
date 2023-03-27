import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function insertDevice({deep}: {deep: DeepClient}) {
  console.log("Insert device")
  const deviceTypeLinkId = deep.idLocal(PACKAGE_NAME, 'Device');
  const containTypeLinkId = deep.idLocal(
    '@deep-foundation/core',
    'Contain'
  );
  console.log({
    type_id: deviceTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      ],
    },
  })
  const {
    data: [{ id: deviceLinkId }],
  } = await deep.insert({
    type_id: deviceTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      ],
    },
  });
  return {
    deviceLinkId: deviceLinkId
  }
}