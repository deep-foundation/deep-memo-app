import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function getPositions(deep: DeepClient, deviceLinkId: number) {
  console.log('getPositions');
  console.log({deep, deviceLinkId});
  const geolocationEarthTypeLinkId = await deep.id("@deep-foundation/geolocation", "earth"); // TODO: this should be in args
  console.log({geolocationEarthTypeLinkId});

  if(!deviceLinkId) {
    throw new Error("deviceLinkId must not be 0");
  }

  const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
  const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
  const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');
  console.log({xTypeLinkId, yTypeLinkId, zTypeLinkId});
  
  const data = await deep.select({
    type_id: {
      _in: [xTypeLinkId, yTypeLinkId, zTypeLinkId]
    },
    from_id: deviceLinkId,
    to_id: geolocationEarthTypeLinkId,
  });
  console.log({data});
  return data;
}