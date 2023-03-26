import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export async function getIsLinkExist({deep, linkName} : {deep: DeepClient, linkName: string}): Promise<boolean> {

  const linkId = await deep.id(deep.linkId, linkName)

  const isLinkExist = typeof(linkId) === "number"

    return isLinkExist;
}