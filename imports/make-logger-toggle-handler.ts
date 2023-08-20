import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent } from "react";
import { toggleLogger } from "../components/toggle-logger";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export function makeLoggerToggleHandler(options: MakeLoggerToggleHandlerOptions) {
  const { isLoggerEnabled, setIsLoggerEnabled, setIsLoading, toast, deep } = options;
  return async function toggleLoggerHandler(event: SyntheticEvent) {
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