import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { useEffect, useState } from "react";
import { PackagesInMinilinks } from "../imports/packages-in-minilinks";
import { BoolExpLink } from "@deep-foundation/deeplinks/imports/client_types";
import { CircularProgress, CircularProgressLabel, Text } from "@chakra-ui/react";

export function WithMinilinksApplied(options: WithMinilinksAppliedOptions) {
  const { deep, children } = options;
  const [isMinilinksApplied, setIsMinilinksApplied] = useState(false);

  useEffect(() => {
    new Promise(async () => {
      if (!isMinilinksApplied) {
        const linksToApply = await getLinksToApply({deep});
        deep.minilinks.apply(linksToApply.data);
        setIsMinilinksApplied(true);
      }
    })
  }, [isMinilinksApplied])

  return isMinilinksApplied ? (
    <CircularProgress >
      <CircularProgressLabel>Storing links in minilinks... </CircularProgressLabel>
    </CircularProgress>
  ) : (
    children
  )
}

async function getLinksToApply(options: GetLinksToApplyOptions) {
  const { deep } = options;
  const packageNamesToApply = Object.values(PackagesInMinilinks);
  const selectData: BoolExpLink = {
    up: {
      tree_id: {
        _id: ["@deep-foundation/core", "containTree"]
      },
      parent: {
        _or: packageNamesToApply.map(packageName => ({
          id: {
            _id: [packageName]
          }
        }))
      }
    }
  }
  return await deep.select(selectData);
}

interface GetLinksToApplyOptions {
  deep: DeepClient
}

export interface WithMinilinksAppliedOptions {
  deep: DeepClient,
  children: JSX.Element
}