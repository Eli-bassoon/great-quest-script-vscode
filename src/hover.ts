/*
Hover to see docs
*/

import * as vscode from 'vscode';

import * as doctext from './doctext';
import * as parsing from './parsing';

export class GQSHoverProvider implements vscode.HoverProvider {
    public provideHover(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken) {
        const hoverWord = document.getText(document.getWordRangeAtPosition(position));

        // Existing function
        if (hoverWord in doctext.functions) {
            const functionDocs = doctext.functions[hoverWord as keyof typeof doctext.functions];
            const docs = [
                new vscode.MarkdownString().appendCodeblock(functionDocs[0], 'gqs'),
                new vscode.MarkdownString(functionDocs[1])
            ];
            return new vscode.Hover(docs);
        }
        
        // Check for property
        let propertyList = parsing.getPropertyList(document, position);
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