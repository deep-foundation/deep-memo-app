import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { generateApolloClient } from '@deep-foundation/hasura/client';
import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
export const PACKAGE_NAME = "@flakeed/google-vision";
export default async function installPackage() {
  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '',
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

  const typeTypeLinkId = await deep.id('@deep-foundation/core', 'Type');
  const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
  const packageTypeLinkId = await deep.id('@deep-foundation/core', 'Package');
  const joinTypeLinkId = await deep.id('@deep-foundation/core', 'Join');
  const valueTypeLinkId = await deep.id('@deep-foundation/core', 'Value');
  const objectTypeLinkId = await deep.id('@deep-foundation/core', 'Object');
  const fileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile");
  const supportsId = await deep.id("@deep-foundation/core", "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler");
  const handleOperationTypeLinkId = await deep.id("@deep-foundation/core", "HandleInsert");

  const { data: [{ id: packageLinkId }] } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: {
      data: [{
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      }]
    },
    out: {
      data: [{
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'users', 'packages')
      }, {
        type_id: joinTypeLinkId,
        to_id: await deep.id('deep', 'admin')
      }]
    },
  })

  const { data: [{ id: packageLinks }] } = await deep.insert([
    {
      type_id: typeTypeLinkId,
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: "GoogleCloudAuthFile" } },
        }],
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: objectTypeLinkId,
          in: {
            data: {
              from_id: packageLinkId,
              type_id: containTypeLinkId,
              string: { data: { value: 'GoogleCloudAuthFileValue' } },
            }
          }
        }
      }
    }
  ]);

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: "AsyncFileHandlerCode" } },
        },
        {
          from_id: supportsId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: { data: { value: "AsyncFileHandler" } },
              },
              {
                type_id: handleOperationTypeLinkId,
                from_id: await deep.id("@deep-foundation/core", "AsyncFile"),
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageLinkId,
                      string: { data: { value: "HandleAsyncFile" } },
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