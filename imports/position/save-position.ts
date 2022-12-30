import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function savePosition(deep: DeepClient, deviceLinkId: number, coordinates: {x: number, y: number, z: number}) {
  const geolocationEarthTypeLinkId = await deep.id("@deep-foundation/geolocation", "earth");

  if(!deviceLinkId) {
		throw new Error("deviceLinkId must not be 0")
	}

	const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
  const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
  const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
  const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');

	const {
		data: [{ id: xLinkId }],
	} = await deep.insert({
		type_id: xTypeLinkId,
    from_id: deviceLinkId,
    to_id: geolocationEarthTypeLinkId,
		number: { data: { value: coordinates?.x } },
	});

	const {
		data: [{ id: yLinkId }],
	} = await deep.insert({
		type_id: yTypeLinkId,
    from_id: deviceLinkId,
    to_id: geolocationEarthTypeLinkId,
		number: { data: { value: coordinates?.y } },
	});

  const {
		data: [{ id: zLinkId }],
	} = await deep.insert({
		type_id: zTypeLinkId,
    from_id: deviceLinkId,
    to_id: geolocationEarthTypeLinkId,
		number: { data: { value: coordinates?.z } },
	});
}