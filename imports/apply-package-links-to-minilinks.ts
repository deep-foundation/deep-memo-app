import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { BoolExpLink } from "@deep-foundation/deeplinks/imports/client_types";

export async function applyPackageLinksToMinilinks({deep, packageName}: {deep: DeepClient, packageName: string}) {
  const devicePackageSelectData: BoolExpLink = {
    type_id: {
      _id: ['@deep-foundation/core', "Package"]
    },
    string: {
      value: packageName
    }
  };
  
  const containSelectData: BoolExpLink = {
    type_id: {
      _id: ['@deep-foundation/core', "Contain"]
    },
    from: devicePackageSelectData
  };
  
  const packageLinksSelectData: BoolExpLink = {
    in: containSelectData
  }
  const {data} = await deep.select({
    _or: [
      devicePackageSelectData, containSelectData, packageLinksSelectData
    ]
  })
  deep.minilinks.apply(data)
}