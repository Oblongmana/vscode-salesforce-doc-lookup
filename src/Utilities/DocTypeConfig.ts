import { version } from "os";
import { getConfig } from "../Config";
import { DocTypeName } from "../DocTypes/DocTypeNames";

export function getLangCodeOverride(docType: DocTypeName) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perDocType?.[docType]?.languageCode
        || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.languageCode
        || null;
}

export function getAtlasVersionCodeOverride(docType: DocTypeName) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perDocType?.[docType]?.versionCode
        || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.atlasDocVersionCode
        || null;
}

export function getStorageSubKey(versionCode: string | undefined, languageCode: string | undefined) {
    return `${languageCode || '' }${versionCode || ''}`;
}

//TODO additional Aura/LWC docs, use auraDocVersionCode