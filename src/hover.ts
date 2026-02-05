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
            const functionDocs = doctext.kcScriptFunctionDocs[hoverWord as keyof typeof doctext.kcScriptFunctionDocs];
            const docs = [
                new vscode.MarkdownString().appendCodeblock(functionDocs[0], 'gqs'),
                new vscode.MarkdownString(functionDocs[1])
            ];
            return new vscode.Hover(docs);
        }
        
        // Check for property
        let propertyList = getPropertyList(document, position);
        if (propertyList) {
            const propertyDocs = propertyList.getPropertyDocs(hoverWord);
            if (propertyDocs){
                const docs = [
                    new vscode.MarkdownString().appendCodeblock(hoverWord, 'gqs'),
                    new vscode.MarkdownString(propertyDocs)
                ];
                return new vscode.Hover(docs);
            }
        }

        return null;
    }
}