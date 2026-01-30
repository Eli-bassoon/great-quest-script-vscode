/*
Folding sections provider
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType } from './parsing';

export class GQSFoldingRangeProvider implements vscode.FoldingRangeProvider {
    public provideFoldingRanges(document: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken) {
        const folds: vscode.FoldingRange[] = [];
        const stack: number[] = [];
    
        for (let line = 0; line < document.lineCount; ++line) {
            // Try to match starting square brackets
            const match = document.lineAt(line).text.match(/^\[+/);
            if (match) {
                const depth = match[0].length;
                
                // Pop to stack if we are lower depth
                if (depth <= stack.length) {
                    while (stack.length && depth <= stack.length) {
                        const foldStart = stack.pop() as number;
                        folds.push(new vscode.FoldingRange(foldStart, line-1));
                    }
                    stack.push(line);
                }
                // Push to stack if we are exactly one deeper level
                else if (depth === stack.length+1) {
                    stack.push(line);
                }
                // Depth must either increase by exactly one or decrease by any amount
                // If we increase by more than 1, the document is malformed
                else if (depth > stack.length+1) {
                    return folds;
                }
            }
        }
    
        // EOF, pop all remaining ranges
        while (stack.length) {
            const foldStart = stack.pop() as number;
            folds.push(new vscode.FoldingRange(foldStart, document.lineCount-1));
        }
    
        return folds;
    }
}