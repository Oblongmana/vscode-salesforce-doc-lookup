import * as vscode from 'vscode';
import { ReferenceItem } from '../ReferenceItems/ReferenceItem';
import { DocTypeName } from './DocTypeNames';

export interface DocumentationType {
    /**
     * The DocTypeName this DocType is for. Must be unique across the extension
     */
    readonly docTypeName: DocTypeName;

    /**
     * Get the ReferenceItem instances for this reference doc type.
     *
     * Implementers should make use of the cache.
     *
     * @param context the extension context, provided so you can access/populate the cache.
     */
    getReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]>;
}
