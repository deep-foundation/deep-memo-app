async ({ data: { newLink: replyLinkId, triggeredByLinkId }, deep, require }) => {
  let requestCounter = 0;
  const PACKAGE_NAME = `@flakeed/chatgpt`;
  const { Configuration, OpenAIApi } = require("openai");
  const openAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "OpenAiApiKey");
  const usesOpenAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "UsesOpenAiApiKey");
  const messageTypeLinkId = await deep.id('@flakeed/messaging', "Message");
  const replyTypeLinkId = await deep.id('@flakeed/messaging', "Reply");
  const authorTypeLinkId = await deep.id('@flakeed/messaging', "Author");
  const chatgptTypeLinkId = await deep.id(PACKAGE_NAME, "ChatGPT");
  const containTypeLinkId = await deep.id('@deep-foundation/core', "Contain");
  const modelTypeLinkId = await deep.id(PACKAGE_NAME, "Model");
  const usesModelTypeLinkId = await deep.id(PACKAGE_NAME, "UsesModel");
  const conversationTypeLinkId = await deep.id(PACKAGE_NAME, "Conversation");
  const treeIncludeNodeTypeLinkId = await deep.id('@deep-foundation/core', "TreeIncludeNode");
    const treeIncludeDownTypeLinkId = await deep.id('@deep-foundation/core', "TreeIncludeDown");
    const treeTypeLinkId = await deep.id('@deep-foundation/core', "Tree");

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
  const apiKey = apiKeyLink.value.value;
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  let model;

  const { data: [linkedModel] } = await deep.select({
    type_id: modelTypeLinkId,
    in: {
      type_id: usesModelTypeLinkId,
      from_id: replyLinkId.to_id[0],
    },
  });

  const { data: [userLinkedModel] } = await deep.select({
    type_id: modelTypeLinkId,
    in: {
      type_id: usesModelTypeLinkId,
      from_id: triggeredByLinkId,
    },
  });

  if (linkedModel && linkedModel.value?.value && userLinkedModel && userLinkedModel.value?.value) {
    model = linkedModel.value.value;
  } else {
    if (!userLinkedModel) {
      throw new Error(`A link with type ##${userLinkedModel} is not found`);
    }
    if (!userLinkedModel.value?.value) {
      throw new Error(`##${userLinkedModel.id} must have a value`);
    } else {
      model = userLinkedModel.value.value;
    }
  }
  if (!model) {
    throw new Error(`A valid model value was not found in either linkedModel or userLinkedModel`);
  }

let assistantMessage;

  if (requestCounter > 1) {
    const { data: [assistantMessageSelect] } = await deep.select({
      type_id: treeTypeLinkId,
      out : {
        type_id: treeIncludeNodeTypeLinkId,
        to_id:messageTypeLinkId,
      },
    });
  
    if (!assistantMessageSelect.value?.value) {
      throw new Error(`##${assistantMessageSelect.id} must have a value`);
    }

    assistantMessage=assistantMessageSelect.value.value;
  }

  const response = await openai.createChatCompletion({
    model: model,
    messages: [{
      role: "assistant", content: assistantMessage, 
      role: "user", content: message
    }],
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
  requestCounter++;

  return response.data;
};