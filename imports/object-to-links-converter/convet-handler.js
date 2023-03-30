async ({ deep, data: { newLink: convertLink, triggeredByLinkId } }) => {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  try {
    await deep.id("@freephoenix888/boolean", "True")
  } catch (error) {
    throw new Error(`@freephoenix888/boolean package must be installed`);
  }
  const trueTypeLinkId = await deep.id("@freephoenix888/boolean", "True");
  const falseTypeLinkId = await deep.id("@freephoenix888/boolean", "False");
  const deletesData = [];
  const insertsData = [];
  const updatesData = [];
  const { data: [linkWithObjectValue] } = await deep.select({
    id: convertLink.to_id
  });
  if (!linkWithObjectValue.value?.value) {
    throw new Error(`${linkWithObjectValue.id} must have value`);
  }
  const obj = linkWithObjectValue.value.value;
  const packageLinkOfLinkWithObjectValueSelectData = {
    type_id: await deep.id("@deep-foundation/core", "Package"),
    out: {
      type_id: containTypeLinkId,
      to_id: linkWithObjectValue.type_id
    }
  };
  const {data: [packageLinkOfLinkWithObjectValue]} = await deep.select(packageLinkOfLinkWithObjectValueSelectData);
  if(!packageLinkOfLinkWithObjectValue) {
    throw new Error(`Unable to find package that contains type ##${linkWithObjectValue.type_id} of ##${linkWithObjectValue.id}`);
  }

  const camelCase = (str) => {
    return str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
  }
  
  const upperFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  for (const [key, value] of Object.entries(obj)) {
    const typeOfValue = typeof value;
    const typeName = upperFirst(camelCase(key));
    
    const typeLinkId = await deep.id(packageLinkOfLinkWithObjectValue, typeName);
    const { data: [link] } = await deep.select({
      type_id: typeLinkId,
      from_id: linkWithObjectValue.id,
      to_id: linkWithObjectValue.id
    });
    if (typeOfValue === 'string' || typeOfValue === 'number' || typeOfValue === 'object') {
      if (!link) {
        insertsData.push({
          type_id: typeLinkId,
          from_id: linkWithObjectValue.id,
          to_id: linkWithObjectValue.id,
          [typeOfValue]: {
            data: {
              value: value
            }
          },
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: linkWithObjectValue.id
              },
              ...(typeOfValue === 'object' ? {
                type_id: convertLink.type_id,
                from_id: triggeredByLinkId
              } : [])
            ]
          }
        })
      } else {
        updatesData.push({
          exp: {
            link_id: link.id
          },
          value: {
            value: value
          },
          options: {
            table: (typeof value) + 's'
          }
        });
      }
    } else if (typeof value === 'boolean') {
      // TODO: use update when the feature will be released
      deletesData.push({
        type_id: typeLinkId,
        from_id: linkWithObjectValue.id
      });
      insertsData({
        type_id: typeLinkId,
        from_id: linkWithObjectValue.id,
        to_id: value ? trueTypeLinkId : falseTypeLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: linkWithObjectValue.id
          }
        }
      });
    }
  }
  await deep.delete(deletesData);
  await deep.insert(insertsData);
  await deep.update(updatesData);
}