async ({ data: { newLink: replyLinkId, triggeredByLinkId }, deep, require }) => {
  const PACKAGE_NAME = `@flakeed/chatgpt`;
  const { Configuration, OpenAIApi } = require("openai");
  const openAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "OpenAiApiKey");
  const usesOpenAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "UsesOpenAiApiKey");
  const messageTypeLinkId = await deep.id('@flakeed/messaging', "Message");
  const replyTypeLinkId = await deep.id('@flakeed/messaging', "Reply");
  const authorTypeLinkId = await deep.id('@flakeed/messaging', "Author");
  const chatgptTypeLinkId = await deep.id(PACKAGE_NAME, "ChatGPT");
  const modelTypeLinkId = await deep.id(PACKAGE_NAME, "Model");
  const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");

  const { data: [messageLink = undefined] = [] } = await deep.select({
    id: replyLinkId.from_id,
    _not: {
      in: {
        from_id: chatgptTypeLinkId,
        type_id: authorTypeLinkId
      }
    }
  });
  if (!messageLink) {
    return 'No need to react to message of this reply.';
  }
  if (!messageLink.value?.value) {
    throw new Error(`##${messageLink.id} must have a value`);
  }
  const message = messageLink.value.value;

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

  const { data: [selectedModelLink] } = await deep.select({
    type_id: modelTypeLinkId,
    in: {
      type_id: containTypeLinkId,
      from_id: triggeredByLinkId,
    },
  });

  if (!selectedModelLink) {
    throw new Error(`A link with type ##${modelTypeLinkId} is not found`);
  }

  const updatedModel = selectedModelLink.value.value;

  const { data: [{ id: currentModelLinkId }] } = await deep.insert({
    type_id: modelTypeLinkId,
    string: { data: { value: updatedModel } },
    in: {
        data: {
            type_id: containTypeLinkId,
            from_id: triggeredByLinkId,
        },
    },
  });

  if (currentModelLinkId) {
    updatedModel = currentModelLinkId.value.value;
    await deep.update(selectedModelLink.id, {
      string: { data: { value: updatedModel } },
    });
  }
  
  const apiKey = apiKeyLink.value.value;
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const model=updatedModel.value.value

  const response = await openai.createChatCompletion({
    model: model,
    messages: [{ role: "user", content: message }],
  });

  const { data: [{ id: chatgptMessageLinkId }] } = await deep.insert({
    type_id: messageTypeLinkId,
    string: { data: { value: response.data.choices[0].message.content } },
    in:{
        data: [
          {
          type_id: containTypeLinkId,
          from_id: triggeredByLinkId,
        },
        {
          type_id: authorTypeLinkId,
          from_id: chatgptTypeLinkId,
        },
      ],
    }
  });

  const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
    type_id: replyTypeLinkId,
    from_id: chatgptMessageLinkId,
    to_id: replyLinkId.from_id,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: triggeredByLinkId,
      },
    },
  });

  return response.data;
};