import { getConfig } from "../GlobalConfig";
import { ATLAS_CONSTS } from "../GlobalConstants";
import { AtlasDocTypeID, isAtlasUnversionedDocTypeID } from "./DocTypeID";

export function getAtlasLangCodeOverride(docType: AtlasDocTypeID) {
    return getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.perAtlasBasedDocType?.[docType]?.languageCode
    || getConfig()?.EXPERIMENTAL?.ADVANCED?.languageAndVersionPreferences?.atlasLanguageCode
    || null;
}

export function getAtlasVersionCodeOverride(docType: AtlasDocTypeID) {
    if (isAtlasUnversionedDocTypeID(docType)) {
        return ATLAS_CONSTS.SF_ATLAS_UNVERSIONED; //Special string that must be included when retrieving unversioned doc
    }
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