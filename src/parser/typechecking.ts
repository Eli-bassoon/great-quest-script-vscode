import { TokenTypes as TT, Token } from './tokens';
import { ConsumingArray } from './consumingarray';

export type Constructor<T> = new (...args: any[]) => T;

export class TypeError {
    error: string;
    token: Token<any>;

    constructor(error: string, token: Token<any>) {
        this.error = error;
        this.token = token;
    }
}

export function resultIsError(result: any): result is TypeError[] {
    return (result instanceof Array) && (result[0] instanceof TypeError);
}

// General type checking interface
export interface TypeChecker<ResultType> {
    check(arr: ConsumingArray<Token<any>>): ResultType | TypeError[];
}

// Accepts any type of the specified token type
export class TokenTC<TokenType extends Token<any>> implements TypeChecker<TokenType> {
    checkingType: Constructor<TokenType>;

    constructor(checkingType: Constructor<TokenType>) {
        this.checkingType = checkingType;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType | TypeError[] {
        const token = arr.consume();
        if (token instanceof this.checkingType) {
            return token;
        }
        return [new TypeError("Invalid type", token)];
    }
}

export class OrTC implements TypeChecker<any> {
    checkingTypes: TypeChecker<any>[];

    constructor(checkingTypes: TypeChecker<any>[]) {
        this.checkingTypes = checkingTypes;
    }

    check(arr: ConsumingArray<Token<any>>): any | TypeError[] {
        let firstToken = arr.peek();
        for (const checker of this.checkingTypes) {
            const resultToken = checker.check(arr);
            // Type-checking failed for this checker, but we can try another one
            if (resultIsError(resultToken)) {
                arr.rewind();
                continue;
            }
            // Otherwise we succeeded
            return resultToken;
        }
        // We failed to match any types
        return [new TypeError("Invalid type", firstToken)];
    }
}

// Checks for some specific values
export class LiteralTC<T, TokenType extends Token<T>> implements TypeChecker<TokenType> {
    value: T;
    checkingType: TypeChecker<TokenType>;

    constructor(checkingType: TypeChecker<TokenType>, value: T) {
        this.checkingType = checkingType;
        this.value = value;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType | TypeError[] {
        const res = this.checkingType.check(arr);
        if (!resultIsError(res)) {
            // We are the right type, but might be the wrong value
            if (res.literal === this.value) {
                return res as TokenType;
            }
            // We are the right type but wrong value
            else {
                return [new TypeError(`Invalid value \`${res.literal}\``, res)];
            }
        }
        else {
            // We are the wrong type and value
            const token = (res as TypeError[])[0].token;
            return [new TypeError(`Invalid type and option \`${token.literal}\``, token)];
        }
    }
}

export enum CommaDelim {
    Always,
    Never,
    Optional,
}

// Checks for multiple arguments of a homogeneous type
export class ArrayTC<TokenType extends Token<any>> implements TypeChecker<TokenType[]> {
    subTypeCheckers: TokenTC<TokenType>[];
    commaDelim: CommaDelim;

    constructor(subTypeCheckers: TokenTC<TokenType>[], commaDelim: CommaDelim = CommaDelim.Always) {
        this.subTypeCheckers = subTypeCheckers;
        this.commaDelim = commaDelim;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType[] | TypeError[] {
        const args: TokenType[] = [];
        const errors: TypeError[] = [];

        for (let i = 0; i < this.subTypeCheckers.length; ++i) {
            const resultToken = this.subTypeCheckers[i].check(arr);
            // Type-checking failed for this token
            if (resultIsError(resultToken)) {
                for (let err of resultToken) errors.push(err);
            }
            // If we are comma-delimited, expect a comma next
            if (this.commaDelim !== CommaDelim.Never) {
                const atEnd = i === this.subTypeCheckers.length - 1;
                const isComma = arr.peek() instanceof TT.Comma;

                // Expect a comma unless we are on the last argument
                if (!atEnd && isComma) {
                    arr.consume();
                }
                else if (!atEnd && !isComma && (this.commaDelim === CommaDelim.Always)) {
                    errors.push(new TypeError("Missing comma", arr.peek()));
                }
                else if (atEnd && isComma) {
                    errors.push(new TypeError("Trailing comma", arr.consume()));
                }
            }

            if (!resultIsError(resultToken)) {
                args.push(resultToken as TokenType);
            }
        }

        if (errors.length) {
            return errors;
        }
        return args;
    }
}

// Checks for any number of elements of the specified type, optionally delimited by commas
export class VarArrayTC<TokenType extends Token<any>> implements TypeChecker<TokenType[]> {
    checkingType: TypeChecker<TokenType>;
    commaDelim: CommaDelim;

    constructor(checkingType: TypeChecker<TokenType>, commaDelim: CommaDelim = CommaDelim.Always) {
        this.checkingType = checkingType;
        this.commaDelim = commaDelim;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType[] | TypeError[] {
        const args: TokenType[] = [];
        const errors: TypeError[] = [];

        let needsComma = false;

        while (!arr.done()) {
            // Try consuming type
            const token = this.checkingType.check(arr);
            if (!resultIsError(token)) {
                args.push(token as TokenType);
                // Bad, we need a comma between elements
                if (needsComma) {
                    errors.push(new TypeError("Missing comma", token as TokenType));
                }
            }
            // Bad, token type check failed
            else {
                for (let err of token) errors.push(err);
            }

            // Try consuming comma
            if (this.commaDelim !== CommaDelim.Never) {
                if (arr.peek() instanceof TT.Comma) {
                    arr.consume();
                    needsComma = false;
                }
                else if (this.commaDelim === CommaDelim.Always) {
                    needsComma = true;
                }
            }
        }

        if (errors.length) {
            return errors;
        }
        return args;
    }
}

// Match a Vector4, which is actually either Vector3 or Vector4
export class Vector4TCC implements TypeChecker<TT.Numeric[]> {
    checkingType: VarArrayTC<TT.Numeric>;

    constructor() {
        this.checkingType = new VarArrayTC<TT.Numeric>(NumericTC, CommaDelim.Always);
    }

    check(arr: ConsumingArray<Token<any>>): TT.Numeric[] | TypeError[] {
        const tokens = this.checkingType.check(arr);
        // See if this is an array at all
        if (resultIsError(tokens)) {
            return tokens;
        }
        // Exactly 3 or 4 numbers is good
        else if ((tokens.length === 3) || (tokens.length === 4)) {
            return tokens;
        }
        // < 3 numbers is too few
        else if (tokens.length < 3) {
            let errors: TypeError[] = [];
            for (const token of tokens) {
                errors.push(new TypeError("Too few arguments for vector", token));
            }
            return errors;
        }
        // > 4 tokens is too many
        else {
            let errors: TypeError[] = [];
            for (let i = 4; i < tokens.length; ++i) {
                errors.push(new TypeError("Too many arguments for vector", tokens[i]));
            }
            return errors;
        }
    }
}

// Checks for some specific values
export class EnumTC<TokenType extends Token<any>> implements TypeChecker<TokenType> {
    options: any[];
    checkingType: TypeChecker<TokenType>;

    constructor(checkingType: TypeChecker<TokenType>, options: any[]) {
        this.checkingType = checkingType;
        this.options = options;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType | TypeError[] {
        const res = this.checkingType.check(arr);
        if (!resultIsError(res)) {
            // We are the right type, but might be the wrong value
            if (this.options.includes(res.literal)) {
                return res as TokenType;
            }
            // We are the right type but wrong value
            else {
                return [new TypeError(`Invalid option \`${res.literal}\``, res)];
            }
        }
        else {
            // We are the wrong type and value
            const token = (res as TypeError[])[0].token;
            return [new TypeError(`Invalid type and option \`${token.literal}\``, token)];
        }
    }
}

// Checks for a numeric type in range, inclusive
export class BoundedNumericTC<TokenType extends TT.Numeric> implements TypeChecker<TokenType> {
    checkingType: Constructor<TokenType>;
    lb: number;
    ub: number;

    constructor(checkingType: Constructor<TokenType>, lb: number = -Infinity, ub: number = Infinity) {
        this.checkingType = checkingType;
        this.lb = lb;
        this.ub = ub;
    }

    check(arr: ConsumingArray<Token<any>>): TokenType | TypeError[] {
        const token = arr.consume();
        // Correct type
        if (token instanceof this.checkingType) {
            // In range
            if (this.lb <= token.literal && token.literal <= this.ub) {
                return token as TokenType;
            }
            // Out of range
            else {
                return [new TypeError(`Value \`${token.literal}\` out of range [${this.lb}, ${this.ub}]`, token)];
            }
        }
        return [new TypeError("Invalid type", token)];
    }
}

export function MakeBoundNumTC(lb: number = -Infinity, ub: number = Infinity) {
    return new BoundedNumericTC<TT.Numeric>(TT.Numeric, lb, ub);
}

export function MakeBoundIntTC(lb: number = -Infinity, ub: number = Infinity) {
    return new BoundedNumericTC<TT.Int>(TT.Int, lb, ub);
}

// Some helpers
export const NumericTC = new TokenTC<TT.Numeric>(TT.Numeric);
export const IntTC = new TokenTC<TT.Int>(TT.Int);
export const StringTC = new TokenTC<TT.String>(TT.String);
export const FlagTC = new TokenTC<TT.Flag>(TT.Flag);
export const IdentTC = new TokenTC<TT.Identifier>(TT.Identifier);
export const ResizeTC = new TokenTC<TT.ResizeArg>(TT.ResizeArg);
export const EqualsTC = new TokenTC<TT.Equals>(TT.Equals);
export const HashTC = new TokenTC<TT.Hash>(TT.Hash);
export const PosNumTC = MakeBoundNumTC(0, Infinity);
export const PosIntTC = MakeBoundIntTC(0, Infinity);
export const PercentTC = MakeBoundIntTC(0, 100);
export const Vector3TC = new ArrayTC<TT.Numeric>([NumericTC, NumericTC, NumericTC], CommaDelim.Always);
export const Vector4TC = new Vector4TCC();
export const VarArrFlagTC = (flags: string[]) => new VarArrayTC<TT.Flag>(new EnumTC(FlagTC, flags));
export const VarArrEnumTC = (options: string[]) => new VarArrayTC<TT.Identifier>(new EnumTC(IdentTC, options));
export const EnumIdTC = (options: string[]) => new EnumTC(IdentTC, options);
export const EnumFlagTC = (options: string[]) => new EnumTC(FlagTC, options);
export const EnumStringTC = (options: string[]) => new EnumTC(StringTC, options);
export const BoolTC = EnumIdTC(["true", "false"]);
