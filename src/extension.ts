import * as vscode from 'vscode';

import { GQSCompletionItemProvider } from './autocomplete';
import { GQSFoldingRangeProvider } from './folding';
import { GQSDocumentSymbolProvider } from './symbols';
import { GQSHoverProvider } from './hover';
import { GQSCodeActionProvider } from './codeactions';
import { updateDialogDecorations, decorationType as dialogDecorationType } from './dialoghints';

const LANGUAGE = 'gqs';

export function activate(context: vscode.ExtensionContext) {

    // Registers autocomplete
    const autocompleteProvider = vscode.languages.registerCompletionItemProvider(
        LANGUAGE,
        new GQSCompletionItemProvider(),
        '[', '-', '=',
    );

    // Registers section folding
    const foldingProvider = vscode.languages.registerFoldingRangeProvider(
        LANGUAGE,
        new GQSFoldingRangeProvider(),
    );

    // Registers symbols
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
        LANGUAGE,
        new GQSDocumentSymbolProvider(),
    );

    // Registers hover docs
    const hoverProvider = vscode.languages.registerHoverProvider(
        LANGUAGE,
        new GQSHoverProvider(),
    );

    // Registers code actions
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        LANGUAGE,
        new GQSCodeActionProvider(),
    );

    context.subscriptions.push(
        dialogDecorationType,
        autocompleteProvider,
        foldingProvider,
        symbolProvider,
        hoverProvider,
        codeActionProvider,
    );

    // Dialog decorations
    updateDialogDecorations();
    vscode.window.onDidChangeActiveTextEditor(updateDialogDecorations, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(updateDialogDecorations, null, context.subscriptions);
}

// This method is called when your extension is deactivated
export function deactivate() { }
