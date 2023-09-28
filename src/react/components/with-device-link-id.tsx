import { useToast, VStack, CircularProgress, Text } from "@chakra-ui/react";
import { useDeviceLink, WithDeviceSync } from "@deep-foundation/capacitor-device";
import { useLocalStore } from "@deep-foundation/store/local";
import { useEffect } from "react";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";
import { DecoratedDeep } from "./with-decorated-deep";
import { Loading } from "./loading";
import { packageLog } from "../../package-log";

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
  const log = packageLog.extend(WithDeviceLinkId.name)
  const [deviceLinkIdFromStore, setDeviceLinkIdFromStore] = useLocalStore<number | undefined>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    undefined
  );
  log({ deviceLinkIdFromStore, setDeviceLinkIdFromStore })
  
  const toast = useToast();
  log({ toast })

  const useDeviceLinkResult = useDeviceLink({
    deep: deep,
    containerLinkId,
    initialDeviceLinkId: deviceLinkIdFromStore,
  });
  log({ useDeviceLinkResult })
  const { deviceLinkId, error, isLoading } = useDeviceLinkResult

  useEffect(() => {
    if (error) {
      log(`Going to handle error`, error)
      handleError(error);
    }
    if (deviceLinkId && deviceLinkId !== deviceLinkIdFromStore) {
      log(`Actual device link id and device link id from store are different. Setting device link id from store to ${deviceLinkId}`)
      setDeviceLinkIdFromStore(deviceLinkId);
    }
  }, [deviceLinkId, error]);

  function handleError(error: any) {
    const handleErrorLog = log.extend(handleError.name);
    handleErrorLog({ error });
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



