import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { useEffect, useState } from "react";
import { BoolExpLink } from "@deep-foundation/deeplinks/imports/client_types";
import { Box, CircularProgress, CircularProgressLabel, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { RequiredPackages } from "../../required-packages";

export function WithMinilinksApplied(options: WithMinilinksAppliedOptions) {
  const { deep, children } = options;
  const [isMinilinksApplied, setIsMinilinksApplied] = useState(undefined);

  useEffect(() => {
    new Promise(async () => {
      if (!isMinilinksApplied) {
        const linksToApply = await getLinksToApply({deep});
        deep.minilinks.apply(linksToApply.data);
        setIsMinilinksApplied(true);
      }
    })
  }, [isMinilinksApplied])

  return isMinilinksApplied ? children : (
    <VStack height="100vh" justifyContent={"center"} >
      <CircularProgress isIndeterminate/>
      <Text >Storing links in minilinks... </Text>
    </VStack>
  )
}

async function getLinksToApply(options: GetLinksToApplyOptions) {
  const { deep } = options;
  const packageNamesToApply = Object.values(RequiredPackages);
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