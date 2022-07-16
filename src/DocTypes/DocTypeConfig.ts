import { getConfig } from "../GlobalConfig";
import { AtlasDocTypeID } from "./DocTypeID";

export function getAtlasLangCodeOverride(docType: AtlasDocTypeID) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perAtlasBasedDocType?.[docType]?.languageCode
    || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.atlasLanguageCode
    || null;
}

export function getAtlasVersionCodeOverride(docType: AtlasDocTypeID) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perAtlasBasedDocType?.[docType]?.versionCode
        || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.atlasVersionCode
        || null;
}

export function getMetadataCoverageReportVersionCode() {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.metadataCoverageReportVersionCode
        || null;
}

export function getStorageSubKey(versionCode: string | undefined, languageCode: string | undefined) {
    return `${languageCode || '' }${versionCode || ''}`;
}

//TODO additional Aura/LWC docs, use auraDocVersionCode