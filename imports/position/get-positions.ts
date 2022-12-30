import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function getPositions(deep: DeepClient, deviceLinkId: number) {
  const geolocationEarthTypeLinkId = await deep.id("@deep-foundation/geolocation", "earth"); // TODO: this should be in args

  if(!deviceLinkId) {
		throw new Error("deviceLinkId must not be 0")
	}

  const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
  const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
  const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');
  
  const {data: [{}]} = await deep.select({
		type_id: {
      _in: [xTypeLinkId, yTypeLinkId, zTypeLinkId]
		},
    from_id: deviceLinkId,
    to_id: geolocationEarthTypeLinkId,
	})

}