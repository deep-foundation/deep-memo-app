import { DeepClient, DeepClientResult } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function getPositions({deep, deviceLinkId, space, callback}: {deep: DeepClient, deviceLinkId: number, space?: string, callback?: (positions: DeepClientResult<any>) => any}) {
  try {
    const geolocationSpaceTypeLinkId = await deep.id("@deep-foundation/geolocation", space || "earth");

    if(!deviceLinkId) {
      throw new Error("deviceLinkId must not be 0");
    }

    const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
    const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
    const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');
    
    const positions = await deep.select({
      type_id: {
        _in: [xTypeLinkId, yTypeLinkId, zTypeLinkId]
      },
      from_id: deviceLinkId,
      to_id: geolocationSpaceTypeLinkId,
    });
    callback(positions);
  return positions;
  } catch (error) {
    console.error(error);
    callback(null);
    return null;
  }
}