//TODO: attempt to get rid of this - if not possible, add justification. Ideally, at min we move Atlas stuff to relevant location, Aura to relevant location
// Previously these were constants just in SalesforceReference.ts, now in a Constants file as an intermediate measure

//Universal constants
export const SF_DOC_ROOT_URL = 'https://developer.salesforce.com/docs';

export const ERROR_MESSAGES = {
    EXCEPTION_OFFLINE_ERROR: 'getaddrinfo ENOTFOUND developer.salesforce.com',
    HUMAN_MESSAGE_OFFLINE_ERROR: 'You appear to be offline or unable to reach developer.salesforce.com. Please check your connection and try again.',
    HUMAN_MESSAGE_UNEXPECTED_ERROR: 'Unexpected error while trying to access Salesforce doc. Please log an issue and repro steps at https://github.com/Oblongmana/vscode-salesforce-doc-lookup/issues',
    TABLE_OF_CONTENTS_PREFACE: 'Error getting Table of Contents. DocType was',
    HUMAN_MESSAGE_TABLE_OF_CONTENTS_SUFFIX: ' Check your language or version settings, you may have entered an invalid Lang/Version combination for this doc type. If you can\'t resolve  the issue please log an issue and repro steps at https://github.com/Oblongmana/vscode-salesforce-doc-lookup/issues'
};