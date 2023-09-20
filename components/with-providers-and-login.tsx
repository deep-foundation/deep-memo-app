import { ChakraProvider } from "@chakra-ui/react";
import { DeepContext, DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { TokenProvider } from "@deep-foundation/deeplinks/imports/react-token";
import { CapacitorStoreKeys } from "../imports/capacitor-store-keys";
import { WithLogin } from "./with-login";
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { useContext } from "react";
import { processEnvs } from "../imports/process-envs";
import { useLocalStore } from "@deep-foundation/store/local";

export function WithProvidersAndLogin({ children }: { children: JSX.Element }) {
  const [gqlPath, setGqlPath] = useLocalStore(CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath], processEnvs.graphQlPath)
  console.log("gqlPath: ", gqlPath)
  console.log("gqlPathFromEnv: ", processEnvs.graphQlPath)
  return (
    <>
      <ChakraProvider>
        <TokenProvider>
          <ApolloClientTokenizedProvider
            options={{
              client: 'deeplinks-app',
              path: gqlPath && ((new URL(gqlPath)).host + (new URL(gqlPath)).pathname + (new URL(gqlPath)).search + (new URL(gqlPath)).hash),
              ssl: true,
              ws: !!process?.browser,
            }}
          >
            <DeepProvider>
              <WithLogin gqlPath={gqlPath} setGqlPath={(newGqlPath) => {
                setGqlPath(newGqlPath)
              }} >
                {children}
              </WithLogin>
            </DeepProvider>
          </ApolloClientTokenizedProvider>
        </TokenProvider>
      </ChakraProvider>
    </>
  );
}