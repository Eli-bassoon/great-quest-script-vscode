/*
Various functions that parse the document
*/

import * as vscode from 'vscode';
import { PropertyList, propertyLists } from './propertylist';

// Get the nesting levels and names of a position in the document
// GQS is hierarchical and nesting levels are denoted by increasing numbers of square brackets in headers
// So we start with [Header1], then the next level is [[Header2]], and so on
// This gets all levels of nesting up to the first
export function getSectionNesting(document: vscode.TextDocument, line: number): string[] {
    const sections: string[] = [];

    // Iterate backwards until we hit the start or hit a line with the lowest level of nesting
    let currNesting = Number.MAX_SAFE_INTEGER;
    for (; line >= 0; --line) {
        // Section
        // TODO: Can we have whitespace starting a section?
        // TODO: Check for balanced brackets
        let text = document.lineAt(line).text;
        if (text && (text.charAt(0) === '[')) {
            // Get section match
            let match = text.match(/\[+.+?\]+/);
            if (match === null) continue;
            // Otherwise assign the text to the first match
            text = match[0];

            let nestLevel = 0;
            for (; (nestLevel < text.length) && (text.charAt(nestLevel) === '[') && (text.charAt(text.length - nestLevel - 1) === ']'); ++nestLevel) {}

            // Add section if it is less than the current section depth
            if (nestLevel < currNesting) {
                sections.push(text.slice(nestLevel, text.length - nestLevel));
                currNesting = nestLevel;
            }

            // Top level nesting
            if (currNesting === 1) {
                break;
            }
        }
    }
    return sections.reverse();
}

// Assuming we are in an entity description in the [EntityDescriptions] section, this finds the type of the entity, marked by "type=TYPE"
export function getEntityDescType(document: vscode.TextDocument, startLine: number): string {
    // Iterate forwards and backwards until we hit the section start or we hit the type= section
    for (let direction of [-1, +1]) {
        for (let line = startLine; 0 <= line && line < document.lineCount; line += direction) {
            let text = document.lineAt(line).text;
            if (!text) continue; // Skip when empty
            if (text.charAt(0) === '[') break; // Stop when we find a section - TODO: Can we have whitespace starting a section?
    
            if (text.startsWith('type=')) {
                // Extract the type
                text = text.slice('type='.length);
                const match = text.match(/[\w_]+/);
                if (match !== null) {
                    return match[0];
                }
            }
        }
    }
    return "";
}

// Get the property list of the current description
export function getPropertyList(document: vscode.TextDocument, position: vscode.Position, topSection?: string): PropertyList | null {
    // If topSection isn't provided, get it ourselves
    if (topSection === undefined) {
        const sections = getSectionNesting(document, position.line);
        if (sections.length) {
            topSection = sections[0];
        }
        else {
            return null;
        }
    }

    // Get the property list depending on the top section and entity type
    switch (topSection) {
        case "Collision":
            return propertyLists.collision;

        case "Entities":
            return propertyLists.entityInst;

        case "Launchers":
            return propertyLists.launcher;

        case "EntityDescriptions":
            // Get the type of entity to get its property list
            const entityDescType = getEntityDescType(document, position.line);
            if (entityDescType in propertyLists.entityDesc) {
                return propertyLists.entityDesc[entityDescType as keyof typeof propertyLists.entityDesc];
            }
            else {
                return propertyLists.baseEntity;
            }

        default:
            return null;
    }
}

// Finds all the definitions of dialog in the document
export function getDialogDefinitions(document: vscode.TextDocument): Map<string, string> {
    const definitions = new Map<string, string>();

    for (var line = 0; line < document.lineCount; ++line) {
        if (document.lineAt(line).text.startsWith('[Dialog]')) {
            ++line;
            break;
        }
    }
    // See if there exists a dialog section at all
    if (line === document.lineCount) {
        return definitions;
    }

    // Now parse each dialog definition
    for (; line < document.lineCount; ++line) {
        // If we hit a new section, stop searching
        const lineText = document.lineAt(line);
        if (lineText.isEmptyOrWhitespace) continue; // Skip empty lines
        if (lineText.text.startsWith('[')) return definitions; // Stop when we reach a new section

        const match = lineText.text.match(/^(?<name>\w+)\s*=\s*"(?<dialog>(?:[^"\\]|\\.)*)"/); // Match `DIALOG_NAME="Some string"`, checking for escaped double quotes
        if (match && match.groups) {
            definitions.set(match.groups.name, match.groups.dialog);
        }
    }

    // Return definitions on EOF
    return definitions;
}