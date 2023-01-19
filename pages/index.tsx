import { useState } from "react";
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import {
  DeepProvider,
  useDeep,
} from "@deep-foundation/deeplinks/imports/client";
import { Provider } from "../imports/provider";
import initializePackage, { PACKAGE_NAME } from '../imports/sound-handler/initialize-package';
import insertSoundHandler from "../imports/sound-handler/sound-handler";



const styles = { height: 60, width: 140, background: "grey" }

function SoundHandler() {
  const deep = useDeep();
  const [isauth, setAuth] = useState(false);

  const authUser = async () => {
    await deep.guest();
    const { linkId, token, error } = await deep.login({
      linkId: await deep.id("deep", 'admin')
    })
    token ? setAuth(true) : setAuth(false)
  };

  return (
    <>
      <Stack>
        <Button style={{ background: isauth ? "green" : "red" }} onClick={() => authUser()}>ADMIN</Button>
        <Button onClick={async () => await initializePackage(deep)}>INITIALIZE PACKAGE</Button>
        <Button onClick={async () => await insertSoundHandler(deep)}>CREATE HANDLER</Button>
      </Stack>
    </>
  );
}

export default function Index() {
  return (
    <>
      <ChakraProvider>
        <Provider>
          <DeepProvider>
            <SoundHandler />
          </DeepProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}