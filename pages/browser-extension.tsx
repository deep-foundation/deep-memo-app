import { useEffect, useState } from "react";
import { Button, ChakraProvider, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep, } from "@deep-foundation/deeplinks/imports/client";
import { Provider } from "../imports/provider";
import installPackage from "../imports/browser-extension/install-package";
import { PACKAGE_NAME } from "../imports/browser-extension/install-package";
import Tab from "./tab";
import uploadHistory from "../imports/browser-extension/upload-history";
import uploadTabs from "../imports/browser-extension/upload-tabs";

export function Extension() {
  const deep = useDeep();
  // const [tabs, setTabs] = useLocalStore("Tabs", []);
  // const [history, setHistory] = useLocalStore("History", []);
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  useEffect(() => {
    chrome.storage.sync.set({ DEVICE_LINK_ID: deviceLinkId, PACKAGE_NAME: PACKAGE_NAME, GQL_URL: `https://${process.env.NEXT_PUBLIC_GQL_PATH}`, GQL_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4iLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzc2In0sImlhdCI6MTY3OTkzNTMyOH0.LmDNulSTSSrm7gKno3E1sBLAhz5TKi-SFBl9oFNfs-k" },
      () => { console.log("Settings saved"); });
  }, [])

  // const getTabs = async () => {
  //   if (typeof (window) === "object") {
  //     const tabs = await chrome.tabs.query({});
  //     setTabs(tabs);
  //   }
  // }

  // const getHistory = async () => {
  //   if (typeof (window) === "object") {
  //     const history = await chrome.history.search({ text: '', maxResults: 10 });
  //     setHistory(history);
  //   }
  // }

  // useEffect(() => {
  //   const upload = async (tabs) => {
  //     await uploadTabs(deep, deviceLinkId, tabs);
  //     setTabs([]);
  //   }
  //   if (tabs.length > 0) upload(tabs);
  // }, [tabs])

  // useEffect(() => {
  //   const upload = async (history) => {
  //     await uploadHistory(deep, deviceLinkId, history);
  //     setHistory([]);
  //   }
  //   if (history.length > 0) upload(history);
  // }, [history])

  const handleUploadHistory = () => {
    chrome.runtime.sendMessage({ action: "uploadHistory" });
  };

  const handleUploadTabs = () => {
    chrome.runtime.sendMessage({ action: "uploadTabs" });
  };

  const createBrowserExtensionLink = async (deep) => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
    const { data: [{ id: browserExtensionLinkId }] } = await deep.insert({
      type_id: await deep.id(PACKAGE_NAME, "BrowserExtension"),
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: deviceLinkId,
          string: { data: { value: "BrowserExtension" } },
        }]
      }
    })
  }

  return (
    <>
      <Stack>
        <Text suppressHydrationWarning>Device link id: {deviceLinkId ?? " "}
        </Text>
        <Button onClick={async () => await installPackage(deviceLinkId)}>
          INITIALIZE PACKAGE
        </Button>
        <Button onClick={async () => await createBrowserExtensionLink(deep)}>
          CREATE NEW CONTAINER LINK
        </Button>
        <Button onClick={handleUploadHistory}>UPLOAD HISTORY</Button>
        <Button onClick={handleUploadTabs}>SUBSCRIBE TABS</Button>
      </Stack>
      <Stack spacing={3}>
        <Input placeholder='extra small size' size='sm' />
        <Input placeholder='extra small size' size='sm' />
      </Stack>
      {/* {tabs?.map((tab) => (<Tab type="tab" key={tab.id} id={tab.id} favIconUrl={tab.favIconUrl} title={tab.title} url={tab.url} />))} */}
    </>
  )
}

export default function Page() {
  return (
    <>
      <ChakraProvider>
        <Provider>
          <DeepProvider>
            <Extension />
          </DeepProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}