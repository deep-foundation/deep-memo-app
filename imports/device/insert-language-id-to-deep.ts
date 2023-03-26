import { Device, GetLanguageCodeResult } from "@capacitor/device";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";

export async function insertLanguageIdToDeep({deep, deviceLinkId, deviceLanguageCode}: {deep: DeepClient, deviceLinkId: number, deviceLanguageCode: GetLanguageCodeResult}) {

	if(!deviceLinkId) {
		throw new Error("deviceLinkId must not be 0")
	}

  const containTypeLinkId = deep.idLocal('@deep-foundation/core', 'Contain');
  const languageCodeTypeLinkId = deep.idLocal(PACKAGE_NAME, 'LanguageCode');

  await deep.insert({
		type_id: languageCodeTypeLinkId,
		string: { data: { value: deviceLanguageCode.value } },
		in: {
			data: {
				type_id: containTypeLinkId,
				from_id: deviceLinkId,
			},
		},
	});
  
}