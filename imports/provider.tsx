import { ChakraProvider } from '@chakra-ui/react';
import { DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { TokenProvider, useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { CapacitorStoreProvider } from '@deep-foundation/store/capacitor';
import { QueryStoreProvider } from '@deep-foundation/store/query';

export function Provider({
	children,
	gqlPath,
	isSsl,
}: {
	children: JSX.Element;
	gqlPath: string;
	isSsl: boolean;
}) {
	return null
};