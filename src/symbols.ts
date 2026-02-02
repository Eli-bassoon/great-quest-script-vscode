/*
Breadcrumb symbols provider
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType } from './parsing';

export class GQSDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, _token: vscode.CancellationToken) {
        const symbols: vscode.DocumentSymbol[] = [];

        // Stack of symbols being parsed
        const stack: vscode.DocumentSymbol[] = [];

        for (let line = 0; line < document.lineCount; ++line) {
            // Try to match header of form [...[THING]...]
            const match = document.lineAt(line).text.match(/^(?<brackets>\[+)(?<name>.*?)\]+/d);
            if (match && match.groups && match.indices && match.indices.groups) {
                const depth = match.groups.brackets.length;

                // Pop to stack if we are lower depth
                if (depth <= stack.length) {
                    while (stack.length && depth <= stack.length) {
                        popStack(stack, symbols);
                    }
                }
                // Depth must either increase by exactly one or decrease by any amount
                // If we increase by more than 1, the document is malformed
                else if (depth > stack.length + 1) {
                    return symbols;
                }

                // Push the new symbol
                const symbolKind = getSymbolKind(depth, match.groups.name);

                const range = new vscode.Range(line, match.indices.groups.name[0], line, match.indices.groups.name[1]);
                const symbol = new vscode.DocumentSymbol(match.groups.name, "", symbolKind, range, range);

                stack.push(symbol);
            }
        }

        // EOF, pop all remaining ranges
        while (stack.length) {
            popStack(stack, symbols);
        }

        return symbols;
    }
}

function popStack(stack: vscode.DocumentSymbol[], symbols: vscode.DocumentSymbol[]) {
    const child = stack.pop() as vscode.DocumentSymbol;
    if (stack.length) {
        stack.at(-1)?.children.push(child);
    }
    else {
        symbols.push(child);
    }
}

function getSymbolKind(depth: number, name: string): vscode.SymbolKind {
    switch (depth) {
        // Top-level uses namespace symbol
        case 1:
            return vscode.SymbolKind.Namespace;

        // Second-level uses variable symbol
        case 2:
            return vscode.SymbolKind.Variable;

        // Third-level depends on the text
        case 3:
            switch (name) {
                case "Script":
                    return vscode.SymbolKind.Namespace;

                case "Function":
                    return vscode.SymbolKind.Function;

                default:
                    return vscode.SymbolKind.Variable;
            }

        // Fourth-level is always a function
        case 4:
            return vscode.SymbolKind.Function;

        // Fifth-level is invalid
        default:
            return vscode.SymbolKind.Null;
    }
}