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

function Page() {
  const deep = useDeep();

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  useEffect(() => {
    if(deep.linkId === 0) {
      deep.guest();
    }
  }, []);

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId != 0) {
        const adminLinkId = await deep.id('deep', 'admin');
        if (deep.linkId != adminLinkId) {

          await deep.login({
            linkId: adminLinkId,
          });
        }
      }
    });
  }, [deep]);

  useEffect(() => {
    if(deep.linkId == 0) {
      return;
    }
    self["deep"] = deep;
    new Promise(async () => {
      const adminLinkId = await deep.id('deep', 'admin');
      if (deep.linkId != adminLinkId) {
        return;
      }

      await applyPackageLinksToMinilinks({
        deep,
        packageName: DEVICE_PACKAGE_NAME
      })
     
      if (!deviceLinkId) {
        const deviceLinkId = await insertDevice({deep});
        setDeviceLinkId(deviceLinkId);
      }
    });
  }, [deep]);

  useEffect(() => {
    if(!deviceLinkId) {
      return
    };
    
  }, [deviceLinkId])

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
