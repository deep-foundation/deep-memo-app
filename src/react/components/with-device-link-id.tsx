import { useToast, VStack, CircularProgress, Text } from "@chakra-ui/react";
import { useDeviceLink, WithDeviceSync } from "@deep-foundation/capacitor-device";
import { useLocalStore } from "@deep-foundation/store/local";
import { useEffect } from "react";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { DecoratedDeep } from "./with-decorated-deep";
import { Loading } from "./loading";

export interface WithDeviceLinkIdOptions {
  deep: DecoratedDeep;
  renderChildren: (props: { deviceLinkId: number }) => JSX.Element;
  containerLinkId?: number;
}

export function WithDeviceLinkId({
  deep: deep,
  renderChildren: renderChildren,
  containerLinkId = deep.linkId!,
}: WithDeviceLinkIdOptions) {
  const [deviceLinkIdFromStore, setDeviceLinkIdFromStore] = useLocalStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    undefined
  );
  
  const toast = useToast();

  const { deviceLinkId, error, isLoading } = useDeviceLink({
    deep: deep,
    containerLinkId,
    initialDeviceLinkId: deviceLinkIdFromStore,
  });

  useEffect(() => {
    if (error) {
      handleError(error);
    }
    if (deviceLinkId && deviceLinkId !== deviceLinkIdFromStore) {
      setDeviceLinkIdFromStore(deviceLinkId);
    }
  }, [deviceLinkId, error]);

  function handleError(error: any) {
    if (error instanceof Error) {
      toast({
        title: "Failed to get device",
        description: error.message,
        status: "error",
        duration: null,
        isClosable: true,
      });
    } else {
      throw error;
    }
  }

  if (isLoading || !deviceLinkIdFromStore) {
    return <Loading description="Initializing device..." />;
  }

  return (
    <WithDeviceSync
      containerLinkId={deep.linkId}
      deep={deep}
      deviceLinkId={deviceLinkIdFromStore}
      renderIfLoading={() => (
        <Loading description="Synchronizing device data..." />
      )}
    >
      {renderChildren({ deviceLinkId: deviceLinkIdFromStore })}
    </WithDeviceSync>
  );
}



