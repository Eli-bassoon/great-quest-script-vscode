/*
Folding sections provider
*/

import * as vscode from 'vscode';

import * as parsing from './parsing';

export class GQSFoldingRangeProvider implements vscode.FoldingRangeProvider {
    public provideFoldingRanges(document: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken) {
        const folds: vscode.FoldingRange[] = [];
        const stack: number[] = [];
        
        for (const section of parsing.iterSections(document)) {
            // Pop to stack if we are lower depth
            if (section.depth <= stack.length) {
                while (stack.length && section.depth <= stack.length) {
                    const foldStart = stack.pop() as number;
                    folds.push(new vscode.FoldingRange(foldStart, section.line-1));
                }
                stack.push(section.line);
            }
            // Push to stack if we are exactly one deeper level
            else if (section.depth === stack.length+1) {
                stack.push(section.line);
            }
            // Depth must either increase by exactly one or decrease by any amount
            // If we increase by more than 1, the document is malformed
            else if (section.depth > stack.length+1) {
                return folds;
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