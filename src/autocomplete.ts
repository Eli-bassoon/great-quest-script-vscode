/*
Autocompletion provider
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType, getPropertyList } from './parsing';
import { doctext } from './doctext';

class GQSCompletionContext {
    document: vscode.TextDocument;
    position: vscode.Position;
    sections: string[];
    lineText: string;
    lineUntilCursor: string;
    flagWordRange: vscode.Range | undefined;

    constructor(document: vscode.TextDocument, position: vscode.Position) {
        this.document = document;
        this.position = position;
        this.sections = getSectionNesting(document, position.line - 1);
        this.lineText = document.lineAt(position).text;

        // Line sliced up to the cursor
        this.lineUntilCursor = document.lineAt(position).text.slice(0, position.character).trimStart();

        // If we've typed one or more hyphens, we need to replace them as well when doing the autocomplete
        this.flagWordRange = document.getWordRangeAtPosition(position, /--?[\w\d]*/);
    }

    get topSection(): string | undefined {
        return this.sections.at(0);
    }
}

export class GQSCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {
        const completions: vscode.CompletionItem[] = [];

        let ctx = new GQSCompletionContext(
            document,
            position,
        );

        // Only complete flags when we have 2 hyphens --
        if ((ctx.lineText.at(position.character - 1) === '-') && ((ctx.lineText.length <= 1) || (ctx.lineText.at(position.character - 2) !== '-'))) {
            return completions;
        }

        // Sections
        if (ctx.lineUntilCursor.startsWith('[')) {
            getSectionCompletions(completions, ctx);
            return completions;
        }

        // From here on, we assume we are inside some section
        if (ctx.topSection === undefined) return completions;

        // kcScript
        if ((ctx.sections.at(-1) === 'Function') || ((ctx.topSection === 'Sequences') && (ctx.sections.length === 3))) {
            // Inside cause
            const causeMatch = ctx.lineText.match(/^\s*cause\s*=/); // Split off the "cause=" part while accounting for spaces
            if (causeMatch) {
                getFunctionCauseCompletions(completions, ctx, ctx.lineUntilCursor.slice(causeMatch[0].length).trimStart());
            }
            // Inside function statement
            else {
                getFunctionBodyCompletions(completions, ctx);
            }
            return completions;
        }

        // Flags for other headers
        const args = ctx.lineUntilCursor.split(/ +/);
        if ((args.length > 1) && (ctx.sections.length === 1)) {
            if (ctx.topSection in keywords.gqsSectionFlags) {
                provideFlagCompletions(completions, ctx.flagWordRange, keywords.gqsSectionFlags[ctx.topSection as keyof typeof keywords.gqsSectionFlags]);
            }
        }
        // Descriptions
        else if (ctx.sections.length === 2) {
            getDescriptionCompletions(completions, ctx);
        }

        return completions;
    }
}

// Helper function that adds flags to the autocomplete list
function provideFlagCompletions(completions: vscode.CompletionItem[], flagWordRange: vscode.Range | undefined, availableFlags: string[]) {
    for (let s of availableFlags) {
        const completion = new vscode.CompletionItem('--' + s, vscode.CompletionItemKind.Constant);
        completion.range = flagWordRange;
        completions.push(completion);
    }
}

// Get completions when we are in a section
function getSectionCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    // We are top-level if there is only one square bracket
    if (!ctx.lineUntilCursor.startsWith('[[')) {
        // Register top-level GQS sections
        for (let s of keywords.gqsSections) {
            const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.EnumMember);
            completions.push(completion);
        }
    }

    // Autocomplete Function section
    else if (((ctx.topSection === "Scripts") && ctx.lineUntilCursor.startsWith('[[['))        // In [Scripts] section
        || ((ctx.sections.at(2) === "Script") && ctx.lineUntilCursor.startsWith('[[[[')) // In [[[Script]]] section
    ) {
        const completion = new vscode.CompletionItem("Function", vscode.CompletionItemKind.EnumMember);
        completions.push(completion);
    }

    // Autocomplete [[[Script]]] when we are in [Entities] section
    else if ((ctx.topSection === 'Entities') && ctx.lineUntilCursor.startsWith('[[[')) {
        const completion = new vscode.CompletionItem("Script", vscode.CompletionItemKind.EnumMember);
        completions.push(completion);
    }
}

// Get completions when we are in the "cause=" part of a function
function getFunctionCauseCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext, lineUntilCursor: string) {
    // Split into arguments
    const args = lineUntilCursor.split(/ +/);

    // If there are no arguments, we complete the cause types
    if (args.length <= 1) {
        for (let s of keywords.kcScriptCauses) {
            const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Function);
            completion.documentation = new vscode.MarkdownString(doctext.kcScriptFunctionDocs[s as keyof typeof doctext.kcScriptFunctionDocs]);
            completions.push(completion);
        }
    }
    // If there are arguments, we complete the available constants
    else {
        const cause = args[0];
        type CauseKey = keyof typeof keywords.kcScriptCauseArgs;
        if (cause in keywords.kcScriptCauseArgs) {
            for (let s of keywords.kcScriptCauseArgs[cause as CauseKey]) {
                const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
                completions.push(completion);
            }
        }
    }
}

// Get completions when we are in the body of a function
function getFunctionBodyCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    const inActionSequence = ctx.topSection === 'Sequences';

    // Split into arguments
    const args = ctx.lineUntilCursor.split(/ +/);

    // If there are no arguments, we complete the function types
    if (args.length <= 1) {
        for (let _function of keywords.kcScriptFunctions) {
            // Complete contextually if we are in a script or action sequence
            if ((_function.script && !inActionSequence) || (_function.sequence && inActionSequence)) {
                const completion = new vscode.CompletionItem(_function.name, vscode.CompletionItemKind.Function);
                completion.documentation = new vscode.MarkdownString(doctext.kcScriptFunctionDocs[_function.name as keyof typeof doctext.kcScriptFunctionDocs]);
                completions.push(completion);
            }
        }
    }
    // If there are arguments, we complete the available constants and flags
    else {
        const func = args[0];

        // Constants
        if (func in keywords.kcScriptFunctionArgs) {
            for (let s of keywords.kcScriptFunctionArgs[func as keyof typeof keywords.kcScriptFunctionArgs]) {
                const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
                completions.push(completion);
            }
        }

        // TriggerEvent string constants
        if (func === "TriggerEvent") {
            const wordRange = ctx.document.getWordRangeAtPosition(ctx.position, /"?[\w\d]+"?|""/);
            for (let s of keywords.kcScriptTriggerEventArgs) {
                const completion = new vscode.CompletionItem('"' + s + '"', vscode.CompletionItemKind.Constant);
                completion.range = wordRange;
                completions.push(completion);
            }
        }

        // Function-specific flags
        if (func in keywords.kcScriptFunctionFlags) {
            provideFlagCompletions(completions, ctx.flagWordRange, keywords.kcScriptFunctionFlags[func as keyof typeof keywords.kcScriptFunctionFlags]);
        }

        // General flags for any function
        provideFlagCompletions(completions, ctx.flagWordRange, keywords.kcScriptGeneralFlags);
    }
}

// Keys, enums, and flags for descriptions
function getDescriptionCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    let propertyList = getPropertyList(ctx.document, ctx.position, ctx.topSection);
    if (propertyList === null) return;

    // No equal sign means we can suggest properties
    if (!ctx.lineUntilCursor.includes('=')) {
        for (let s of propertyList.getProperties()) {
            const completion = new vscode.CompletionItem(s + '=', vscode.CompletionItemKind.Constant);
            const docs = propertyList.getPropertyDocs(s);
            if (docs) completion.documentation = new vscode.MarkdownString(docs);
            completions.push(completion);
        }
    }
    // Otherwise we can suggest enum options
    else {
        const key = ctx.lineUntilCursor.match(/^\s*(\w+?)\s*=/); // Get the key part of "key=" while removing space
        if (!key) return;

        for (let s of propertyList.getEnumOptions(key[1])) {
            const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
            completions.push(completion);
        }
    }
}