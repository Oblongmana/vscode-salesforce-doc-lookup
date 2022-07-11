import * as vscode from 'vscode';
import { ReferenceItemMemento } from './ReferenceItemMemento';

export abstract class ReferenceItem implements vscode.QuickPickItem {

    abstract label: string; //NB: Abstract to force subclasses to impl and assign these mandatory fields
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;

    //TODO: as noted in concrete ref types, need to improve discoverability on what this contains for those concrete types
    abstract data: Record<string, any>; //NB: Abstract to force subclasses to impl and assign these mandatory fields

    public saveToMemento(): ReferenceItemMemento {
        return new ReferenceItemMemento(this);
    }

    public restoreFromMemento(memento: ReferenceItemMemento) {
        this.label = memento.label;
        this.data = memento.data;
        this.description = memento.description;
        this.detail = memento.detail;
        this.picked = memento.picked;
        this.alwaysShow = memento.alwaysShow;
    }

    /**
     * Get a URL for a human-readable page that can be loaded into the browser
     *
     * @returns string A URL that can be loaded into the browser
     */
    public abstract humanDocURL(): string;

    /**
     * EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    public abstract asHTML(): Promise<string>;

    /**
     * EXPERIMENTAL: Get a value to use as a url fragment (e.g. https://url.com/path#fragment) when displaying
     * content inside VSCode using the {@link asHTML()} method. When the WebView loads, it will attempt to navigate
     * to this fragment (usually a header anchor in the page).
     *
     * If the fragment is undefined, the WebView won't do anything related to the fragment
     */
    public abstract webViewNavFragment(): string | undefined;
}