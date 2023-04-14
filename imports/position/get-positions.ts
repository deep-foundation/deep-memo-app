import { DeepClient, DeepClientResult } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";
import { PACKAGE_NAME as PACKAGE_NAME_GEOLOCATION } from "../geolocation/package-name";

export async function getPositions({deep, deviceLinkId, space, callback}: {deep: DeepClient, deviceLinkId: number, space?: string, callback?: (positions: DeepClientResult<any>) => any}) {
  try {
    const geolocationSpaceTypeLinkId = await deep.id(PACKAGE_NAME_GEOLOCATION, space || "Earth");

    if(!deviceLinkId) {
      throw new Error("deviceLinkId must not be 0");
    }

    const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
    const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
    const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');
    // const positionTreeLinkId = await deep.id(PACKAGE_NAME, 'PositionTree');

    const positions = await deep.select({
      type_id: {
        _in: [xTypeLinkId, yTypeLinkId, zTypeLinkId]
      },
      from_id: deviceLinkId,
      to_id: geolocationSpaceTypeLinkId,
    });

    // const linksDownToEarthMp = await deep.select({
    //   up: {
    //     parent_id: { _eq: geolocationSpaceTypeLinkId },
    //     tree_id: { _eq: positionTreeLinkId }
    //   }
    // },
    // {
    //   returning: `type_id id from_id to_id 
    //     to {
    //       value 
    //     }
    //   `
    // });
    // console.log({linksDownToEarthMp});

    callback?.(positions);
  return positions;
  } catch (error) {
    console.error(error);
    callback?.(null);
    return null;
  }
}