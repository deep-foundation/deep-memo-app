import { ChakraProvider } from "@chakra-ui/react";
import { DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { TokenProvider } from "@deep-foundation/deeplinks/imports/react-token";
import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../imports/capacitor-store-keys";
import { LoginOrContent } from "./login-or-content";
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';

export function ProvidersAndLoginOrContent({ children }: { children: JSX.Element }) {
  const [gqlPath, setGqlPath] = useLocalStore(CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath], undefined)
  return (
    <>
      <ChakraProvider>
        <TokenProvider>
          <ApolloClientTokenizedProvider
            options={{
              client: 'deeplinks-app',
              path: gqlPath,
              ssl: true,
              ws: !!process?.browser,
            }}
          >
            <DeepProvider>
              <LoginOrContent gqlPath={gqlPath} setGqlPath={(newGqlPath) => {
                console.log({ newGqlPath })
                setGqlPath(newGqlPath)
              }} >
                {children}
              </LoginOrContent>
            </DeepProvider>
          </ApolloClientTokenizedProvider>
        </TokenProvider>
      </ChakraProvider>
    </>
  );
}