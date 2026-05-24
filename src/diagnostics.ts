import * as vscode from 'vscode';

import { Parser, Severity } from './parser/parser';

const LANGUAGE = 'gqs';
const collection = vscode.languages.createDiagnosticCollection(LANGUAGE);

export function updateDiagnostics(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Only show if diagnostics are turned on
    if (!vscode.workspace.getConfiguration("greatQuestScript").get("enableDiagnostics")) {
        collection.clear();
        return;
    }

	if (editor.document && (editor.document.languageId === LANGUAGE)) {
        const parser = new Parser();
        parser.parse(editor.document.getText());

        const errors = [];

        // Add all errors as diagnostics
        for (const err of parser.yieldErrors()) {
            // Get the range of the error as the token boundary, or the whole line otherwise
            let errRange: vscode.Range;
            if (err.token) {
                errRange = new vscode.Range(
                    new vscode.Position(err.token.line, err.token.startChar),
                    new vscode.Position(err.token.line, err.token.endChar)
                );
            }
            // Otherwise the whole line has the error
            else {
                errRange = editor.document.lineAt(err.line).range;
            }

            errors.push({
                code: '',
                message: err.error,
                range: errRange,
                severity: getSeverity(err.severity),
                source: LANGUAGE,
            });
        }
        
		collection.set(editor.document.uri, errors);
	} else {
		collection.clear();
	}
}

function getSeverity(severity: Severity): vscode.DiagnosticSeverity {
    switch (severity) {
        case Severity.Error:
            return vscode.DiagnosticSeverity.Error;
        
        case Severity.Warning:
            return vscode.DiagnosticSeverity.Warning;
    }
}