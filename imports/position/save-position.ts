import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";
import { PACKAGE_NAME as PACKAGE_NAME_GEOLOCATION } from "../geolocation/package-name";

export async function savePosition(deep: DeepClient, deviceLinkId: number, coordinates: {x: number, y: number, z: number}) {
  const geolocationEarthTypeLinkId = await deep.id(PACKAGE_NAME_GEOLOCATION, "Earth");

  if(!deviceLinkId) {
    throw new Error("deviceLinkId must not be 0")
  }
  console.log({deviceLinkId});

  const xTypeLinkId = await deep.id(PACKAGE_NAME, 'X');
  const yTypeLinkId = await deep.id(PACKAGE_NAME, 'Y');
  const zTypeLinkId = await deep.id(PACKAGE_NAME, 'Z');
  console.log({coordinates});

  const coordinatesLinks = [
    coordinates?.x && {
      type_id: xTypeLinkId,
      from_id: deviceLinkId,
      to_id: geolocationEarthTypeLinkId,
      string: { data: { value: (coordinates?.x || "").toString() } },
    },
    coordinates?.y && {
      type_id: yTypeLinkId,
      from_id: deviceLinkId,
      to_id: geolocationEarthTypeLinkId,
      string: { data: { value: (coordinates?.y || "").toString() } },
    },
    coordinates?.z && {
      type_id: zTypeLinkId,
      from_id: deviceLinkId,
      to_id: geolocationEarthTypeLinkId,
      string: { data: { value: (coordinates?.z || "").toString() } },
    }
  ].filter((item) => item !== null)
  console.log({coordinatesLinks});

  await deep.insert(coordinatesLinks);

}