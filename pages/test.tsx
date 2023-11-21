import React from "react";
import {
  CapacitorStoreProvider,
  useCapacitorStore,
} from "@deep-foundation/store/capacitor";
import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { Preferences } from "@capacitor/preferences";

function Content() {
  const key = "aaa";
  const [state, setState] = useCapacitorStore(key, "false");

  return (
    <Stack>
      <Text>State: {state.toString()}</Text>
      <Card>
        <CardHeader>
          <Heading>Data Synchronization</Heading>
        </CardHeader>
        <CardBody>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="sync-call-history-switch" mb="0">
              Synchronize All Data
            </FormLabel>
            <Switch
              id="sync-call-history-switch"
              onChange={(event) => {
                const { checked } = event.target;
                Preferences.set({ key: key, value: checked.toString() });
              }}
            />
          </FormControl>
        </CardBody>
      </Card>
    </Stack>
  );
}

export default function IndexPage() {
  return (
    <ChakraProvider>
      <CapacitorStoreProvider>
        <Content />
      </CapacitorStoreProvider>
    </ChakraProvider>
  );
}
