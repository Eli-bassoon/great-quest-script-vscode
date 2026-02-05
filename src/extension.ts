import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType } from './parsing';

import { GQSCompletionItemProvider } from './autocomplete';
import { GQSFoldingRangeProvider } from './folding';
import { GQSDocumentSymbolProvider } from './symbols';
import { GQSHoverProvider } from './hover';
import { GQSCodeActionProvider } from './codeactions';
import { updateDialogDecorations, decorationType as dialogDecorationType } from './dialoghints';

const LANGUAGE = 'gqs';

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "great-quest-script" is now active!');

    const debughelp = vscode.commands.registerCommand('great-quest-script.debughelp', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const cursorPos = editor.selection.active;
        const wordRange = editor.document.getWordRangeAtPosition(cursorPos);
        if (wordRange) {
            const word = editor.document.getText(wordRange);
            console.log(word);
        }

        const sections = getSectionNesting(editor.document, editor.selection.active.line);
        console.log(sections);
    });

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
        debughelp,
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
