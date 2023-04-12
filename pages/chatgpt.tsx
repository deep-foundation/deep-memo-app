

import {
  LocalStoreProvider,
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  DeepProvider,
  useDeep,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
const PACKAGE_NAME = "@deep-foundation/openai";
function Content() {
  const deep = useDeep();
  const [openAiLinkId, setOpenAiLinkId] = useLocalStore(
    'openAiLinkId',
    undefined
  );

  return (
    <Stack>
      <Text suppressHydrationWarning>OpenAi link id: {openAiLinkId ?? " "}</Text>
      <Button
        onClick={async () => {
          const { data: [{ id: newConversationLinkId }] } = await deep.insert({
            type_id: await deep.id('@deep-foundation/chatgpt', "Conversation"),
            string: { data: { value: "New chat" } },
            in: {
              data: {
                type_id: await deep.id('@deep-foundation/core', "Contain"),
                from_id: deep.linkId,
              },
            },
          });

          const { data: [{ id: newMessageLinkId }] } = await deep.insert({
            type_id: await deep.id('@deep-foundation/messaging', "Message"),
            string: { data: { value: "Who are you?" } },
            in: {
              data: {
                type_id: await deep.id('@deep-foundation/core', "Contain"),
                from_id: deep.linkId,
              },
            },
          });

          let makeActive = true;
          if (makeActive) {
            await deep.delete({
              up: {
                tree_id: { _eq: await deep.id("@deep-foundation/core", "containTree") },
                parent: {
                  type_id: { _id: ["@deep-foundation/core", "Contain"] },
                  to: { type_id: await deep.id(PACKAGE_NAME, "UsesApiKey"), },
                  from_id: deep.linkId
                }
              }
            })
          }

          await deep.insert({
            type_id:  await deep.id(PACKAGE_NAME, "ApiKey"),
            string: { data: { value: "" }},
            in: {
              data: [
                {
                  type_id: await deep.id('@deep-foundation/core', "Contain"),
                  from_id: deep.linkId,
                },
                makeActive && {
                  type_id:  await deep.id(PACKAGE_NAME, "UsesApiKey"),
                  from_id: deep.linkId,
                  in: {
                    data: [
                      {
                        type_id: await deep.id('@deep-foundation/core', "Contain"),
                        from_id: deep.linkId,
                      },
                    ],
                  },
                }
              ],
            },
          })

          const { data: [{ id: gpt_3_5_turbo_0301 }] } = await deep.insert({
            type_id: await deep.id(PACKAGE_NAME, "Model"),
            string: { data: { value: 'gpt-3.5-turbo-0301' } },
            in: {
              data: [
                {
                  type_id: await deep.id('@deep-foundation/core', "Contain"),
                  from_id: deep.linkId,
                  string: { data: { value: 'GPT 3.5 TURBO 0301' } },
                },
              ],
            },
          });

            const { data: [{ id: usesModelLinkId }] } = await deep.insert({
              type_id: await deep.id(PACKAGE_NAME,"UsesModel"),
              from_id: newConversationLinkId,
              to_id: gpt_3_5_turbo_0301,
              in: {
                  data: {
                      type_id: await deep.id('@deep-foundation/core', "Contain"),
                      from_id: deep.linkId,
                      string: { data: { value: "UsesModel" } },
                  },
              },
          });
        }
      }
      >
        add conversation link
      </Button>
      <Button
        onClick={async () => {
          await deep.insert({
            type_id: await deep.id(PACKAGE_NAME, "ApiKey"),
            string: { data: { value: process.env.OPENAI_API_KEY } },
            in: {
                data: {
                    type_id: await deep.id('@deep-foundation/core', "Contain"),
                    from_id: deep.linkId,
                },
            }
        });
        }}
      >
        add ApiKeyLinkId link
      </Button>
      <Button
        onClick={async () => {
          let makeActive = true;
          if (makeActive) {
            await deep.delete({
              up: {
                tree_id: { _eq: await deep.id("@deep-foundation/core", "containTree") },
                parent: {
                  type_id: { _id: ["@deep-foundation/core", "Contain"] },
                  to: { type_id: await deep.id(PACKAGE_NAME, "UsesApiKey"), },
                  from_id: deep.linkId
                }
              }
            })
          }
          
          await deep.insert({
            type_id:  await deep.id(PACKAGE_NAME, "ApiKey"),
            string: { data: { value: process.env.OPENAI_API_KEY }},
            in: {
              data: [
                {
                  type_id: await deep.id('@deep-foundation/core', "Contain"),
                  from_id: deep.linkId,
                },
                makeActive && {
                  type_id:  await deep.id(PACKAGE_NAME, "UsesApiKey"),
                  from_id: deep.linkId,
                  in: {
                    data: [
                      {
                        type_id: await deep.id('@deep-foundation/core', "Contain"),
                        from_id: deep.linkId,
                      },
                    ],
                  },
                }
              ],
            },
          })
        }}
      >
        add ApiKey and UsesApiKey links
      </Button>
    </Stack>
  );
}

export default function OpenaiPage() {
  return (
    <ChakraProvider>
      <Provider>
        <DeepProvider>
          <Content />
        </DeepProvider>
      </Provider>
    </ChakraProvider>
  );
}


