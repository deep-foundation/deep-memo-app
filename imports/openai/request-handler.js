async ({ data: { newLink: replyLink, triggeredByLinkId }, deep, require }) => {
    const PACKAGE_NAME = `@flakeed/chatgpt`;
    const { Configuration, OpenAIApi } = require("openai");
    const openAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "OpenAiApiKey");
    const usesOpenAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, "UsesOpenAiApiKey");
  
    const { data: [linkWithStringValue] } = await deep.select({
      id: replyLink.from_id,
    });
    if (!linkWithStringValue.value?.value) {
      throw new Error(`##${linkWithStringValue.id} must have a value`);
    }
    const openAiPrompt = linkWithStringValue.value.value;
  
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
  
    const { data: [{ id: agentMessageId }] } = await deep.insert({
      type_id: await deep.id('@flakeed/messaging', "Message"),
      string: { data: { value: response.data.choices[0].text.trim() } },
      in: {
        data: {
          type_id: await deep.id('@deep-foundation/core', "Contain"),
          from_id: deep.linkId,
        },
      },
    });

    const { data: [{ id: agentReplyLinkId }] } = await deep.insert({
      type_id: await deep.id('@flakeed/messaging', "Reply"),
      from_id: replyLink.from_id,
      to_id: newAgentMessageInstanceId,
      in: {
        data: {
          type_id: await deep.id('@deep-foundation/core', "Contain"),
          from_id: deep.linkId,
        },
      },
    });
  
    return response.data;
  };
  