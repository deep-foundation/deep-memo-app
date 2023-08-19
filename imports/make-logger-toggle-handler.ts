import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { ChangeEvent } from "react";

export function makeLoggerToggleHandler(options: MakeLoggerToggleHandlerOptions) {
  const { isLoggerEnabled, setIsLoggerEnabled, setIsLoading, toast } = options;
  return async function toggleLoggerHandler(event: ChangeEvent<HTMLElement>) {
    event.preventDefault();

    setIsLoading(true)
    try {
      setIsLoggerEnabled(!isLoggerEnabled);
    } catch (error) {
      toast({
        title: 'Failed to toggle logger',
        description: error.message,
        status: 'error',
        duration: null,
        isClosable: true,
      })
    } finally {
      setIsLoading(false);
    }
  }
};

export interface MakeLoggerToggleHandlerOptions {
  isLoggerEnabled: boolean;
  setIsLoggerEnabled: (isLoggerEnabled: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toast: (options?: UseToastOptions) => ToastId
}