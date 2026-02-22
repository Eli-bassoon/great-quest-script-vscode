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
        // TODO: Check for balanced brackets
        let text = document.lineAt(line).text.trim();
        if (text && text.startsWith('[')) {
            // Get section match
            let match = text.match(/\[+.+?\]+/);
            if (match === null) continue;
            // Otherwise assign the text to the first match
            text = match[0];

            let nestLevel = 0;
            for (; (nestLevel < text.length) && (text.charAt(nestLevel) === '[') && (text.charAt(text.length - nestLevel - 1) === ']'); ++nestLevel) { }

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

// Iterates over all the balanced sections in the document
export type SectionType = { name: string, text: string, depth: number, line: number, match: RegExpMatchArray }
export function* iterSections(document: vscode.TextDocument): Generator<SectionType> {
    for (let line = 0; line < document.lineCount; ++line) {
        // Try to match header of form [...[THING]...]
        const match = document.lineAt(line).text.match(/^\s*(?<brackets1>\[+)(?<name>.*?)(?<brackets2>\]+)/d);
        if (match && match.groups) {
            const depth1 = match.groups.brackets1.length;
            const depth2 = match.groups.brackets2.length;
            // Ensure the header is balanced
            if (depth1 === depth2) {
                yield { name: match.groups.name, text: match[0], depth: depth1, line, match };
            }
        }
    }
}

// Assuming we are in an entity description in the [EntityDescriptions] section, this finds the type of the entity, marked by "type=TYPE"
export function getEntityDescType(document: vscode.TextDocument, startLine: number): string {
    // Iterate forwards and backwards until we hit the section start or we hit the type= section
    for (let direction of [-1, +1]) {
        for (let line = startLine; 0 <= line && line < document.lineCount; line += direction) {
            let text = document.lineAt(line).text.trim();
            if (!text) continue; // Skip when empty
            if (text.startsWith('[')) break; // Stop when we find a section

            const match = text.match(/^\s*type\s*=\s*(\w+)/);
            if (match) {
                return match[1];
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
        if (document.lineAt(line).text.trim().startsWith('[Dialog]')) {
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
        if (lineText.text.trim().startsWith('[')) return definitions; // Stop when we reach a new section

        const match = lineText.text.match(/^\s*(?<name>\w+)\s*=\s*"(?<dialog>(?:[^"\\]|\\.)*)"/); // Match DIALOG_NAME="Some string", checking for escaped double quotes
        if (match && match.groups) {
            definitions.set(match.groups.name, match.groups.dialog);
        }
    }

    // Return definitions on EOF
    return definitions;
}

// Finds all second level sections under a given top level section
export function getSecondLevelSections(document: vscode.TextDocument, topLevel: string): string[] {
    const sections = [];

    let inSection = false;
    for (const section of iterSections(document)) {
        // Handle top-level sections
        if (section.depth === 1) {
            // If we haven't seen it yet, transition into "in section" state
            if (!inSection) {
                if (section.name === topLevel) {
                    inSection = true;
                }
            }
            // Otherwise break, as we found a new top-level section and don't need to check any more
            else {
                break;
            }
        }

        // Add sections to list
        else if ((section.depth === 2) && inSection) {
            sections.push(section.name);
        }
    }

    // Return sections on EOF
    return sections;
}

// Finds all defined entities in this file only. There are doubtless more options in the data file, but I'm not going to parse that.
export function getEntityDefinitions(document: vscode.TextDocument): string[] {
    const entities = getSecondLevelSections(document, "Entities");

    // Always include Frogger as an option
    if (!entities.includes("FrogInst001")) {
        entities.push("FrogInst001");
    }

    // Return entities on EOF
    return entities;
}
