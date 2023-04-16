import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from './install-package';

export default async function insertGcloudAuthFile(deep: DeepClient, credentials) {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const gcloudAuthKeyTypeLink = await deep.id(PACKAGE_NAME, "GoogleCloudAuthFile");
  const userLink = await deep.id('deep', 'admin');

  const { data: [{ id: gcloudAuthKeyLinkId }] } = await deep.insert({
    type_id: gcloudAuthKeyTypeLink,
    object: { data: { value: credentials } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: userLink,
          string: { data: { value: "GoogleCloudAuthFile" } },
        }
      ]
    }
  })
}