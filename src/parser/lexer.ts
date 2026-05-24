import { TokenTypes as TT, Token, TokenCtor } from './tokens';

// Rule type that yields a token
interface Rule<TokenType extends Token<any>> {
    regex: RegExp,
    factory: TokenCtor<TokenType>,
}

// Rule ordering
const rules = [
    { regex: /"(?:[^"\\]|\\.)*"/y, factory: TT.String },
    { regex: /=/y, factory: TT.Equals },
    { regex: /,/y, factory: TT.Comma },
    { regex: /0x[a-fA-F\d]+/y, factory: TT.Hash },
    { regex: /\d+x\d+/y, factory: TT.ResizeArg },
    { regex: /([+-]?([0-9]+[.]([0-9]*)?|[.][0-9]+)([eE][+-]?\d+)?)/y, factory: TT.Float },
    { regex: /([+-]?[0-9]+)|MAX/y, factory: TT.Int },
    { regex: /--[a-zA-Z]\w*/y, factory: TT.Flag },
    { regex: /\[+.+?\]+/y, factory: TT.Section },
] satisfies readonly Rule<any>[];

const strictIdentRule = /[a-zA-Z_/\\\\.](\\ |[\w\[\]{}\-\./\\])*/y; // No spaces within, unless escaped
const permissiveIdentRule = /[^#]*[^#\s]/y; // matches everything on a line until we reach a comment or trailing space

const spaceRegex = /\s+/y;
const commentRegex = /#.*$/ym;

const permissiveKeys = [
    "description",
    "targetEntity",
    "prevWaypoint",
    "nextWaypoint",
    "modelDesc",
    "proxyDesc",
    "skeleton",
    "animationSet",
    "actionSequenceTable",
];

const permissiveSections = [
    "CopyResources",
    "DeleteResources",
    "Animations",
];

// Tries to lex each token based on a list of rules ordered by precedence
// However we have context-sensitive meaning of what an identifier is, so we have to sometimes use a more permissive meaning of "identifier" that includes spaces
export function* lex(source: string): Generator<Token<any>[]> {
    let line = 0;
    let topSection = "";

    // Parse line-by-line
    for (const lineText of source.split(/\r\n|\r|\n/)) {
        // Parse tokens in line
        let index = 0;
        const lineTokens: Token<any>[] = [];
        while (index < lineText.length) {
            // Skip space
            spaceRegex.lastIndex = index;
            let spaceMatch = spaceRegex.exec(lineText);
            if (spaceMatch) {
                index += spaceMatch[0].length;
                continue;
            }

            // Skip comments
            commentRegex.lastIndex = index;
            let commentMatch = commentRegex.exec(lineText);
            if (commentMatch) {
                index += commentMatch[0].length;
                continue;
            }

            // Other rules
            let matched = false;
            for (const { regex, factory } of rules) {
                regex.lastIndex = index;
                const match = regex.exec(lineText);
                if (!match) continue;

                const lexeme = match[0];
                lineTokens.push(new factory(lexeme, line, index, lexeme.length));

                index += lexeme.length;
                matched = true;
                break;
            }

            const lastToken = lineTokens.at(-1);

            // Try to match identifier last
            if (!matched) {
                let regex: RegExp;
                // We match permissive identifiers, allowing spaces inside, only if the following are true:
                // - Inside CopyResources, DeleteResources, or Animations
                // - Inside Entities or EntityDescriptions and after an equals sign but only after certain keys
                if (permissiveSections.includes(topSection)
                    || ((lastToken instanceof TT.Equals)
                        && ((topSection === "Entities") || (topSection === "EntityDescriptions"))
                        && permissiveKeys.includes(lineTokens.at(-2)?.literal)
                    )
                ) {
                    regex = permissiveIdentRule;
                }
                // Otherwise use strict identifier rule not allowing spaces
                else {
                    regex = strictIdentRule;
                }

                regex.lastIndex = index;
                const match = regex.exec(lineText);
                if (match) {
                    const lexeme = match[0];
                    lineTokens.push(new TT.Identifier(lexeme, line, index, lexeme.length));

                    index += lexeme.length;
                    matched = true;
                }
            }

            // No matches means an invalid token
            if (!matched) {
                // Extend invalid token if last token was invalid as well
                if (lastToken instanceof TT.Invalid) {
                    lastToken.lexeme = lastToken.lexeme.concat(lineText.charAt(index));
                    lastToken.literal = lastToken.lexeme;
                    lastToken.length += 1;
                }
                // New invalid token
                else {
                    const invalidToken = new TT.Invalid(lineText.charAt(index), line, index, 1);
                    invalidToken.error = "Invalid token";
                    lineTokens.push(invalidToken);
                }
                index += 1;
            }

            // If we last matched a top level section header, set the current header
            if (lastToken instanceof TT.Section) {
                if (lastToken.balanced && (lastToken.depth === 1)) {
                    topSection = lastToken.literal;
                }
            }
        }
        // Add line of tokens if it is non-empty
        if (lineTokens.length) {
            yield lineTokens;
        }
        ++line;
    }
}
