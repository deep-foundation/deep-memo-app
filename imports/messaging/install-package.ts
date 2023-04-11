import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
const { generateApolloClient } = require('@deep-foundation/hasura/client');
const PACKAGE_NAME = "@flakeed/messaging";
require('dotenv').config();
export async function installPackage() {
  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
    ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
      ? false
      : true,
    // admin token in prealpha deep secret key
    // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibGluayJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJsaW5rIiwieC1oYXN1cmEtdXNlci1pZCI6IjI2MiJ9LCJpYXQiOjE2NTYxMzYyMTl9.dmyWwtQu9GLdS7ClSLxcXgQiKxmaG-JPDjQVxRXOpxs',
  });

  const unloginedDeep = new DeepClient({ apolloClient });
  const guest = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
  const admin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  const deep = new DeepClient({ deep: guestDeep, ...admin });

  const anyTypeLinkId = await deep.id('@deep-foundation/core', "Any");
  const typeTypeLinkId = await deep.id('@deep-foundation/core', "Type");
  const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");
  const packageTypeLinkId = await deep.id('@deep-foundation/core', "Package");
  const joinTypeLinkId = await deep.id('@deep-foundation/core', "Join");
  const typeStringLinkId = await deep.id('@deep-foundation/core', "String");
  const typeValueLinkId = await deep.id('@deep-foundation/core', "Value");
  const treeIncludeNodeTypeLinkId = await deep.id('@deep-foundation/core', "TreeIncludeNode");
  const treeIncludeUpTypeLinkId = await deep.id('@deep-foundation/core', "TreeIncludeUp");
  const treeTypeLinkId = await deep.id('@deep-foundation/core', "Tree");

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

  const { data: [{ id: messageTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Message' } },
      }
    },
    out: {
      data: {
        type_id: typeValueLinkId,
        to_id: typeStringLinkId,
        in: {
          data: {
            from_id: packageLinkId,
            type_id: containTypeLinkId,
            string: { data: { value: 'MessageValue' } },
          }
        }
      }
    },
  });

  const { data: [{ id: replyTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: messageTypeLinkId,
    to_id: anyTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Reply' } },
      }
    },
  });

  const { data: [{ id: authorTypeLinkId }] } = await deep.insert({
    type_id: typeTypeLinkId,
    from_id: anyTypeLinkId,
    to_id: anyTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Author' } },
      }
    },
  });

  const { data: [{ id: messagingTree }] } = await deep.insert({
    type_id: treeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'MessagingTree' } },
      }
    },
    out: {
      data: [
        {
          type_id: treeIncludeNodeTypeLinkId,
          to_id: anyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'messagingTreeAny' } },
            }
          },
        },
        {
          type_id: treeIncludeUpTypeLinkId,
          to_id: replyTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'messagingTreeReply' } },
            }
          },
        },
      ]
    },
  });
}

installPackage();