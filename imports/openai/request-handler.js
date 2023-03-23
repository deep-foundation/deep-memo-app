async ({ data: { newLink: replyLinkId,triggeredByLinkId }, deep, require }) => {
  const PACKAGE_NAME = `@flakeed/chatgpt`;
  const { Configuration, OpenAIApi } = require("openai");
  const openAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "OpenAiApiKey");
  const usesOpenAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "UsesOpenAiApiKey");
  const messageTypeLinkId = await deep.id('@flakeed/messaging', "Message");
  const replyTypeLinkId = await deep.id('@flakeed/messaging', "Reply");
  const authorTypeLinkId = await deep.id('@flakeed/messaging', "Author");
  const chatgptTypeLinkId = await deep.id(PACKAGE_NAME, "Chatgpt");
  const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");


  const { data: [linkWithStringValue] } = await deep.select({
    id: replyLinkId.from_id,
  });
  if (!linkWithStringValue.value?.value) {
    throw new Error(`##${linkWithStringValue.id} must have a value`);
  }
  const openAiPrompt = linkWithStringValue.value.value;

  const { data: [{ id: userMessageLinkId }] } = await deep.insert({
    type_id: messageTypeLinkId,
    string: { data: { value: openAiPrompt } },
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
    },
  });

  const { data: [apiKeyLink] } = await deep.select({
    type_id: openAiApiKeyTypeLinkId,
    in: {
      type_id: usesOpenAiApiKeyTypeLinkId,
      from_id: triggeredByLinkId,
    },
  });


  if (!apiKeyLink) {
    throw new Error(`A link with type ##${openAiApiKeyTypeLinkId} is not found`);
  }
  if (!apiKeyLink.value?.value) {
    throw new Error(`##${apiKeyLink.id} must have a value`);
  }
  const apiKey = apiKeyLink.value.value;
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: openAiPrompt }],
  });

  const { data: [{ id: chatgptMessageLinkId }] } = await deep.insert({
    type_id: messageTypeLinkId,
    string: { data: { value: response.data.choices[0].text } },
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: triggeredByLinkId,
      },
    },
  });

  const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
    type_id: replyTypeLinkId,
    from_id: chatgptMessageLinkId,
    to_id: userMessageLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: triggeredByLinkId,
      },
    },
  });

  const { data: [{ id: chatgptAuthorLinkId }] } = await deep.insert({
    type_id: authorTypeLinkId,
    from_id: chatgptMessageLinkId,
    to_id: chatgptTypeLinkId, 
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
    },
  });

  return response.data;
};