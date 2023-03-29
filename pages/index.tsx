import React, { useEffect, useMemo, useState } from 'react';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import {
  TokenProvider,
  useTokenController,
} from '@deep-foundation/deeplinks/imports/react-token';
import { useQuery, useSubscription, gql } from '@apollo/client';
import {
  LocalStoreProvider,
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  MinilinksLink,
  MinilinksResult,
  useMinilinksConstruct,
} from '@deep-foundation/deeplinks/imports/minilinks';
import { ChakraProvider, Text } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import {
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import Link from 'next/link';
import { PACKAGE_NAME as DEVICE_PACKAGE_NAME, PACKAGE_NAME } from '../imports/device/package-name';
import { getIsPackageInstalled } from '../imports/get-is-package-installed';
import { BoolExpLink } from '@deep-foundation/deeplinks/imports/client_types';
import { insertDevice } from '../imports/device/insert-device';
import { applyPackageLinksToMinilinks } from '../imports/apply-package-links-to-minilinks';
import { updateOrInsertGeneralInfoToDeep } from '../imports/device/insert-general-info-to-deep';
import { Device } from '@capacitor/device';

function Page() {
  const deep = useDeep();
  
  const [adminLinkId, setAdminLinkId] = useState<number|undefined>(undefined);

  const [areLinksAppliedToMinilinks, setAreLinksAppliedToMinilinks] = useState<boolean>(false);

  const [deviceLinkId, setDeviceLinkId] = useLocalStore<number|undefined>(
    'deviceLinkId',
    undefined
  );

  
  const [isDeepReady, setIsDeepReady] = useState(false); 
  const [areDeepAndMinilinksReady, setAreDeepAndMinilinksReady] = useState(false);

  useEffect(() => {
    if(deep.linkId === 0) {
      deep.guest();
    }
    self["deep"] = deep;
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId != 0) {
        const adminLinkId = await deep.id('deep', 'admin');
        setAdminLinkId(adminLinkId)
      }
    })
  }, [deep])

  useEffect(() => {
    new Promise(async () => {
      if (!adminLinkId) {
        return
      }
      
      if (deep.linkId != adminLinkId) {
        await deep.login({
          linkId: adminLinkId,
        });
      }
    });
  }, [deep, adminLinkId]);

  useEffect(() => {
    if(!isDeepReady || areLinksAppliedToMinilinks) {
      return
    }
    
    new Promise(async () => {
      console.log("before applyPackageLinksToMinilinks")
      await applyPackageLinksToMinilinks({
        deep,
        packageName: DEVICE_PACKAGE_NAME
      });
      setAreLinksAppliedToMinilinks(true);
    });
  });

  useEffect(() => {
    if(!areDeepAndMinilinksReady) {
      return;
    }
    
    if (!deviceLinkId) {
      new Promise(async () => {
        console.log("before insert device")
        const {deviceLinkId} = await insertDevice({deep});
        console.log("afetr insert device")
        setDeviceLinkId(deviceLinkId);
      })
    }
  })

  useEffect(() => {
    console.log("Before update", {deviceLinkId, areDeepAndMinilinksReady})
    if(!deviceLinkId || !areDeepAndMinilinksReady) {
      return
    }
    console.log("update")

    new Promise(async () => {
      await updateOrInsertGeneralInfoToDeep({
        deep,
        deviceGeneralInfo: await Device.getInfo(),
        deviceLinkId
      })
    });
  }, [deviceLinkId])

  useEffect(() => {
    setIsDeepReady(adminLinkId !== undefined && deep.linkId === adminLinkId);
  }, [adminLinkId, deep]);

  useEffect(() => {
    setAreDeepAndMinilinksReady(isDeepReady && areLinksAppliedToMinilinks)
  }, [isDeepReady, areLinksAppliedToMinilinks])

  if(!areDeepAndMinilinksReady) {
    return <div>Loading...</div>
  }
  

  return (
    <div>
      <h1>Deep.Foundation sdk examples</h1> 
      <Text suppressHydrationWarning>Authentication Link Id: {deep.linkId ?? " "}</Text> 
      <Text suppressHydrationWarning>Device Link Id: {deviceLinkId ?? " "}</Text>
      {deviceLinkId &&
        <>
          <div>
            <Link href="/all">all subscribe</Link>
          </div>
          <div>
            <Link href="/messanger">messanger</Link>
          </div>
          <div>
            <Link href="/device">device</Link>
          </div>
        </>
      }
    </div>
  );
}

export default function Index() {
  return (
    <>
      <ChakraProvider>
        <Provider>
          <DeepProvider>
            <Page />
          </DeepProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}
