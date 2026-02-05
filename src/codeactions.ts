/*
Code action to generate hash automatically
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType } from './parsing';

export class GQSCodeActionProvider implements vscode.CodeActionProvider<vscode.CodeAction> {
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        
        const actions: vscode.CodeAction[] = [];

        // If we are just after "hash=", suggest generating a random hash
        const lineUntilCursor = document.lineAt(range.start).text.slice(0, range.start.character).trimStart();
        if (lineUntilCursor.match(/^\s*hash=\s*/)) {
            const action = new vscode.CodeAction("Make Hash", vscode.CodeActionKind.Empty);
            const wsEdit = new vscode.WorkspaceEdit();
            wsEdit.insert(document.uri, range.start, makeRandomHash());
            action.edit = wsEdit;
            action.isPreferred = true;
            actions.push(action);
        }

        return actions;
    }
}

export function makeRandomHash(): string {
    const value = Math.floor(Math.random() * 0x100000000);
    return "0x" + value.toString(16).padStart(8, "0").toUpperCase();
}