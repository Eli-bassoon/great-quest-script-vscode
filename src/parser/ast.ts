import { TokenTypes as TT, Token } from './tokens';
import * as TypeChecking from './typechecking';

// Structure of the document
export class AST {
    sections: {
        Models: ModelsS | null;
        Textures: TexturesS | null;
        SoundEffects: SoundEffectsS | null;
        CopyResources: CopyResourcesS | null;
        DeleteResources: DeleteResourcesS | null;
        Animations: AnimationsS | null;
        Sequences: SequencesS | null;
        Dialog: DialogS | null;
        Collision: CollisionS | null;
        Launchers: LaunchersS | null;
        EntityDescriptions: EntityDescsS | null;
        Entities: EntitiesS | null;
        Scripts: ScriptsS | null;
        Include: IncludeS | null;
    };
    orderedSections: Section[] = [];

    constructor() {
        this.sections = {
            Models: null,
            Textures: null,
            SoundEffects: null,
            CopyResources: null,
            DeleteResources: null,
            Animations: null,
            Sequences: null,
            Dialog: null,
            Collision: null,
            Launchers: null,
            EntityDescriptions: null,
            Entities: null,
            Scripts: null,
            Include: null,
        };
    }
}

// Abstract syntax tree node
export abstract class Node {
    startLine: number = 0;
    startChar: number = 0;
    endLine: number = 0;
    endChar: number = 0;
    error: string | null = null;
}

export class Section extends Node {
    token: TT.Section;
    subsections: Section[] = [];

    constructor(token: TT.Section) {
        super();

        this.token = token;
        this.startLine = token.line;
    }
}

export class PropertyS extends Section {
    name: string;
    properties: Map<string, any> = new Map();

    constructor(token: TT.Section) {
        super(token);

        this.name = token.literal;
    }
}

// [Models]
export class ModelsS extends Section {
    models: Model[] = [];
}

export class Model extends Node {
    file: TT.Identifier;
    modelDesc?: TT.String;

    constructor(sig: Signature) {
        super();

        this.file = sig.args[0] as TT.Identifier;
        this.modelDesc = castFlag<FlagArg<TT.String>>("CreateModelDesc", sig.flags)?.data;
    }
}

// [Textures]
export class TexturesS extends Section {
    textures: Texture[] = [];
}

export class Texture extends Node {
    file: TT.Identifier;
    importedFile?: TT.Identifier;
    resizeShape?: TT.ResizeArg;
    deleteThis: boolean;

    constructor(sig: Signature) {
        super();

        this.file = sig.args[0] as TT.Identifier;
        this.importedFile = castFlag<FlagArg<TT.String>>("Import", sig.flags)?.data;
        this.resizeShape = castFlag<FlagArg<TT.ResizeArg>>("Resize", sig.flags)?.data;
        this.deleteThis = castFlag<Flag>("Import", sig.flags) !== undefined;
    }
}

// [SoundEffects]
export class SoundEffectsS extends Section {
    soundEffects: SoundEffect[] = [];
}

export class SoundEffect extends Node {
    file: TT.Identifier;
    importedFile?: TT.Identifier;
    priority?: TT.Int;
    volume?: TT.Int;
    pan?: TT.Int;
    pitch?: TT.Int;
    sampleRate?: TT.Int;
    bitDepth?: TT.Int;
    channelCount?: TT.Int;
    isMusic: boolean;
    isVoiceClip: boolean;
    isRepeat: boolean;
    isEmbedded: boolean;
    isStreamed: boolean;

    constructor(sig: Signature) {
        super();

        this.file = sig.args[0] as TT.Identifier;
        this.importedFile = castFlag<FlagArg<TT.String>>("Import", sig.flags)?.data;
        this.priority = castFlag<FlagArg<TT.Int>>("Priority", sig.flags)?.data;
        this.volume = castFlag<FlagArg<TT.Int>>("Volume", sig.flags)?.data;
        this.pan = castFlag<FlagArg<TT.Int>>("Pan", sig.flags)?.data;
        this.pitch = castFlag<FlagArg<TT.Int>>("Pitch", sig.flags)?.data;
        this.sampleRate = castFlag<FlagArg<TT.Int>>("SampleRate", sig.flags)?.data;
        this.bitDepth = castFlag<FlagArg<TT.Int>>("BitDepth", sig.flags)?.data;
        this.channelCount = castFlag<FlagArg<TT.Int>>("ChannelCount", sig.flags)?.data;
        this.isMusic = castFlag<Flag>("Music", sig.flags) !== undefined;
        this.isVoiceClip = castFlag<Flag>("VoiceClip", sig.flags) !== undefined;
        this.isRepeat = castFlag<Flag>("Repeat", sig.flags) !== undefined;
        this.isEmbedded = castFlag<Flag>("Embedded", sig.flags) !== undefined;
        this.isStreamed = castFlag<Flag>("Stream", sig.flags) !== undefined;
    }
}

// [CopyResources]
export class CopyResourcesS extends Section {}

export class CopyResourcesFile extends Section {
    resources: TT.Identifier[] = [];
}

// [DeleteResources]
export class DeleteResourcesS extends Section {
    resources: TT.Identifier[] = [];
}

// [Animations]
export class AnimationsS extends Section {}

export class Animation extends Section {
    animations: TT.Identifier[] = [];
}

// [Sequences]
export class SequencesS extends Section {}

export class EntitySequencesS extends Section implements ScriptCollection<Sequence> {
    name: string;
    scripts: Sequence[] = [];

    constructor(token: TT.Section) {
        super(token);

        this.name = token.literal;
    }
}

// [Dialog]
export class DialogS extends Section {
    dialogs: Map<string, string> = new Map();
}

// [Collision]
export class CollisionS extends Section {}
export class CollisionProxy extends PropertyS {}

// [Launchers]
export class LaunchersS extends Section {}
export class Launcher extends PropertyS {}

// [Scripts]
export class ScriptsS extends Section {}

export class EntityScriptsS extends Section implements ScriptCollection<Function> {
    name: string;
    scripts: Function[] = [];

    constructor(token: TT.Section) {
        super(token);

        this.name = token.literal;
    }
}

// [Include]
export class IncludeS extends Section {
    files: TT.Identifier[] = [];
}

// [EntityDescriptions]
export class EntityDescsS extends Section {
    entityDescs: Map<string, EntityDesc> = new Map();
}

export class EntityDesc extends PropertyS {}

// [Entities]
export class EntitiesS extends Section {
    entities: Map<string, Entity> = new Map();
}

export class Entity extends PropertyS implements ScriptCollection<Function> {
    scripts: Function[] = [];
}

// Various script ASTs
export class Function extends Section implements GeneralScript {
    cause: Command | null = null;
    commands: Command[] = [];
    isSequence: boolean = false;
}

export class Sequence extends Section implements GeneralScript {
    hash: TT.Hash | null = null;
    commands: Command[] = [];
    isSequence: boolean = true;
}

export interface GeneralScript extends Section {
    commands: Command[];
    isSequence: boolean;
}

export interface ScriptCollection<ScriptType extends GeneralScript> extends Section {
    scripts: ScriptType[];
}

export class KeyVal extends Node {
    keyToken: TT.Identifier;
    args: Signature;

    constructor(keyToken: TT.Identifier, args: Signature) {
        super();

        this.keyToken = keyToken;
        this.args = args;
    }
}

export class Command extends Node {
    commandToken: TT.Identifier;
    args: Signature;

    constructor(commandToken: TT.Identifier, args: Signature) {
        super();

        this.commandToken = commandToken;
        this.args = args;
    }
}

// Some data which has a specific type signature
export class Signature extends Node {
    args: Token<any>[];
    flags: Map<string, Flag>;

    constructor(args: Token<any>[], flags: Map<string, Flag>) {
        super();

        this.args = args;
        this.flags = flags;
    }
}

export class Flag extends Node {
    flagToken: TT.Flag;
    flagName: string;

    constructor(token: TT.Flag) {
        super();
        this.flagToken = token;
        this.flagName = token.literal;
    }
}

// A flag and the arguments after
export class FlagArg<T> extends Flag {
    data: T;

    static checker: TypeChecking.TypeChecker<any>;

    constructor(token: TT.Flag, data: T) {
        super(token);
        this.data = data;
    }
}

function castFlag<T>(flagName: string, flags: Map<string, Flag>): T | undefined {
    const flagValue = flags.get(flagName);
    if (flagValue) {
        return flagValue as T;
    }
    return undefined;
}