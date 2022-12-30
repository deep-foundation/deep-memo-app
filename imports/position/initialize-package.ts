import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function initializePackage(deep: DeepClient) {

  const typeTypeLinkId = await deep.id("@deep-foundation/core", "Type");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const packageTypeLinkId = await deep.id("@deep-foundation/core", "Package");
  const joinTypeLinkId = await deep.id("@deep-foundation/core", "Join");
  const deviceTypeLinkId = await deep.id("@deep-foundation/device", "Device");
  const geolocationSpaceTypeLinkId = await deep.id("@deep-foundation/geolocation", "Space");

  const { data: [{ id: packageLinkId }] } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: { data: [
      {
        type_id: containTypeLinkId,
        from_id: deep.linkId
      },
    ] },
    out: { data: [
      {
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'users', 'packages'),
      },
      {
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'admin'),
      },
    ] },
  });

  const { data: [{ id: spaceTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: {
      type_id: containTypeLinkId,
      from_id: packageLinkId,
      string: { data: { value: 'Space' } },
    } },
  });

  const { data: [{ id: xTypeLinkId }] } = await deep.insert({
    type_id: spaceTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: {
      type_id: containTypeLinkId,
      from_id: packageLinkId,
      string: { data: { value: 'X' } },
    } },
  });

  const { data: [{ id: yTypeLinkId }] } = await deep.insert({
    type_id: spaceTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: {
      type_id: containTypeLinkId,
      from_id: packageLinkId,
      string: { data: { value: 'Y' } },
    } },
  });

  const { data: [{ id: zTypeLinkId }] } = await deep.insert({
    type_id: spaceTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: {
      type_id: containTypeLinkId,
      from_id: packageLinkId,
      string: { data: { value: 'Z' } },
    } },
  });

}