/*
Hover to see docs
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType, getPropertyList } from './parsing';
import { doctext } from './doctext';

export class GQSHoverProvider implements vscode.HoverProvider {
    public provideHover(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken) {
        const hoverWord = document.getText(document.getWordRangeAtPosition(position));

        // Existing function
        if (hoverWord in doctext.kcScriptFunctionDocs) {
            return new vscode.Hover(new vscode.MarkdownString(doctext.kcScriptFunctionDocs[hoverWord as keyof typeof doctext.kcScriptFunctionDocs]));
        }
        
        // Check for property
        let propertyList = getPropertyList(document, position);
        if (propertyList) {
            const docs = propertyList.getPropertyDocs(hoverWord);
            if (docs) return new vscode.Hover(new vscode.MarkdownString(docs));
        }

        return null;
    }
}