import { VStack, CircularProgress, Text } from "@chakra-ui/react";

export function Loading({ description }: { description: string }) {
  return (
    <VStack height="100vh" justifyContent="center">
      <CircularProgress isIndeterminate />
      <Text>{description}</Text>
    </VStack>
  );
}