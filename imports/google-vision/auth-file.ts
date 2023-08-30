import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from './install-package';

export default async function insertGoogleCloudAuthFile(deep: DeepClient, credentials) {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const googleCloudAuthKeyTypeLink = await deep.id(PACKAGE_NAME, "GoogleCloudAuthFile");
  const userLink = await deep.id('deep', 'admin');

  const { data: [{ id: googleCloudAuthKeyLinkId }] } = await deep.insert({
    type_id: googleCloudAuthKeyTypeLink,
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