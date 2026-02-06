/*
Show dialog as ghost text
*/

import * as vscode from 'vscode';

import * as parsing from './parsing';

export let decorationType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 1ch',
        color: new vscode.ThemeColor('editorInlayHint.foreground'),
        fontStyle: 'italic',
    }
});

export function updateDialogDecorations() {
    // Ensure the editor exists
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Only show if dialog hints are turned on
    if (!vscode.workspace.getConfiguration("greatQuestScript").get("inlineDialog")) return;

    const decorations: vscode.DecorationOptions[] = [];

    // Find the definitions of the dialog
    const definitions = parsing.getDialogDefinitions(editor.document);

    // Show hints for references to dialog
    for (let line = 0; line < editor.document.lineCount; ++line) {
        const lineText = editor.document.lineAt(line).text;
        // See whether we referenced the dialog
        if (lineText.startsWith('ShowDialog') || lineText.match(/^\s*cause\s*=\s*OnDialog/)) {
            // Try to get dialog inside first string, which will be first match of string
            const stringMatches = lineText.match(/"(.*?)"/);
            if (!stringMatches) continue;

            const dialogName = stringMatches[1];
            const dialogText = definitions.get(dialogName);
            if (dialogText !== undefined) {
                // The ghost text is at the end of the line
                decorations.push({
                    range: new vscode.Range(line, lineText.length, line, lineText.length),
                    hoverMessage: dialogText,
                    renderOptions: {
                        after: {
                            contentText: dialogText,
                        }
                    }
                });
            }
        }
    }

    editor.setDecorations(decorationType, decorations);
}