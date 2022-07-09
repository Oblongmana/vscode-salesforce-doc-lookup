import { version } from "os";
import { getConfig } from "../GlobalConfig";
import { DocType } from "./DocType";

export function getLangCodeOverride(docType: DocType) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perDocType?.[docType]?.languageCode
        || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.languageCode
        || null;
}

export function getAtlasVersionCodeOverride(docType: DocType) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perDocType?.[docType]?.versionCode
        || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.atlasDocVersionCode
        || null;
}

export function getStorageSubKey(versionCode: string | undefined, languageCode: string | undefined) {
    return `${languageCode || '' }${versionCode || ''}`;
}

//TODO additional Aura/LWC docs, use auraDocVersionCode