// Token types
export abstract class Token<LiteralType = string> {
    lexeme: string;
    line: number;
    startChar: number;
    length: number;
    literal: LiteralType;
    error: string | null = null;

    constructor(lexeme: string, line: number, startChar: number, length: number) {
        this.lexeme = lexeme;
        this.line = line;
        this.startChar = startChar;
        this.length = length;
        this.literal = this.parseLiteral(lexeme);
    }

    // Exclusive end of where this location is located, as an offset to the line
    get endChar(): number {
        return this.startChar + this.length;
    }

    // Range [start, end) containing this token
    get lineRange(): [number, number] {
        return [this.startChar, this.endChar];
    }

    // Virtual method, can be overridden depending on the type
    protected parseLiteral(_lexeme: string): LiteralType {
        return _lexeme as LiteralType;
    }
}
// Type of constructor
export type TokenCtor<T extends Token<any>> = new (lexeme: string, line: number, start: number, length: number) => T;

export namespace TokenTypes {
    // Actual tokens
    export class String extends Token<string> {
        protected parseLiteral(lexeme: string): string {
            return lexeme.slice(1, lexeme.length-1);
        }
    }

    export class Flag extends Token<string> {
        protected parseLiteral(lexeme: string): string {
            return lexeme.slice(2);
        }
    }

    export class Hash extends Token {}

    export class Numeric extends Token<number> {
        protected parseLiteral(lexeme: string): number {
            return parseFloat(lexeme);
        }
    }

    export class Int extends Numeric {
        protected parseLiteral(lexeme: string): number {
            // Special case where MAX = Infinity
            if (lexeme === "MAX") {
                return Infinity;
            }
            else {
                return parseInt(lexeme);
            }
        }
    }

    export class Float extends Numeric {}

    export class Identifier extends Token {}

    export class Equals extends Token {}

    export class Comma extends Token {}

    export class Section extends Token<string> {
        depth: number = 0;
        balanced: boolean = false;

        constructor(lexeme: string, line: number, startChar: number, length: number) {
            super(lexeme, line, startChar, length);

            // Get what's inside the literal
            let match = lexeme.match(/^(?<brackets1>\[+)(?<name>(.+?))(?<brackets2>\]+)$/);
            if (!match || !match.groups) return;
    
            // Get the depth and check for balance
            this.depth = match.groups.brackets1.length;
            const depthRight = match.groups.brackets2.length;
            // This becomes bad if it's unbalanced
            this.balanced = this.depth === depthRight;
            if (!this.balanced) {
                this.error = `Section ${this.lexeme} has unbalanced brackets (left=${this.depth}, right=${depthRight})`;
            }
            this.literal = match.groups.name;
        }
    }

    // Resize has format of WWWxHHH
    export type ResizeArgType = { width: number, height: number};
    export class ResizeArg extends Token<ResizeArgType> {
        protected parseLiteral(lexeme: string): ResizeArgType {
            const split = lexeme.split('x');
            const width = parseInt(split[0]);
            const height = parseInt(split[1]);
            return { width, height };
        }
    }

    export class Invalid extends Token {}
}