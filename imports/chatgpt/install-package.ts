import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import fs from 'fs';
const { generateApolloClient } = require('@deep-foundation/hasura/client');
import { PACKAGE_NAME } from './package-name';
require('dotenv').config();
export async function installPackage () {
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
    const userTypeLinkId = await deep.id('@deep-foundation/core', "User");
    const typeTypeLinkId = await deep.id('@deep-foundation/core', "Type");
    const syncTextFileTypeLinkId = await deep.id('@deep-foundation/core', "SyncTextFile");
    const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");
    const dockerSupportsJsLinkId = await deep.id('@deep-foundation/core', "dockerSupportsJs");
    const handlerTypeLinkId = await deep.id('@deep-foundation/core', "Handler");
    const handleInsertLinkId = await deep.id('@deep-foundation/core', "HandleInsert");
    const packageTypeLinkId = await deep.id('@deep-foundation/core', "Package");
    const joinTypeLinkId = await deep.id('@deep-foundation/core', "Join");
    const typeStringLinkId = await deep.id('@deep-foundation/core', "String");
    const typeValueLinkId = await deep.id('@deep-foundation/core', "Value");

    const { data: [{ id: packageLinkId }] } = await deep.insert({
        type_id: packageTypeLinkId,
        string: { data: { value: PACKAGE_NAME } },
        in: { data: [
        {
            type_id: containTypeLinkId,
            from_id: deep.linkId
        },
        ] },
        out: { data: [
        {
            type_id: joinTypeLinkId,
            to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
            type_id: joinTypeLinkId,
            to_id: await deep.id('deep', 'admin'),
        },
        ] },
    });


    const { data: [{ id: openAiApiKeyTypeLinkId, }] } = await deep.insert({
        type_id: typeTypeLinkId,
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: {data: { value: "OpenAiApiKey"}}
            },
        },
        out: {
            data: {
              type_id: typeValueLinkId,
              to_id: typeStringLinkId,
              in: {
                data: {
                  from_id: packageLinkId,
                  type_id: containTypeLinkId,
                  string: { data: { value: 'OpenAiApiKeyValue' } },
                }
              }
            }
          }
    });

  const { data: [{ id: conversationTypeLinkId, }] } = await deep.insert({
        type_id: typeTypeLinkId,
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: {data: { value: "Conversation"}}
            },
        },
        out: {
            data: {
              type_id: typeValueLinkId,
              to_id: typeStringLinkId,
              in: {
                data: {
                  from_id: packageLinkId,
                  type_id: containTypeLinkId,
                  string: { data: { value: 'ConversationValue' } },
                }
              }
            }
          }
    });

    const { data: [{ id: usesOpenAiApiKeyTypeLinkId, }] } = await deep.insert({
        type_id: typeTypeLinkId,
        from_id: userTypeLinkId,
        to_id: openAiApiKeyTypeLinkId,
        in: {
            data: {
                type_id:containTypeLinkId,
                from_id: packageLinkId,
                string: {data: { value: "UsesOpenAiApiKey"}}
            },
        }
    });

    const { data: [{ id: chatGPTTypeLinkId }] } = await deep.insert({
        type_id: typeTypeLinkId,
        in: { data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId, 
          string: { data: { value: 'ChatGPT' } },
        } },
      });

      const { data: [{ id: modelTypeLinkId }] } = await deep.insert({
        type_id: typeTypeLinkId,
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: packageLinkId,
                string: { data: { value: "Model" } },
            }, 
        },
        out: {
          data: {
            type_id: typeValueLinkId,
            to_id: typeStringLinkId,
            in: {
              data: {
                from_id: packageLinkId,
                type_id: containTypeLinkId,
                string: { data: { value: 'ModelValue' } },
              }
            }
          }
        }
    });

    const { data: [{ id: usesModelTypeLinkId }] } = await deep.insert({
      type_id: typeTypeLinkId,
      from_id: anyTypeLinkId,
      to_id: modelTypeLinkId,
      in: {
          data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: "UsesModel" } },
          },
      },
  });

const { data: [{ id: gpt_3_5_turbo }] } = await deep.insert({
    type_id: modelTypeLinkId,
    string: { data: { value: 'gpt-3.5-turbo' } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'GPT 3.5 Turbo' } },
        },
      ],
    },
  });
  
  const { data: [{ id: gpt_3_5_turbo_0301 }] } = await deep.insert({
    type_id: modelTypeLinkId,
    string: { data: { value: 'gpt-3.5-turbo-0301' } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'GPT 3.5 TURBO 0301' } },
        },
      ],
    },
  });

      await deep.insert({
        type_id: syncTextFileTypeLinkId,
        in: {
          data: [
            {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: "ReplyInsertHandlerCode" } },
            },
            {
              from_id: dockerSupportsJsLinkId,
              type_id: handlerTypeLinkId,
              in: {
                data: [
                  {
                    type_id: containTypeLinkId,
                    from_id: packageLinkId,
                    string: { data: { value: "ReplyInsertHandler" } },
                  },
                  {
                    type_id: handleInsertLinkId,
                    from_id: await deep.id('@flakeed/messaging', "Reply"),
                    in: {
                      data: [
                        {
                          type_id: containTypeLinkId,
                          from_id: packageLinkId,
                          string: { data: { value: "HandleReplyInsert" } },
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
                value: fs.readFileSync('/workspace/dev/packages/sdk/imports/openai/request-handler.js', {encoding: 'utf-8'}),
            },
        },
    });
}

installPackage();