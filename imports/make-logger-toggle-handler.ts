import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent } from "react";
import { toggleLogger } from "../components/toggle-logger";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import debug from "debug";

export function makeLoggerToggleHandler(options: MakeLoggerToggleHandlerOptions) {
  const log = debug(`deep-memo-app:${makeLoggerToggleHandler.name}`);
  log({options})
  const { isLoggerEnabled, setIsLoggerEnabled, setIsLoading, toast, deep } = options;
  return async function toggleLoggerHandler(event: SyntheticEvent) {
    const log = debug(`deep-memo-app:${toggleLoggerHandler.name}`);
    log({event})
    event.preventDefault();

    setIsLoading(true)
    await toggleLogger({
      deep,
      isLoggerEnabled,
      onError: (error) => {
        toast({
          title: 'Failed to toggle logger',
          description: error.message,
          status: 'error',
          duration: null,
          isClosable: true,
        })
        console.error(error)
      },
      onSuccess: () => {
        setIsLoggerEnabled(!isLoggerEnabled)
      }
    })
    setIsLoading(false)
  }
};

export interface MakeLoggerToggleHandlerOptions {
  deep: DeepClient;
  isLoggerEnabled: boolean;
  setIsLoggerEnabled: (isLoggerEnabled: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toast: (options?: UseToastOptions) => ToastId
}