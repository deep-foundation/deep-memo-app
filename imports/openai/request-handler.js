async ({ data: { newLink: replyLink, triggeredByLinkId }, deep, require }) => {
	const PACKAGE_NAME = `@flakeed/chatgpt`;
	const { Configuration, OpenAIApi } = require('openai');
	const openAiApiKeyTypeLinkId = await deep.id(PACKAGE_NAME, 'OpenAiApiKey');
	const usesOpenAiApiKeyTypeLinkId = await deep.id(
		PACKAGE_NAME,
		'UsesOpenAiApiKey'
	);
	const messageTypeLinkId = await deep.id('@flakeed/messaging', 'Message');
	const replyTypeLinkId = await deep.id('@flakeed/messaging', 'Reply');
	const authorTypeLinkId = await deep.id('@flakeed/messaging', 'Author');
	const chatgptTypeLinkId = await deep.id(PACKAGE_NAME, 'ChatGPT');
	const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
	const modelTypeLinkId = await deep.id(PACKAGE_NAME, 'Model');
	const usesModelTypeLinkId = await deep.id(PACKAGE_NAME, 'UsesModel');
	const conversationTypeLinkId = await deep.id(PACKAGE_NAME, 'Conversation');
	const messagingTree = await deep.id('@flakeed/messaging', 'MessagingTree');
	let model;

	const { data: [messageLink ] } = await deep.select({
		id: replyLink.from_id,
		_not: {
			out: {
				to_id: chatgptTypeLinkId,
				type_id: authorTypeLinkId,
			},
		},
	});
	if (!messageLink) {
		return 'No need to react to message of this reply.';
	}
	if (!messageLink.value?.value) {
		throw new Error(`##${messageLink.id} must have a value`);
	}
	const message = messageLink.value.value;

	const apiKeyLink = await getTokenLink();
	const apiKey = apiKeyLink.value.value;
	const configuration = new Configuration({
		apiKey: apiKey,
	});
	const openai = new OpenAIApi(configuration);

	const { data: conversationLink } = await deep.select({
    down: {
        tree_id: { _eq: messagingTree },
        link_id: { _eq: replyLink.id },
    },
}, { returning: `id from_id type_id to_id value author: out (where: { type_id: { _eq: ${authorTypeLinkId}} }) { id from_id type_id to_id }` });

	if (!conversationLink) {
		throw new Error('A conversationLink link is not found');
	}
	const currentConversation = conversationLink.find(
		(link) => link.type_id === conversationTypeLinkId
	);

	const {
		data: [linkedModel],
	} = await deep.select({
		type_id: modelTypeLinkId,
		in: {
			type_id: usesModelTypeLinkId,
			from_id: currentConversation.id,
		},
	});

	const {
		data: [userLinkedModel],
	} = await deep.select({
		type_id: modelTypeLinkId,
		in: {
			type_id: usesModelTypeLinkId,
			from_id: triggeredByLinkId,
		},
	});

	if(!linkedModel && !userLinkedModel){
		model = 'gpt-3.5-turbo';
	}else	if (
			(linkedModel &&
				linkedModel.value?.value &&
				userLinkedModel &&
				userLinkedModel.value?.value) ||
			(linkedModel && linkedModel.value?.value)
		) {
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
  const messageLinks = conversationLink.filter((link) => link.type_id === messageTypeLinkId);
console.log("messageLinks",messageLinks)
  const allMessages = await getMessages({ messageLinks: messageLinks });
console.log("allMessages",allMessages)
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
        ...allMessages,
        {
            role: 'user',
            content: message,
        },
    ],
});


const reservedIds = await deep.reserve(1);

const chatgptMessageLinkId = reservedIds.pop();

await deep.serial({
	
  operations: [
    {
      table: 'links',
      type: 'insert',
      objects: {
				id: chatgptMessageLinkId ,
        type_id: messageTypeLinkId,
        in: {
          data: [
            {
              type_id: containTypeLinkId,
              from_id: triggeredByLinkId,
            },
          ],
        },
        out: {
          data: [
            {
              type_id: authorTypeLinkId,
              to_id: chatgptTypeLinkId,
            },
          ],
        },
      },
    },
		{
      table: 'strings',
      type: 'insert',
      objects: {
        link_id: chatgptMessageLinkId,
        value: response.data.choices[0].message.content
      }
    },
    {
      table: 'links',
      type: 'insert',
      objects: {
        type_id: replyTypeLinkId,
        from_id: chatgptMessageLinkId,
        to_id: replyLink.from_id,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: triggeredByLinkId,
          },
        },
      },
    },
  ],
});

	async function getMessages({ messageLinks }) {
    return Promise.all(
        messageLinks.map(async (link) => ({
            role: await getMessageRole({ messageLink: link }),
            content: link.value.value,
        }))
    );
}
	async function getTokenLink() {
		let resultTokenLink;
		const { data } = await deep.select({
			_or: [
				{
					type_id: openAiApiKeyTypeLinkId,
					in: {
						type_id: containTypeLinkId,
						from_id: triggeredByLinkId,
					},
				},
				{
					from_id: triggeredByLinkId,
					type_id: usesOpenAiApiKeyTypeLinkId,
				},
			],
		});
		if (data.length === 0) {
			throw new Error(`Link of type ##${openAiApiKeyTypeLinkId} is not found`);
		}
		const usesLinks = data.filter(
			(link) => link.type_id === usesOpenAiApiKeyTypeLinkId
		);
		if (usesLinks.length > 1) {
			throw new Error(
				`More than 1 links of type ##${usesOpenAiApiKeyTypeLinkId} are found`
			);
		}
		const usesLink = data.find(
			(link) => link.type_id === usesOpenAiApiKeyTypeLinkId
		);
		if (usesLink) {
			const tokenLink = data.find((link) => link.id === usesLink.to_id);
		if(!tokenLink){
			const tokenLink = data.filter(
				(link) => link.type_id === openAiApiKeyTypeLinkId
			);
			if (tokenLink.length > 1) {
				throw new Error(
					`For 2 or more ##${openAiApiKeyTypeLinkId} links you must activate it with usesOpenAiApiKey link`
				);
			}else{
				const tokenLink = data.find(
					(link) => link.type_id === openAiApiKeyTypeLinkId
				);
				if (!tokenLink) {
					throw new Error(`Link of type ##${openAiApiKeyTypeLinkId} is not found`);
				} 
				resultTokenLink = tokenLink;
			}
		}else{
				resultTokenLink = tokenLink;
		}
		} else {
			const tokenLink = data.filter(
				(link) => link.type_id === openAiApiKeyTypeLinkId
			);
			if (tokenLink.length > 1) {
				throw new Error(
					`For 2 or more ##${openAiApiKeyTypeLinkId} links you must activate it with usesOpenAiApiKey link`
				);
			}else{
				const tokenLink = data.find(
					(link) => link.type_id === openAiApiKeyTypeLinkId
				);
				if (!tokenLink) {
					throw new Error(`Link of type ##${openAiApiKeyTypeLinkId} is not found`);
				} 
				resultTokenLink = tokenLink;
			}
		
		}
		if (!resultTokenLink.value?.value) {
			throw new Error(`Link of type ##${openAiApiKeyTypeLinkId} has no value`);
		}
		return resultTokenLink;
	}

	

	async function getMessageRole({ messageLink }) {
    const authorLink = messageLinks.filter((link) => link.author && link.author.length > 0);
    if (!authorLink) {
      throw new Error(`Author link not found for message ##${messageLinks.id}`);
    }
    return authorLink.to_id === chatgptTypeLinkId ? 'assistant' : 'user';
  }

	return response.data;
};