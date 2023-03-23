import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function initializePackage(deep: DeepClient) {

  const typeTypeLinkId = await deep.id("@deep-foundation/core", "Type");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const packageTypeLinkId = await deep.id("@deep-foundation/core", "Package");
  const joinTypeLinkId = await deep.id("@deep-foundation/core", "Join");
  const valueTypeLinkId = await deep.id("@deep-foundation/core", "Value");
  const numberTypeLinkId = await deep.id("@deep-foundation/core", "Number");
  const deviceTypeLinkId = await deep.id("@deep-foundation/device", "Device");
  const treeTypeLinkId = await deep.id('@deep-foundation/core', 'Tree');
  const geolocationSpaceTypeLinkId = await deep.id("@deep-foundation/geolocation", "Space");
  const treeIncludeNodeTypeLinkId = await deep.id("@deep-foundation/core", "TreeIncludeNode");

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

  const { data: [{ id: positionTreeLinkId }] } = await deep.insert({
    type_id: treeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'PositionTree' } },
      },
    }
  })

  const { data: [{ id: xTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: [
      {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'X' } },
      },
      {
        type_id: treeIncludeNodeTypeLinkId,
        from_id: positionTreeLinkId,
        in: {
          data: [
            {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
            },
          ],
        },
      }
    ]},
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: numberTypeLinkId
      },
    },
  });

  const { data: [{ id: yTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: [
      {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Y' } },
      },
      {
        type_id: treeIncludeNodeTypeLinkId,
        from_id: positionTreeLinkId,
        in: {
          data: [
            {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
            },
          ],
        },
      }
    ]},
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: numberTypeLinkId
      },
    },
  });

  const { data: [{ id: zTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: deviceTypeLinkId,
    to_id: geolocationSpaceTypeLinkId,
    in: { data: [
      {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Z' } },
      },
      {
        type_id: treeIncludeNodeTypeLinkId,
        from_id: positionTreeLinkId,
        in: {
          data: [
            {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
            },
          ],
        },
      }
    ]},
    out: {
      data: {
        type_id: valueTypeLinkId,
        to_id: numberTypeLinkId
      },
    },
  });

}