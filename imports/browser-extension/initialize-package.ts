import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export const PACKAGE_NAME="@deep-foundation/browser-extension"
export const PACKAGE_TYPES = ["BrowserHistory", "Page", "LastVisitTime", "TypedCount", "Url", "VisitCount", "Title"]

export default async function initializePackage(deep: DeepClient) {
  const packageTypeLinkId = await deep.id('@deep-foundation/core', "Package")
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
  const joinTypeLinkId = await deep.id("@deep-foundation/core", "Join")
  const typeTypeLinkId = await deep.id("@deep-foundation/core", "Type")

  const { data: [{ id: packageLinkId }] } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: {
      data: [{
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      }]
    },
    out: {
      data: [{
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'users', 'packages')
      }, {
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'admin')
      }]
    },
  })

  const { data: [{ id: pacakgeTypeLinkId }] } = await deep.insert(PACKAGE_TYPES.map((TYPE) => ({
    type_id: typeTypeLinkId,
    in: {
      data: [{
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: TYPE } }
      }]
    }
  })))
  
  const { data: [{ id: browserHistoryLinkId }] } = await deep.insert({
    type_id: await deep.id(PACKAGE_NAME, "BrowserHistory"),
    in: {
      data: [{
        type_id: containTypeLinkId,
        from_id: await deep.id('deep', 'admin'),
        string: { data: { value: "BrowserHistory" } },
      }]
    }
  })
}