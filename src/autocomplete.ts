/*
Autocompletion provider
*/

import * as vscode from 'vscode';

import { keywords, kcScriptFunction } from './keywords';
import { propertyLists } from './propertylist';
import { getSectionNesting, getEntityDescType, getPropertyList, getDialogDefinitions } from './parsing';
import { makeRandomHash } from './codeactions';
import { doctext } from './doctext';

class GQSCompletionContext {
    document: vscode.TextDocument;
    position: vscode.Position;
    sections: string[];
    lineText: string;
    lineUntilCursor: string;
    flagWordRange: vscode.Range | undefined;
    spaceAfterAutocomplete: boolean;

    constructor(document: vscode.TextDocument, position: vscode.Position) {
        this.document = document;
        this.position = position;
        this.sections = getSectionNesting(document, position.line - 1);
        this.lineText = document.lineAt(position).text;

        // Line sliced up to the cursor
        this.lineUntilCursor = document.lineAt(position).text.slice(0, position.character).trimStart();

        // If we've typed one or more hyphens, we need to replace them as well when doing the autocomplete
        this.flagWordRange = document.getWordRangeAtPosition(position, /--?[\w\d]*/);

        // Whether we should add spaces after autocomplete
        this.spaceAfterAutocomplete = vscode.workspace.getConfiguration("greatQuestScript").get("addSpaceAfterAutocomplete") !== false;
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
            const causeMatch = ctx.lineText.match(/^\s*cause\s*=\s*/); // Split off the "cause=" part while accounting for spaces
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
    const bracketMatch = ctx.lineUntilCursor.match(/^\[+/);
    if (!bracketMatch) return;

    const bracketsTyped = bracketMatch[0].length;

    const insideBracketRegExp = /\[+(.*?)\]+/;
    const wordRange = ctx.document.getWordRangeAtPosition(ctx.position, insideBracketRegExp);

    // We are top-level if there is only one square bracket
    if (bracketsTyped === 1) {
        // Register top-level GQS sections
        for (let s of keywords.gqsSections) {
            const completion = getSingleSectionCompletion(s, 1, wordRange, false);
            completions.push(completion);
        }
    }

    // Register custom sections so we go to the next line when tab completing, always at depth 2
    if (bracketsTyped === 2) {
        const sectionText = ctx.lineText.match(insideBracketRegExp);
        if (sectionText) {
            const completion = getSingleSectionCompletion(sectionText[1], bracketsTyped, wordRange, false);
            completions.push(completion);
        }
    }

    // Register custom sequence section at depth 3
    if ((bracketsTyped === 3) && (ctx.topSection === "Sequences")) {
        const sectionText = ctx.lineText.match(insideBracketRegExp);
        if (sectionText) {
            // If we are in a sequence, add "hash=" after
            let afterCompletionFill = "hash=";

            // If we are configured to auto-generate a hash, append a hash to the end of the line and place the cursor below
            if (vscode.workspace.getConfiguration("greatQuestScript").get("autogenerateHash") !== false) {
                afterCompletionFill += makeRandomHash() + ' # Automatically generated hash. Ensure this does not collide with anything\n';
            }

            const completion = getSingleSectionCompletion(sectionText[1], bracketsTyped, wordRange, false, afterCompletionFill);
            completions.push(completion);
        }
    }

    // Function headers
    let completingFunction = false;
    let functionBrackets = 0;

    // [[[Function]]] inside [Scripts] -> [[Identifier]]
    if ((ctx.topSection === "Scripts") && (ctx.sections.length >= 2)) {
        completingFunction = true;
        functionBrackets = 3;
    }
    // [[[[Function]]]] inside [Entities] -> [[Identifier]] -> [[[Scripts]]]
    else if (((ctx.sections.at(2) === "Script") && (ctx.sections.length >= 3))) {
        completingFunction = true;
        functionBrackets = 4;
    }

    // Actually perform the function completion
    if (completingFunction) {
        const completion = getSingleSectionCompletion('Function', functionBrackets, wordRange, true, 'cause=');
        // Make this the preferred selection by sorting it early
        completion.sortText = '!!Function';
        completion.preselect = true;
        completions.push(completion);
    }

    // Autocomplete [[[Script]]] when we are in [Entities] section
    if ((ctx.topSection === 'Entities') && (ctx.sections.length === 2)) {
        const completion = getSingleSectionCompletion('Script', 3, wordRange, false);
        completions.push(completion);
    }
}

function getSingleSectionCompletion(
    section: string,
    brackets: number,
    wordRange: vscode.Range | undefined,
    activateAutocompleteAfter: boolean,
    afterCompletionFill: string = "",
): vscode.CompletionItem {
    const LB = '['.repeat(brackets);
    const RB = ']'.repeat(brackets);

    const completion = new vscode.CompletionItem(section, vscode.CompletionItemKind.EnumMember);
    completion.filterText = LB + section + RB;
    // Replace the autocomplete, then move the cursor to the next line
    if (vscode.workspace.getConfiguration("greatQuestScript").get("goToNextLineInSectionHeaders")) {
        completion.insertText = new vscode.SnippetString(LB + section + RB + '\n' + afterCompletionFill + '$0');
        if (activateAutocompleteAfter) {
            completion.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
        }
    }
    else {
        completion.insertText = LB + section + RB;
    }
    completion.range = wordRange;
    return completion;
}

// Get completions when we are in the "cause=" part of a function
function getFunctionCauseCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext, lineUntilCursor: string) {
    // Split into arguments
    const args = lineUntilCursor.split(/ +/);

    // If there are no arguments, we complete the cause types
    if (args.length <= 1) {
        for (let s of keywords.kcScriptCauses) {
            const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Function);
            // Activate autocomplete again if it's an enum type
            tryAddSpaceAfterAutocomplete(completion, ctx, s in keywords.kcScriptCauseArgs);
            completion.documentation = new vscode.MarkdownString(doctext.kcScriptFunctionDocs[s as keyof typeof doctext.kcScriptFunctionDocs]);
            completions.push(completion);
        }
    }
    // If there are arguments, we complete the available constants
    else {
        const cause = args[0];

        // OnDialogAdvance has dialog string completions as its second argument
        if ((args.length === 3) && (cause === 'OnDialog')) {
            getDialogOptionCompletions(completions, ctx);
        }

        else if (cause in keywords.kcScriptCauseArgs) {
            for (let s of keywords.kcScriptCauseArgs[cause as keyof typeof keywords.kcScriptCauseArgs]) {
                const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
                // OnDialog should activate autocomplete again for the available dialogs
                if (cause === "OnDialog") {
                    tryAddSpaceAfterAutocomplete(completion, ctx);
                }
                completions.push(completion);
            }
        }

        // Autocomplete flags if we've done all the arguments
        if ((args.length > 2) || ((args.length > 3) && (cause === 'OnDialog'))) {
            provideFlagCompletions(completions, ctx.flagWordRange, keywords.kcScriptCauseFlags);
        }
    }
}

// Get completions when we are in the body of a function
function getFunctionBodyCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    const inActionSequence = ctx.topSection === 'Sequences';

    // See if we should complete "hash="
    if (inActionSequence) {
        // If we are in a sequence and the line start with "hash=" then we don't autocomplete anything
        if (ctx.lineUntilCursor.match(/^\s*hash\s*=\s*/)) {
            return;
        }
        else {
            tryCompleteFunctionCauseOrHash("hash", completions, ctx);
        }
    }
    else {
        tryCompleteFunctionCauseOrHash("cause", completions, ctx);
    }

    // Split into arguments
    const args = ctx.lineUntilCursor.split(/ +/);

    // If there are no arguments, we complete the function types
    if (args.length <= 1) {
        let functionOptions = inActionSequence ? keywords.kcScriptInSequenceFns : keywords.kcScriptOutSequenceFns;

        for (let _function of functionOptions) {
            const completion = new vscode.CompletionItem(_function, vscode.CompletionItemKind.Function);
            // Activate autocomplete again if it's an enum type
            if (isFunctionEnumType(_function)) {
                tryAddSpaceAfterAutocomplete(completion, ctx);
            }
            completion.documentation = new vscode.MarkdownString(doctext.kcScriptFunctionDocs[_function as keyof typeof doctext.kcScriptFunctionDocs]);
            completions.push(completion);
        }
    }
    // If there are arguments, we complete the available constants and flags
    else {
        const func = args[0];

        // Only suggest enum options if we haven't given one yet
        if (isFunctionEnumType(func) && (args.length <= 2)) {
            // Constants
            if (func in keywords.kcScriptFunctionArgs) {
                for (let s of keywords.kcScriptFunctionArgs[func as keyof typeof keywords.kcScriptFunctionArgs]) {
                    const completion = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
                    completions.push(completion);
                }
            }

            // TriggerEvent string constants
            else if (func === "TriggerEvent") {
                const wordRange = ctx.document.getWordRangeAtPosition(ctx.position, /"?[\w\d]+"?|""/);
                for (let s of keywords.kcScriptTriggerEventArgs) {
                    const completion = new vscode.CompletionItem('"' + s + '"', vscode.CompletionItemKind.Constant);
                    completion.range = wordRange;
                    completions.push(completion);
                }
            }

            // Dialog options
            else if (func === "ShowDialog") {
                getDialogOptionCompletions(completions, ctx);
            }
        }

        // Don't provide flags if we're an enum function and haven't given an enum yet
        // However, the Set/Clear/Init Flags overrides this and should still complete
        if (["SetFlags", "ClearFlags", "InitFlags"].includes(func) ||
            !((args.length === 2) && isFunctionEnumType(func))) {
            // Function-specific flags
            if (func in keywords.kcScriptFunctionFlags) {
                provideFlagCompletions(completions, ctx.flagWordRange, keywords.kcScriptFunctionFlags[func as keyof typeof keywords.kcScriptFunctionFlags]);
            }

            // General flags for any function
            provideFlagCompletions(completions, ctx.flagWordRange, keywords.kcScriptGeneralFlags);
        }
    }
}

function tryCompleteFunctionCauseOrHash(key: string, completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    if (ctx.lineUntilCursor.startsWith(key[0]) || (ctx.lineUntilCursor.trim() === "")) {
        // Go up until we find a non-whitespace line
        for (var lineIdx = ctx.position.line - 1; ctx.document.lineAt(lineIdx).isEmptyOrWhitespace; --lineIdx) { }
        // If it is a section header, autocomplete key= as the preferred selection
        if (ctx.document.lineAt(lineIdx).text.startsWith('[')) {
            const completion = new vscode.CompletionItem(key + "=", vscode.CompletionItemKind.Constant);
            completion.preselect = true;
            completion.sortText = "!!" + key + "=";
            completions.push(completion);
        }
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
            completion.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
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

// Dialog options
function getDialogOptionCompletions(completions: vscode.CompletionItem[], ctx: GQSCompletionContext) {
    const wordRange = ctx.document.getWordRangeAtPosition(ctx.position, /"?\w+"?|""/);
    const dialogs = getDialogDefinitions(ctx.document);
    for (let [dialogName, dialogText] of dialogs.entries()) {
        const completion = new vscode.CompletionItem('"' + dialogName + '"', vscode.CompletionItemKind.Constant);
        completion.detail = dialogText;
        completion.filterText = '"' + dialogName + '"' + ' ' + dialogText; // Filter first by dialog name, then by the text. This lets you search by the text and it will show up in autocomplete
        completion.range = wordRange;
        completions.push(completion);
    }
}

// Whether the function is of enum-type, meaning it has a predefined list of options
function isFunctionEnumType(_function: string): boolean {
    return (
        // Function has rigid enum options
        _function in keywords.kcScriptFunctionArgs)

        // Other functions
        || (["SetFlags", "ClearFlags", "InitFlags", // Entity flag options
            "TriggerEvent", // Event strings
            "ShowDialog" // Dialogs
        ].includes(_function));
}

// Modifies a command to add a space after autocomplete if the setting is set
function tryAddSpaceAfterAutocomplete(completion: vscode.CompletionItem, ctx: GQSCompletionContext, autocompleteAgain: boolean = true) {
    if (ctx.spaceAfterAutocomplete) {
        completion.insertText = completion.label + ' ';
        if (autocompleteAgain) {
            completion.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
        }
    }
}