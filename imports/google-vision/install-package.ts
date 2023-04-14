import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import fs from 'fs';
const { generateApolloClient } = require('@deep-foundation/hasura/client');
require('dotenv').config();
export async function installPackage() {
  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
    ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
      ? false
      : true,
  });

  const unloginedDeep = new DeepClient({ apolloClient });
  const guest = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
  const admin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  const deep = new DeepClient({ deep: guestDeep, ...admin });

  const syncTextFileTypeLinkId = await deep.id('@deep-foundation/core', "SyncTextFile");
  const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");
  const dockerSupportsJsLinkId = await deep.id('@deep-foundation/core', "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id('@deep-foundation/core', "Handler");
  const handleInsertLinkId = await deep.id('@deep-foundation/core', "HandleInsert");
  const packageTypeLinkId = await deep.id('@deep-foundation/core', "Package");
  const joinTypeLinkId = await deep.id('@deep-foundation/core', "Join");
  const PACKAGE_NAME='@flakeed/google-vision';
  
  const { data: [{ id: packageLinkId }] } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: deep.linkId
        },
      ]
    },
    out: {
      data: [
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]
    },
  });

  await deep.insert({
    type_id: syncTextFileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: "FileInsertHandlerCode" } },
        },
        {
          from_id: dockerSupportsJsLinkId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: { data: { value: "FileInsertHandler" } },
              },
              {
                type_id: handleInsertLinkId,
                from_id: await deep.id('@deep-foundation/core', "AsyncFile"),
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageLinkId,
                      string: { data: { value: "HandleFileInsert" } },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    string: {
      data: {
        value: fs.readFileSync('/workspace/dev/packages/sdk/imports/google-vision/media-handler.js', { encoding: 'utf-8' }),
      },
    },
  });
}

installPackage();