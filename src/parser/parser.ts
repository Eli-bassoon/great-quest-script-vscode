import { TokenTypes as TT, Token } from './tokens';
import { lex } from './lexer';
import * as AST from './ast';
import * as TC from './typechecking';
import { ConsumingArray } from './consumingarray';
import { FlagTypes, CommandSignatures, SpecialCommandSignatures } from './typesignatures';

import * as keywords from '../keywords';
import { propertyLists, PropertyList } from '../propertylist';

enum ValidSection {
    Valid,
    Invalid,
    InvalidCustomError,
}

export enum Severity {
    Error,
    Warning,
}

// ============================================================
//                        Parser states
// ============================================================
namespace States {
    export abstract class State {
        parent: State | null;
    
        constructor(parent: State | null) {
            this.parent = parent;
        }
    
        parse(_parser: Parser, _tokenLine: Token<any>[]): State {
            return this;
        }
    }
    
    export abstract class Section extends State {
        ast?: AST.Section;

        constructor(parent: Section | null) {
            super(parent);
        }
    
        // Whether a section name is valid for the given state
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Invalid;
        }
        
        // When we go up a section, use this function to modify the AST
        onGoUpSection(parser: Parser) {
    
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
    
        }
    }
    
    export class TopLevel extends Section {
        constructor() {
            super(null);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // If this happens, we are parsing a line that isn't a header
            // This is invalid, so we mark the token as bad
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("All content must be inside a section header", token);
            }
    
            return this;
        }
    
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            // Ensure token exists as an option for top sections
            if (keywords.sections.gqs.includes(token.literal)) {
                // Ensure we haven't seen this section yet
                if (!(parser.ast.orderedSections.map((section) => section.token.literal)).includes(token.literal)) {
                    return ValidSection.Valid;
                }
                else {
                    // Parse error
                    parser.addTokenError(`Section \`${token.lexeme}\` already seen`, token);
                    return ValidSection.InvalidCustomError;
                }
            }
            // Parse error
            parser.addTokenError(`Section \`${token.lexeme}\` is not a valid top-level section`, token);
    
            return ValidSection.InvalidCustomError;
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            let newState: Section;
    
            switch (token.literal) {
                case "Models":
                    newState = new Models(this, token);
                    break;
    
                case "Textures":
                    newState = new Textures(this, token);
                    break;
    
                case "SoundEffects":
                    newState = new SoundEffects(this, token);
                    break;
    
                case "CopyResources":
                    newState = new CopyResources(this, token);
                    break;
    
                case "DeleteResources":
                    newState = new DeleteResources(this, token);
                    break;
    
                case "Animations":
                    newState = new Animations(this, token);
                    break;
    
                case "Sequences":
                    newState = new Sequences(this, token);
                    break;
    
                case "Dialog":
                    newState = new Dialog(this, token);
                    break;
    
                case "Collision":
                    newState = new Collision(this, token);
                    break;
    
                case "Launchers":
                    newState = new Launchers(this, token);
                    break;
    
                case "Entities":
                    newState = new Entities(this, token);
                    break;
    
                case "EntityDescriptions":
                    newState = new EntityDescs(this, token);
                    break;
    
                case "Scripts":
                    newState = new Scripts(this, token);
                    break;
    
                case "Include":
                    newState = new Include(this, token);
                    break;
    
                default:
                    console.warn("Unknown header");
                    return;
            }
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Models]
    export class Models extends Section {
        ast: AST.ModelsS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.ModelsS(token);
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.Models = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                keywords.flags.sections.Models,
                FlagTypes.sections.Models,
            );
            if (sig) {
                this.ast.models.push(new AST.Model(sig));
            }
            return this;
        }
    }
    
    // [Textures]
    export class Textures extends Section {
        ast: AST.TexturesS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.TexturesS(token);
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.Textures = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                keywords.flags.sections.Textures,
                FlagTypes.sections.Textures,
            );
            if (sig) {
                this.ast.textures.push(new AST.Texture(sig));
            }
            return this;
        }
    }
    
    // [SoundEffects]
    export class SoundEffects extends Section {
        ast: AST.SoundEffectsS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.SoundEffectsS(token);
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.SoundEffects = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                keywords.flags.sections.SoundEffects,
                FlagTypes.sections.SoundEffects,
            );
            if (sig) {
                this.ast.soundEffects.push(new AST.SoundEffect(sig));
            }
            return this;
        }
    }
    
    // [CopyResources]
    export class CopyResources extends Section {
        ast: AST.CopyResourcesS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.CopyResourcesS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [CopyResources] section", token);
            }
    
            return this;
        }
    
        // All files are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.CopyResources = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new CopyResourcesFile(this, token);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [CopyResources] -> [[SomeFile]]
    export class CopyResourcesFile extends Section {
        resources: AST.CopyResourcesFile;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.resources = new AST.CopyResourcesFile(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                [],
                {},
            );
            if (sig) {
                this.resources.resources.push(sig.args[0] as TT.Identifier);
            }
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            // Add this entity to the parent
            (this.parent as CopyResources).ast.subsections.push(this.resources);
        }
    }
    
    // [DeleteResources]
    export class DeleteResources extends Section {
        ast: AST.DeleteResourcesS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.DeleteResourcesS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                [],
                {},
            );
            if (sig) {
                this.ast.resources.push(sig.args[0] as TT.Identifier);
            }
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.DeleteResources = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    }
    
    // [Animations]
    export class Animations extends Section {
        ast: AST.AnimationsS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.AnimationsS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Animations] section", token);
            }
    
            return this;
        }
    
        // All files are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.Animations = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new AnimationSet(this, token);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Animations] -> [[SomeAnimationFile]]
    export class AnimationSet extends Section {
        ast: AST.Animation;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.Animation(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                [],
                {},
            );
            if (sig) {
                this.ast.animations.push(sig.args[0] as TT.Identifier);
            }
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            // Add this entity to the parent
            (this.parent as Animations).ast.subsections.push(this.ast);
        }
    }
    
    // [Sequences]
    export class Sequences extends Section {
        ast: AST.SequencesS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.SequencesS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Sequences] section", token);
            }
    
            return this;
        }
    
        // All sequences are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.Sequences = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new ScriptCollection(this, token, new AST.EntitySequencesS(token), true, AST.Sequence);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Dialog]
    export class Dialog extends Section {
        ast: AST.DialogS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.DialogS(token);
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.Dialog = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC, TC.EqualsTC, TC.StringTC],
                [],
                {},
            );
            if (sig) {
                // Ensure there are no duplicates
                if (!this.ast.dialogs.has(sig.args[0].literal)) {
                    this.ast.dialogs.set((sig.args[0] as Token).literal, (sig.args[0] as Token).literal);
                }
                else {
                    parser.addError("Duplicate dialog id", parser.lineIdx);
                }
            }
            return this;
        }
    }
    
    // [Collision]
    export class Collision extends Section {
        ast: AST.CollisionS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.CollisionS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Collision] section", token);
            }
    
            return this;
        }
    
        // All collision proxies are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.Collision = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new CollisionProxy(this, token);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Collision] -> [[SomeProxyName]]
    export class CollisionProxy extends Section {
        collisionProxy: AST.CollisionProxy;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.collisionProxy = new AST.CollisionProxy(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Parse keys and values
            parseKeyVal(parser, this.collisionProxy.properties, propertyLists.collision, new ConsumingArray(tokenLine));
    
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            checkForMissingFields(parser, propertyLists.collision, this.collisionProxy.properties, this.collisionProxy.startLine);
    
            // Add this entity to the parent
            (this.parent as Collision).ast.subsections.push(this.collisionProxy);
        }
    }
    
    // [Launchers]
    export class Launchers extends Section {
        ast: AST.LaunchersS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.LaunchersS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Launchers] section", token);
            }
    
            return this;
        }
    
        // All Launchers proxies are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.Launchers = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new SingleLauncher(this, token);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Launchers] -> [[SomeLauncherName]]
    export class SingleLauncher extends Section {
        launcher: AST.Launcher;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.launcher = new AST.Launcher(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Parse keys and values
            parseKeyVal(parser, this.launcher.properties, propertyLists.launcher, new ConsumingArray(tokenLine));
    
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            checkForMissingFields(parser, propertyLists.launcher, this.launcher.properties, this.launcher.startLine);
    
            // Add this entity to the parent
            (this.parent as Launchers).ast.subsections.push(this.launcher);
        }
    }
    
    // [EntityDescriptions]
    export class EntityDescs extends Section {
        ast: AST.EntityDescsS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.EntityDescsS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [EntityDescriptions] section", token);
            }
    
            return this;
        }
    
        // All entities are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.EntityDescriptions = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new SingleEntityDesc(this, token);
            parser.pushdownStack.push(newState);
        }
    
        addEntityDesc(entityDesc: AST.EntityDesc) {
            this.ast.subsections.push(entityDesc);
            this.ast.entityDescs.set(entityDesc.name, entityDesc);
        }
    }
    
    // [EntityDescriptions] -> [[SomeEntityName]]
    export class SingleEntityDesc extends Section {
        entityDesc: AST.EntityDesc;
        propertyList: PropertyList | null = null;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.entityDesc = new AST.EntityDesc(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Try to get the property list first
            if (!this.propertyList) {
                parseKeyVal(parser, this.entityDesc.properties, propertyLists.baseEntity, new ConsumingArray(tokenLine));
                const entityType = this.entityDesc.properties.get("type");
                if ((entityType instanceof TT.Identifier) && (entityType.literal in propertyLists.entityDesc)) {
                    this.propertyList = propertyLists.entityDesc[entityType.literal as keyof typeof propertyLists.entityDesc];
                }
            }
            else {
                // Parse keys and values
                parseKeyVal(parser, this.entityDesc.properties, this.propertyList, new ConsumingArray(tokenLine));
            }
    
            return this;
        }
    
        onGoUpSection(parser: Parser) {
            const propertyList = this.propertyList ? this.propertyList : propertyLists.baseEntity;
            checkForMissingFields(parser, propertyList, this.entityDesc.properties, this.entityDesc.startLine);
    
            // Add this entity to the parent
            (this.parent as EntityDescs).addEntityDesc(this.entityDesc);
        }
    
        getPropertyList(tokenLine: Token<any>): PropertyList {
            const entityDescType = this.entityDesc.properties.get("type");
            if (entityDescType in propertyLists.entityDesc) {
                return propertyLists.entityDesc[entityDescType as keyof typeof propertyLists.entityDesc];
            }
            else {
                return propertyLists.baseEntity;
            }
        }
    }
    
    // [Entities]
    export class Entities extends Section {
        ast: AST.EntitiesS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.EntitiesS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Entities] section", token);
            }
    
            return this;
        }
    
        // All entities are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);

            parser.ast.sections.Entities = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new SingleEntity(this, token);
            parser.pushdownStack.push(newState);
        }
    
        addEntity(entity: AST.Entity) {
            this.ast.subsections.push(entity);
            this.ast.entities.set(entity.name, entity);
        }
    }
    
    // [Entities] -> [[SomeEntityName]]
    export class SingleEntity extends Section {
        ast: AST.Entity;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.Entity(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const propertyList = propertyLists.entityInst;
    
            // Parse keys and values
            parseKeyVal(parser, this.ast.properties, propertyList, new ConsumingArray(tokenLine));
    
            return this;
        }
    
        // For single entities the only valid sub-header is [[[Script]]]
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            if (token.literal === "Script") {
                return ValidSection.Valid;
            }
            else {
                parser.addTokenError(`Invalid section "${token.literal}", must be "Script"`, token);
                return ValidSection.InvalidCustomError;
            }
        }
    
        onGoUpSection(parser: Parser) {
            checkForMissingFields(parser, propertyLists.entityInst, this.ast.properties, this.ast.startLine);

            // Check for duplicate scripts
            if (this.ast.subsections.length > 1) {
                for (const section of this.ast.subsections) {
                    parser.addTokenError("Duplicate [[[Scripts]]] sections", section.token);
                }
            }
    
            // Add this entity to the parent
            (this.parent as Entities).addEntity(this.ast);
        }
    
        // Go into [[[Script]]]
        goIntoHeader(parser: Parser, token: TT.Section) {
            // Transition to script section
            const newState = new ScriptCollection<AST.Function>(this, token, new AST.EntityScriptsS(token), false, AST.Function);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Scripts]
    export class Scripts extends Section {
        ast: AST.ScriptsS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.ScriptsS(token);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError("Bare tokens are not allowed inside [Scripts] section", token);
            }
    
            return this;
        }
    
        // All entities are assumed valid names
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Valid;
        }
    
        onGoUpSection(parser: Parser) {
            // Mark duplicates
            markDuplicateSections(parser, this.ast.subsections);
            
            parser.ast.sections.Scripts = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        // When we leave this state, use this function to transition to a new state using the stack
        goIntoHeader(parser: Parser, token: TT.Section) {
            const newState = new ScriptCollection<AST.Function>(this, token, new AST.EntityScriptsS(token), false, AST.Function);
            parser.pushdownStack.push(newState);
        }
    }
    
    // [Include]
    export class Include extends Section {
        ast: AST.IncludeS;
    
        constructor(parent: Section, token: TT.Section) {
            super(parent);
    
            this.ast = new AST.IncludeS(token);
        }
    
        onGoUpSection(parser: Parser) {
            parser.ast.sections.Include = this.ast;
            parser.ast.orderedSections.push(this.ast);
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            const sig = parseSignature(
                parser,
                new ConsumingArray(tokenLine),
                [TC.IdentTC],
                [],
                {},
            );
            if (sig) {
                this.ast.files.push(sig.args[0] as Token);
            }
            return this;
        }
    }
    
    // [[[Script]]] or [Scripts] -> [[EntityScripts]] or [Sequences] -> [[EntitySequences]]
    // A collection of scripts assigned to an entity
    export class ScriptCollection<ScriptType extends AST.GeneralScript> extends Section {
        isSequence: boolean;
        token: TT.Section;
        notifySection: string;
        scriptCtor: TC.Constructor<ScriptType>;
    
        constructor(parent: Section, token: TT.Section, ast: AST.ScriptCollection<ScriptType>, isSequence: boolean, scriptCtor: TC.Constructor<ScriptType>) {
            super(parent);
    
            this.token = token;
            this.isSequence = isSequence;
            this.scriptCtor = scriptCtor;
            this.notifySection = isSequence ? "[Sequences] -> [[SequenceSet]]" : "[[[Scripts]]]";
            this.ast = ast;
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Bare tokens aren't allowed
            for (const token of tokenLine) {
                // If it's not already invalid, set the error
                parser.addTokenError(`Bare tokens are not allowed inside ${this.notifySection} section`, token);
            }
    
            return this;
        }
    
        // For single entities the only valid sub-header is [[[[Function]]]]
        // For sequences, any sub-header is valid
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            if (this.isSequence || (token.literal === "Function")) {
                return ValidSection.Valid;
            }
            else {
                parser.addTokenError(`Invalid nested section "${token.literal}", must be "Function"`, token);
                return ValidSection.InvalidCustomError;
            }
        }
    
        onGoUpSection(parser: Parser) {
            // Check for duplicates if this is a sequence holding collection
            if (this.isSequence) {
                markDuplicateSections(parser, this.ast?.subsections as AST.Section[]);
            }
            
            (this.parent as Section).ast?.subsections.push(this.ast as AST.ScriptCollection<ScriptType>);
        }
    
        // Go into [[[[Function]]]] or [[[NamedSequence]]]
        goIntoHeader(parser: Parser, token: TT.Section) {
            let newState;
            if (this.isSequence) {
                newState = new SingleSequence(this, new AST.Sequence(token));
            }
            else {
                newState = new Function(this, new AST.Function(token));
            }
            parser.pushdownStack.push(newState);
        }
    }
    
    // [[[Function]]] or [[[[Function]]]]
    export class Function extends Section {
        ast: AST.Function;
        scriptParent: ScriptCollection<AST.Function>;
        parsedFirstLine: boolean = false;
    
        constructor(parent: ScriptCollection<any>, ast: AST.Function) {
            super(parent);
    
            this.scriptParent = parent;
            this.ast = ast;
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Parse the first line differently, as it must be "cause="
            if (!this.parsedFirstLine) {
                this.parseFirstLine(parser, tokenLine);
                this.parsedFirstLine = true;
            }
            // Parse as a function command
            else {
                const cmd = parseFunctionLine(parser, new ConsumingArray(tokenLine), inFunctionCommandTC, true, false);
                if (cmd) {
                    this.ast.commands.push(cmd);
                }
            }
            return this;
        }
    
        parseFirstLine(parser: Parser, tokenLine: Token<any>[]) {
            const arr = new ConsumingArray(tokenLine);
            let hasError = false;
    
            // Check for "cause"
            const token1 = arr.consume();
            if (token1 instanceof TT.Identifier) {
                // Not equal to "cause"
                if (token1.literal !== "cause") {
                    hasError = true;
                }
            }
            // Not an identifier
            else {
                hasError = true;
            }
    
            // Check for "="
            const token2 = arr.peek();
            if (token2 !== undefined) {
                // Not an equals sign
                if (!(token2 instanceof TT.Equals)) {
                    hasError = true;
                }
                // Skip ahead so the next token is the OnCAUSE identifier
                else {
                    arr.consume();
                }
            }
            // No token
            else {
                hasError = true;
            }
    
            if (hasError) {
                parser.addTokenError("Function cause must start with \"cause=\"", token1);
            }
    
            // Sequence expects a cause
            const cmd = parseFunctionLine(parser, arr, inCauseCommandTC, false, true);
            if (cmd && !hasError) {
                this.ast.cause = cmd;
            }
        }
    
        // No further sections are valid
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Invalid;
        }
    
        onGoUpSection(parser: Parser) {
            // Check this is valid
            if (!this.parsedFirstLine) {
                parser.addTokenError("Incomplete function", this.ast.token);
            }
            (this.scriptParent.ast as AST.ScriptCollection<AST.Function>).scripts.push(this.ast);
            this.scriptParent.ast?.subsections.push(this.ast);
        }
    }
    
    export class SingleSequence extends Section {
        ast: AST.Sequence;
        scriptParent: ScriptCollection<AST.Sequence>;
        parsedFirstLine: boolean = false;
    
        constructor(parent: ScriptCollection<any>, ast: AST.Sequence) {
            super(parent);
    
            this.scriptParent = parent;
            this.ast = ast;
        }
    
        parse(parser: Parser, tokenLine: Token<any>[]): State {
            // Parse the first line differently, as it might be "hash="
            if (!this.parsedFirstLine) {
                const gotoNextLine = this.parseFirstLine(parser, tokenLine);
                this.parsedFirstLine = true;
                if (gotoNextLine) {
                    return this;
                }
            }
    
            // Parse as a function command
            const cmd = parseFunctionLine(parser, new ConsumingArray(tokenLine), inSequenceCommandTC, false, false);
            if (cmd) {
                this.ast.commands.push(cmd);
            }
            return this;
        }
    
        parseFirstLine(parser: Parser, tokenLine: Token<any>[]): boolean {
            // If the line starts with "hash", try to parse as hash, otherwise parse as a function command
            const arr = new ConsumingArray(tokenLine);
            if ((arr.peek() instanceof TT.Identifier) && (arr.peek().literal === "hash")) {
                // Sequence expects a hash
                const sig = parseSignature(
                    parser,
                    arr,
                    [new TC.LiteralTC<string, TT.Identifier>(TC.IdentTC, "hash"), TC.EqualsTC, TC.HashTC],
                    [],
                    {},
                );
                if (sig) {
                    this.ast.hash = sig.args[2] as TT.Hash;
                    return true; // Go to next line
                }
                return true; // Go to next line
            }
            // Otherwise parse it as a function line by returning "false" so we don't go to the next line
            return false;
        }
    
        // No further sections are valid
        isSectionValid(parser: Parser, token: TT.Section): ValidSection {
            return ValidSection.Invalid;
        }
    
        onGoUpSection(parser: Parser) {
            (this.scriptParent.ast as AST.ScriptCollection<AST.Sequence>).scripts.push(this.ast);
            this.scriptParent.ast?.subsections.push(this.ast);
        }
    }
}

const inSequenceCommandTC = TC.EnumIdTC(keywords.inSequenceFns);
const inFunctionCommandTC = TC.EnumIdTC(keywords.outSequenceFns);
const inCauseCommandTC = TC.EnumIdTC(keywords.causes);

function parseFunctionLine(
    parser: Parser,
    tokenLine: ConsumingArray<Token<any>>,
    cmdTypeChecker: TC.TypeChecker<TT.Identifier>,
    useGeneralFunctionFlags: boolean,
    useCauseFlags: boolean)
    : AST.Command | null {

    // Get the first token as the command type
    let cmdType = cmdTypeChecker.check(tokenLine);
    // Invalid command option
    if (TC.resultIsError(cmdType)) {
        parser.addTokenError(cmdType[0].error, cmdType[0].token);
        return null;
    }

    cmdType = cmdType as TT.Identifier;

    let cmdSigArgs;

    // Some commands have different signatures depending on the value of their first enum argument
    if (cmdType.literal in SpecialCommandSignatures) {
        const signatureOptions = SpecialCommandSignatures[cmdType.literal as keyof typeof SpecialCommandSignatures];
        const firstArgEnumTC = TC.EnumIdTC(Object.keys(signatureOptions));

        const res = firstArgEnumTC.check(tokenLine);
        tokenLine.rewind(); // Go back to the enum
        if (TC.resultIsError(res)) {
            cmdSigArgs = { pos: [firstArgEnumTC], allFlags: [], typedFlags: {} };
        }
        else {
            cmdSigArgs = signatureOptions[res.literal as keyof typeof signatureOptions];
        }
    }
    else {
        cmdSigArgs = CommandSignatures[cmdType.literal as keyof typeof CommandSignatures];
    }

    // Check the signature type
    const parsedSig = parseSignature(
        parser,
        tokenLine,
        cmdSigArgs.pos,
        cmdSigArgs.allFlags,
        cmdSigArgs.typedFlags,
        useGeneralFunctionFlags,
        useCauseFlags,
    );
    if (parsedSig) {
        const cmdAST = new AST.Command(cmdType, parsedSig);
        return cmdAST;
    }
    else {
        return null;
    }
}

// ============================================================
//                           Types
// ============================================================

function parseSignature(
    parser: Parser,
    tokenList: ConsumingArray<Token<any>>,
    positional: TC.TypeChecker<any>[],
    allFlagOptions: string[],
    typedFlagOptions: Record<string, [FlagTypes.FlagConstructor<any, any>, TC.TypeChecker<any>]>,
    useGeneralFunctionFlags: boolean = false,
    useCauseFlags: boolean = false,
): AST.Signature | null {
    // Get positional arguments first
    const args: Token<any>[] = [];
    let argsParsed = 0;
    let hasError = false;

    for (let checker of positional) {
        // If we've run out of tokens, this type isn't satisfied
        if (tokenList.done()) {
            parser.addError(`Expected ${positional.length} arguments, but got ${argsParsed}`, parser.lineIdx);
            hasError = true;
            continue;
        }

        ++argsParsed;

        // See if the next token(s) satisfy this type
        const resultType = checker.check(tokenList);

        // If this is null, the type checking failed
        if (TC.resultIsError(resultType)) {
            parser.addTokenError(resultType[0].error, resultType[0].token);
            hasError = true;
            continue;
        }

        args.push(resultType);
    }

    if (hasError) {
        return null;
    }

    // Now get flag arguments
    const flags: Map<string, AST.Flag> = new Map();
    while (!tokenList.done()) {
        const token = tokenList.consume();

        // Add flag arguments to flags
        if (token instanceof TT.Flag) {
            // Check for duplicate flags
            if (flags.has(token.literal)) {
                parser.addTokenError(`Duplicate flag: ${token.lexeme}`, token);
                hasError = true;
                continue;
            }

            let flagOptions = typedFlagOptions[token.literal];

            // If flagOptions doesn't exist, check the general function arguments if specified
            if (!flagOptions && useGeneralFunctionFlags && (token.literal === "AsEntity")) {
                flagOptions = FlagTypes.general.AsEntity;
            }

            // If flagOptions doesn't exist, it could still be possible but with no extra data
            if (!flagOptions) {
                if (allFlagOptions.includes(token.literal)) {
                    flags.set(token.literal, new AST.Flag(token));
                }
                else if (useGeneralFunctionFlags && (token.literal === "ExternalEntity")) {
                    flags.set(token.literal, new AST.Flag(token));
                }
                else if (useCauseFlags && (token.literal === "AllowUnused")) {
                    flags.set(token.literal, new AST.Flag(token));
                }
                else {
                    parser.addTokenError(`Invalid flag: ${token.lexeme}`, token);
                    hasError = true;
                }
                continue;
            }

            if (!tokenList.peek()) {
                parser.addTokenError(`Flag ${token.lexeme} is missing argument`, token);
                hasError = true;
                continue;
            }

            const [ctor, checker] = flagOptions;
            const next = checker.check(tokenList);
            if (TC.resultIsError(next)) {
                parser.addTokenError(`Flag ${token.lexeme} received an incorrect argument: ` + next[0].error, next[0].token);
                hasError = true;
                continue;
            }

            const flag = new ctor(token, next);
            flags.set(token.literal, flag);
        }
        // Otherwise, positional argument when it should be a flag
        else {
            parser.addTokenError(`Too many positional arguments, expected ${positional.length}`, token);
            hasError = true;
        }
    }

    if (hasError) {
        return null;
    }
    // Otherwise it worked
    return new AST.Signature(args, flags);
}

function parseKeyVal(
    parser: Parser,
    existingKeys: Map<string, any>,
    propertyList: PropertyList,
    tokenList: ConsumingArray<Token<any>>
) : boolean {
    let hasError = false;
    let propertyType = null;

    // Keyval must start with identifier
    const identifier = tokenList.consume();
    if (!(identifier instanceof TT.Identifier)) {
        parser.addTokenError(`Invalid token for an identifier \`${identifier.lexeme}\``, identifier);
        hasError = true;
    }
    // See if the identifier is a valid key
    else {
        propertyType = propertyList.getPropertyType(identifier.literal)?.typeChecker;
        // Null property type means the key wasn't found
        if (!propertyType) {
            parser.addTokenError(`Key \`${identifier.literal}\` does not exist`, identifier);
            hasError = true;
        }

        // See if the key already exists
        if (existingKeys.has(identifier.literal)) {
            parser.addTokenError(`Duplicate key \`${identifier.literal}\``, identifier);
            hasError = true;
        }
    }

    // Next there must be an equals sign
    const eq = tokenList.consume();
    if (!(eq instanceof TT.Equals)) {
        parser.addError(`Key-value assignment must have an equals sign`, parser.lineIdx);
        hasError = true;
    }

    // Finally try to parse the actual type
    if (propertyType) {
        const value = propertyType.check(tokenList);
        // Pass errors onwards
        if (TC.resultIsError(value)) {
            for (let err of value) {
                if (err.token) {
                    parser.addTokenError(err.error, err.token);
                }
                else {
                    parser.addError(err.error, parser.lineIdx);
                }
            }
        }

        // If there are any other tokens, we have too many arguments
        while (!tokenList.done()) {
            parser.addTokenError("Too many values", tokenList.consume());
            hasError = true;
        }

        // Finally we know everything works
        if (!hasError) {
            existingKeys.set(identifier.literal, value);
        }
    }

    return hasError;
}

function markDuplicateSections(
    parser: Parser,
    subsections: AST.Section[]
) {
    // Group sections by key
    let nameToSection = new Map<string, AST.Section[]>();
    for (const section of subsections) {
        const sectionName = section.token.literal;
        if (!nameToSection.has(sectionName)) {
            nameToSection.set(sectionName, []);
        }
        nameToSection.get(sectionName)?.push(section);
    }

    // Mark duplicates
    for (const [name, sections] of nameToSection.entries()) {
        if (sections.length > 1) {
            for (const section of sections) {
                parser.addTokenError(`Duplicate section header "${name}"`, section.token, Severity.Warning);
            }
        }
    }
}

function checkForMissingFields(parser: Parser, propertyList: PropertyList, properties: Map<string, any>, startLine: number) {
    // If we are missing properties, return an error
    const missingProperties = [];
    for (const property of propertyList.iterFullProperties()) {
        if (property.required && property.required(properties) && !(properties.has(property.name))) {
            missingProperties.push(property.name);
        }
    }

    if (missingProperties.length === 1) {
        parser.addError(`Missing property: ${missingProperties[0]}`, startLine);
    }
    else if (missingProperties.length > 1) {
        parser.addError(`Missing properties: ${missingProperties}`, startLine);
    }
}

// ============================================================
//                            Parser
// ============================================================

class HeaderCheck {
    static parse(parser: Parser, tokenLine: Token<any>[]): boolean {
        // If we encounter a header, transition to that header's state
        const token = tokenLine[0];

        // See if token is a section header
        if (token instanceof TT.Section) {
            // If the header is unbalanced, don't try to parse it as a section and continue onto next line
            if (!token.balanced) {
                return true; // True means go to next line
            }

            // If we go up a level, pop the states until we reach the right depth
            const stack = parser.pushdownStack;
            const depth = token.depth;

            // Pop to stack if we are lower depth
            if (depth < stack.length) {
                while (stack.length && depth < stack.length) {
                    const prevState = stack.pop() as States.Section;
                    prevState?.onGoUpSection(parser); // Trigger the state to end, where it will change the AST
                }
            }
            // Depth must either increase by exactly one or decrease by any amount
            // If we increase by more than 1, the document is malformed
            else if (depth >= stack.length + 1) {
                parser.addTokenError(
                    `Section header \`${token.lexeme}\` increased depth from ${stack.length-1} to ${depth}, more than the maximum of one depth increase at a time`,
                    token
                );
                return true; // Go to next line
            }

            // Now check that the header is valid for the current state
            switch ((stack.at(-1) as States.Section).isSectionValid(parser, token)) {
                // We finally know that the section header is valid in the given context
                // We ask the current state which state we should transition into
                case ValidSection.Valid:
                    const currState = stack.at(-1) as States.Section;
                    currState.goIntoHeader(parser, token);
                    return true;
                
                // The section is invalid but we use the standard error message
                case ValidSection.Invalid:
                    parser.addTokenError(`Section header \`${token.lexeme}\` is invalid for enclosing section`, token);
                    return true;
                
                // The section is invalid and has already had a custom error message applied, so we don't need to
                case ValidSection.InvalidCustomError:
                    return true;
            }
        }
        // This isn't a section header, so parse using the current pushdown state
        // This means we return false to not go to the next line, and the parser will continue on as normal
        return false;
    }
}

type ParseError = { error: string, line: number, token?: Token<any>, severity: Severity };

export class Parser {
    ast: AST.AST = new AST.AST();
    badLexTokens: Token<any>[] = [];
    errors: ParseError[] = [];
    lineIdx: number = 0;
    tokenIdx: number = 0;
    pushdownStack: States.State[] = [];

    parse(source: string) {
        const lexer = lex(source);

        // Pushdown automata for states
        this.pushdownStack.push(new States.TopLevel());

        // Iterate through lexed text one line at a time
        for (const line of lexer) {
            this.lineIdx = line[0].line;
            this.tokenIdx = 0;

            // First check if we're changing hierarchy levels
            const advanceLine = HeaderCheck.parse(this, line);
            if (advanceLine) continue;

            // Pass any invalid lexing tokens through
            for (const token of line) {
                if ((token instanceof TT.Invalid) || (token.error !== null)) {
                    this.badLexTokens.push(token);
                }
            }

            // Then parse the line using the current state
            this.pushdownStack.at(-1)?.parse(this, line);
        }
        // Pop remaining stack
        while (this.pushdownStack.length) {
            const prevState = this.pushdownStack.pop() as States.Section;
            prevState?.onGoUpSection(this); // Trigger the state to end, where it will change the AST
        }
    }

    // Adds an error assigned to a specific token
    addTokenError(error: string, token: Token<any>, severity: Severity = Severity.Error) {
        this.errors.push({ error, line: token.line, token, severity });
    }

    addError(error: string, line: number, severity: Severity = Severity.Error) {
        this.errors.push({ error, line, severity });
    }

    advanceIndex(count: number) {
        this.tokenIdx += count;
    }

    *yieldErrors(): Generator<ParseError> {
        // First yield straight up invalid tokens
        for (const token of this.badLexTokens) {
            yield { error: token.error as string, line: token.line, token: token, severity: Severity.Error };
        }

        // Then yield other errors
        for (const err of this.errors) {
            yield err;
        }
    }
}
