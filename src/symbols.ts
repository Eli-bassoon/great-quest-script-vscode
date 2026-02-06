/*
Breadcrumb symbols provider
*/

import * as vscode from 'vscode';

import * as parsing from './parsing';

export class GQSDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, _token: vscode.CancellationToken) {
        const symbols: vscode.DocumentSymbol[] = [];

        // Stack of symbols being parsed
        const stack: vscode.DocumentSymbol[] = [];

        for (const section of parsing.iterSections(document)) {
            if (!section.match.groups || !section.match.indices || !section.match.indices.groups) continue;

            // Pop to stack if we are lower depth
            if (section.depth <= stack.length) {
                while (stack.length && section.depth <= stack.length) {
                    popStack(stack, symbols, section.line);
                }
            }
            // Depth must either increase by exactly one or decrease by any amount
            // If we increase by more than 1, the document is malformed
            else if (section.depth > stack.length + 1) {
                return symbols;
            }

            // Push the new symbol
            const symbolKind = getSymbolKind(section.depth, section.name);
            const range = new vscode.Range(section.line, section.match.indices.groups.brackets1[0], section.line, section.match.indices.groups.brackets2[1]);
            const selectionRange = new vscode.Range(section.line, section.match.indices.groups.name[0], section.line, section.match.indices.groups.name[1]);
            const symbol = new vscode.DocumentSymbol(section.name, "", symbolKind, range, selectionRange);

            stack.push(symbol);
        }

        // EOF, pop all remaining ranges
        while (stack.length) {
            popStack(stack, symbols, document.lineCount-1);
        }

        return symbols;
    }
}

function popStack(stack: vscode.DocumentSymbol[], symbols: vscode.DocumentSymbol[], line: number) {
    const child = stack.pop() as vscode.DocumentSymbol;
    child.range = new vscode.Range(child.range.start, new vscode.Position(line, 0));
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

                default:
                    return vscode.SymbolKind.Function;
            }

        // Fourth-level is always a function
        case 4:
            return vscode.SymbolKind.Function;

        // Fifth-level is invalid
        default:
            return vscode.SymbolKind.Null;
    }
}