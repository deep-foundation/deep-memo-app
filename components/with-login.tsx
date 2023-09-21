import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useState, useEffect } from "react";
import { Login } from "./login";
import { useToast } from "@chakra-ui/react";
import { CapacitorStoreKeys } from "../imports/capacitor-store-keys";
import { processEnvs } from "../imports/process-envs";
import { useCapacitorStore } from "@deep-foundation/store/capacitor";

export function WithLogin({ gqlPath, setGqlPath, children }: { gqlPath: string | undefined, setGqlPath: (gqlPath: string | undefined) => void, children: JSX.Element }) {
  const toast = useToast();
  const deep = useDeep();
  const [isAuthorized, setIsAuthorized] = useState(undefined);
  const [token, setToken] = useCapacitorStore(CapacitorStoreKeys[CapacitorStoreKeys.DeepToken], processEnvs.deepToken);
  console.log({token})

  useEffect(() => {
    if(gqlPath || token) {
      deep.login({token})
    }
  }, [token])

  useEffect(() => {
    new Promise(async () => {
      
    self["deep"] = deep
    if (deep.linkId !== 0) {
      try {
        await deep.select({id: 1})
        setIsAuthorized(true);
      } catch (error) {
        setGqlPath(undefined);
        await deep.logout();
        toast({
          title: "Login failed",
          description: error.message,
          status: "error",
          duration: null,
          isClosable: true,
        })
      }
    } else {
      setIsAuthorized(false);
    }
    })
  }, [deep]);

  return isAuthorized && gqlPath ? children : (
    <Login
      onSubmit={async (arg) => {
        setGqlPath(arg.gqlPath);
        setToken(arg.token)
      }}
    />
  );
}