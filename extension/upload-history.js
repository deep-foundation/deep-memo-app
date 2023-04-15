import { getLinkId } from "./get-link-id.js"

const uploadHistory = async (newHistory, GQL_URL, GQL_TOKEN) => {
  const requestPayload = {
    query: `
        mutation insertHistory($historyData: [links_insert_input!]!) {
          insert_links(objects: $historyData) {
            returning {
              id
            }
          }
        }
      `,
    variables: {
      historyData: newHistory,
    },
  };

  const response = await fetch(GQL_URL, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Authorization": `Bearer ${GQL_TOKEN}`,
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(requestPayload),
  });

  const responseData = await response.json();
  console.log(responseData);

  return responseData.data.insert_links.returning;
};

const prepareHistoryData = async (history, PACKAGE_NAME, DEVICE_LINK_ID) => {
  const containTypeLinkId = await getLinkId("@deep-foundation/core", "Contain");
  const browserExtensionLinkId = await getLinkId(DEVICE_LINK_ID, "BrowserExtension");
  const pageTypeLinkId = await getLinkId(PACKAGE_NAME, "Page");
  const urlTypeLinkId = await getLinkId(PACKAGE_NAME, "PageUrl");
  const titleTypeLinkId = await getLinkId(PACKAGE_NAME, "PageTitle");
  const typedCountTypeLinkId = await getLinkId(PACKAGE_NAME, "TypedCount");
  const visitCountTypeLinkId = await getLinkId(PACKAGE_NAME, "VisitCount");
  const lastVisitTimeTypeLinkId = await getLinkId(PACKAGE_NAME, "LastVisitTime");

  const historyData = history.map((page) => {
    return {
      type_id: pageTypeLinkId,
      number: { data: { value: +page.id } },
      in: {
        data: [{
          type_id: containTypeLinkId,
          from_id: browserExtensionLinkId,
        }]
      },
      out: {
        data: [
          {
            type_id: containTypeLinkId,
            to: {
              data: {
                type_id: urlTypeLinkId,
                string: { data: { value: page.url } },
              }
            }
          },
          {
            type_id: containTypeLinkId,
            to: {
              data: {
                type_id: titleTypeLinkId,
                string: { data: { value: page.title } },
              }
            }
          },
          {
            type_id: containTypeLinkId,
            to: {
              data: {
                type_id: typedCountTypeLinkId,
                string: { data: { value: page.typedCount ? page.typedCount.toString() : "none" } },
              }
            }
          },
          {
            type_id: containTypeLinkId,
            to: {
              data: {
                type_id: visitCountTypeLinkId,
                string: { data: { value: page.visitCount ? page.visitCount.toString() : "none" } },
              }
            }
          },
          {
            type_id: containTypeLinkId,
            to: {
              data: {
                type_id: lastVisitTimeTypeLinkId,
                string: { data: { value: page.lastVisitTime ? page.lastVisitTime.toString() : "none" } },
              }
            }
          }]
      }
    };
  });
  return historyData;
};

export const executeUploadHistory = async (history, GQL_URL, GQL_TOKEN, PACKAGE_NAME, DEVICE_LINK_ID) => {
  const historyData = await prepareHistoryData(history, PACKAGE_NAME, DEVICE_LINK_ID);
  const existingHistory = await checkExistingHistory(history, PACKAGE_NAME, GQL_URL, GQL_TOKEN);

  const newHistory = historyData.filter(
    (page) => !existingHistory.some((existingPage) => existingPage.number.value === page.number.data.value)
  );

  if (newHistory.length) {
    await uploadHistory(newHistory, GQL_URL, GQL_TOKEN);
  } else {
    console.log("No new history to upload.");
  }
};

const checkExistingHistory = async (history, PACKAGE_NAME, GQL_URL, GQL_TOKEN) => {
  const historyIds = history.map((page) => page.id);
  const pageTypeLinkId = await getLinkId(PACKAGE_NAME, "Page");

  const requestPayload = {
    query: `
        query getHistoryByIds($historyIds: [numeric!]) {
          links(where: {type_id: {_eq: ${pageTypeLinkId}}, number: {value: {_in: $historyIds}}}) {
              number {
                value
              }
            }
			    }
      `,
    variables: {
      historyIds: historyIds,
    },
  };

  const response = await fetch(GQL_URL, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Authorization": `Bearer ${GQL_TOKEN}`,
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(requestPayload),
  });

  const responseData = await response.json();
  console.log(responseData)
  return responseData.data.links;
};