import { TokenTypes as TT, Token } from './tokens';
import * as AST from './ast';
import * as TC from './typechecking';

import * as keywords from '../keywords';

const causeArgs = keywords.args.causes;
const funcArgs = keywords.args.functions;
const funcFlags = keywords.flags.functions;

// Flags that have extra data
// By default, flags are assumed to be standalone
export namespace FlagTypes {
    export interface FlagConstructor<
        U extends Token<any>,
        T extends AST.FlagArg<U>> {
        new(flagToken: TT.Flag, data: U): T;
    }

    export const functions = {
        "SetAnimation": {
            "StartTime": [AST.FlagArg<TT.Int>, TC.NumericTC],
        } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>,

        "SetAlarm": {
            "Repeat": [AST.FlagArg<TT.Int>, TC.MakeBoundIntTC(-1, Infinity)],
        } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>,
    };

    export const sections = {
        "Models": {
            "CreateModelDesc": [AST.FlagArg<TT.String>, TC.StringTC],
        } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>,

        "Textures": {
            "Import": [AST.FlagArg<TT.String>, TC.StringTC],
            "Resize": [AST.FlagArg<TT.ResizeArg>, TC.ResizeTC],
        } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>,

        "SoundEffects": {
            "Priority": [AST.FlagArg<TT.Int>, TC.PosIntTC],
            "Volume": [AST.FlagArg<TT.Int>, TC.PosIntTC],
            "Pan": [AST.FlagArg<TT.Int>, TC.PosIntTC],
            "Pitch": [AST.FlagArg<TT.Int>, TC.PosIntTC],
            "SampleRate": [AST.FlagArg<TT.Int>, TC.PosIntTC],
            "BitDepth": [AST.FlagArg<TT.Int>, new TC.EnumTC(TC.IntTC, [8, 16, 24, 32])],
            "ChannelCount": [AST.FlagArg<TT.Int>, new TC.EnumTC(TC.IntTC, [1, 2])],
            "Import": [AST.FlagArg<TT.String>, TC.StringTC],
        } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>,
    };

    export const general = {
        "AsEntity": [AST.FlagArg<TT.String>, TC.StringTC],
    } satisfies Record<string, [FlagConstructor<any, any>, TC.TypeChecker<any>]>;
}


const varValueRangeTC = TC.MakeBoundIntTC(-32768, 32767); // Variables can take any value from -32768 to 32767
const alarmIdxRangeTC = TC.MakeBoundIntTC(0, 31); // Each entity has alarms numbered 0-31
const varIdxRangeTC = TC.MakeBoundIntTC(0, 7); // Each entity has variables numbered 0-7

const eventOptions = new TC.OrTC([TC.EnumStringTC(keywords.args.events), TC.EnumIdTC(keywords.args.events)]);

export type CommandSignature = { pos: TC.TypeChecker<any>[], allFlags: string[], typedFlags: Record<string, [FlagTypes.FlagConstructor<any, any>, TC.TypeChecker<any>]> }
export const CommandSignatures = {
    // Causes
    "OnLevel": { pos: [TC.EnumIdTC(causeArgs.OnLevel)], allFlags: [], typedFlags: {} },
    "OnPlayer": { pos: [TC.EnumIdTC(causeArgs.OnPlayer)], allFlags: [], typedFlags: {} },
    "OnActor": { pos: [TC.EnumIdTC(causeArgs.OnActor)], allFlags: [], typedFlags: {} },
    "OnDamage": { pos: [TC.EnumIdTC(causeArgs.OnDamage)], allFlags: [], typedFlags: {} },
    "OnAlarm": { pos: [TC.EnumIdTC(causeArgs.OnAlarm), alarmIdxRangeTC], allFlags: [], typedFlags: {} },
    "OnEventTrigger": { pos: [eventOptions], allFlags: [], typedFlags: {} },
    "OnDialog": { pos: [TC.EnumIdTC(causeArgs.OnDialog), TC.StringTC], allFlags: [], typedFlags: {} },
    "OnReceiveNumber": { pos: [TC.EnumIdTC(causeArgs.OnReceiveNumber), varValueRangeTC], allFlags: [], typedFlags: {} },
    "OnReceivePlayerHasItem": { pos: [TC.EnumIdTC(causeArgs.OnReceivePlayerHasItem)], allFlags: [], typedFlags: {} },
    "OnEntity": { pos: [TC.EnumIdTC(causeArgs.OnEntity), TC.StringTC], allFlags: [], typedFlags: {} },
    "OnWaypoint": { pos: [TC.EnumIdTC(causeArgs.OnWaypoint), TC.StringTC], allFlags: [], typedFlags: {} },

    // Functions
    "Entity.Activate": { pos: [], allFlags: [], typedFlags: {} },
	"Entity.Deactivate": { pos: [], allFlags: [], typedFlags: {} },
	"TerminateEntity": { pos: [], allFlags: [], typedFlags: {} },
	"SetFlags": { pos: [], allFlags: funcFlags.SetFlags, typedFlags: {} },
	"ClearFlags": { pos: [], allFlags: funcFlags.SetFlags, typedFlags: {} },
	"InitFlags": { pos: [], allFlags: funcFlags.SetFlags, typedFlags: {} },
	"SetTarget": { pos: [new TC.OrTC([TC.StringTC, new TC.LiteralTC(TC.IdentTC, "null")])], allFlags: [], typedFlags: {} },
	"SetAnimationSpeed": { pos: [TC.PosNumTC], allFlags: [], typedFlags: {} },
	"SetAxisPosition": { pos: [TC.EnumIdTC(funcArgs.SetAxisPosition), TC.NumericTC], allFlags: [], typedFlags: {} },
	"SetPosition": { pos: [TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"AddToAxisPosition": { pos: [TC.EnumIdTC(funcArgs.AddToAxisPosition), TC.NumericTC], allFlags: [], typedFlags: {} },
	"AddPosition": { pos: [TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"SetAxisRotation": { pos: [TC.EnumIdTC(funcArgs.SetAxisRotation), TC.NumericTC], allFlags: [], typedFlags: {} },
	"SetRotation": { pos: [TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"AddToAxisRotation": { pos: [TC.EnumIdTC(funcArgs.AddToAxisRotation), TC.NumericTC], allFlags: [], typedFlags: {} },
	"AddRotation": { pos: [TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"RotateRight": { pos: [TC.NumericTC], allFlags: [], typedFlags: {} },
	"RotateLeft": { pos: [TC.NumericTC], allFlags: [], typedFlags: {} },
	"LookAtTargetEntity": { pos: [], allFlags: [], typedFlags: {} },
	"SetAnimation": { pos: [TC.StringTC, TC.PosNumTC], allFlags: funcFlags.SetAnimation, typedFlags: FlagTypes.functions.SetAnimation },
	"SetSequence": { pos: [TC.StringTC], allFlags: funcFlags.SetSequence, typedFlags: {} },
	"Wait": { pos: [TC.PosNumTC], allFlags: [], typedFlags: {} },
	"WaitForAxisRotation": { pos: [TC.EnumIdTC(funcArgs.WaitForAxisRotation)], allFlags: [], typedFlags: {} },
	"WaitForFullRotation": { pos: [], allFlags: [], typedFlags: {} },
	"WaitForAnimation": { pos: [], allFlags: [], typedFlags: {} },
	"Loop": { pos: [TC.PosIntTC], allFlags: [], typedFlags: {} },
	"Prompt": { pos: [new TC.OrTC([TC.HashTC, TC.StringTC])], allFlags: [], typedFlags: {} },
	"ApplyImpulse": { pos: [TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"ShowDialog": { pos: [TC.StringTC], allFlags: [], typedFlags: {} },
	"SetAlarm": { pos: [alarmIdxRangeTC, TC.PosNumTC], allFlags: [], typedFlags: FlagTypes.functions.SetAlarm },
	"TriggerEvent": { pos: [eventOptions], allFlags: [], typedFlags: {} },
	"PlaySound": { pos: [TC.StringTC], allFlags: [], typedFlags: {} },
	"SetVariable": { pos: [varIdxRangeTC, varValueRangeTC], allFlags: [], typedFlags: {} },
	"AddToVariable": { pos: [varIdxRangeTC, varValueRangeTC], allFlags: [], typedFlags: {} },
	"SendNumber": { pos: [TC.EnumIdTC(funcArgs.SendNumber), varValueRangeTC], allFlags: [], typedFlags: {} },
	"SpawnParticleEffect": { pos: [TC.StringTC], allFlags: [], typedFlags: {} },
	"KillParticleEffect": { pos: [], allFlags: [], typedFlags: {} },
	"SendPlayerHasItem": { pos: [TC.EnumIdTC(funcArgs.SendPlayerHasItem)], allFlags: [], typedFlags: {} },
	"SetPlayerHasItem": { pos: [TC.EnumIdTC(funcArgs.SetPlayerHasItem), TC.BoolTC], allFlags: [], typedFlags: {} },
	"TakeDamage": { pos: [TC.IntTC], allFlags: funcFlags.TakeDamage, typedFlags: {} },
	"SetSavePoint": { pos: [TC.PosIntTC, TC.NumericTC, TC.NumericTC, TC.NumericTC], allFlags: [], typedFlags: {} },
	"Entity.EnableUpdates": { pos: [], allFlags: [], typedFlags: {} },
	"Entity.DisableUpdates": { pos: [], allFlags: [], typedFlags: {} },
	"SetUpdatesEnabled": { pos: [TC.BoolTC], allFlags: [], typedFlags: {} },
	"SetAIGoal": { pos: [TC.EnumIdTC(funcArgs.SetAIGoal)], allFlags: [], typedFlags: {} },
	"AttachSensor": { pos: [TC.StringTC, TC.PosNumTC], allFlags: keywords.flags.collisionGroups, typedFlags: {} },
	"Attach": { pos: [TC.EnumIdTC(funcArgs.Attach), TC.StringTC, TC.PosNumTC], allFlags: keywords.flags.collisionGroups, typedFlags: {} },
	"Detach": { pos: [TC.EnumIdTC(funcArgs.Detach), TC.StringTC], allFlags: [], typedFlags: {} },
	"Entity.ActivateSpecial": { pos: [TC.EnumIdTC(funcArgs['Entity.ActivateSpecial']), TC.BoolTC], allFlags: [], typedFlags: {} },
	"ActivateCamera": { pos: [TC.PosNumTC], allFlags: [], typedFlags: {} },
	"DeactivateCamera": { pos: [TC.PosNumTC], allFlags: [], typedFlags: {} },
	"SetCameraTarget": { pos: [TC.StringTC], allFlags: [], typedFlags: {} },
	"SetCameraPivot": { pos: [TC.StringTC], allFlags: [], typedFlags: {} },
	"SetCameraParam": { pos: [TC.EnumIdTC(funcArgs.SetCameraParam), TC.NumericTC], allFlags: [], typedFlags: {} },
};

const attachSig1 = { pos: [TC.EnumIdTC(funcArgs.Attach), TC.StringTC, TC.PosNumTC], allFlags: keywords.flags.collisionGroups, typedFlags: {} };
const attachSig2 = { pos: [TC.EnumIdTC(funcArgs.Attach), TC.StringTC, TC.StringTC], allFlags: [], typedFlags: {} };

const onEntitySig1 = { pos: [TC.EnumIdTC(causeArgs.OnEntity), TC.StringTC], allFlags: [], typedFlags: {} };
const onEntitySig2 = { pos: [TC.EnumIdTC(causeArgs.OnEntity)], allFlags: [], typedFlags: {} };

// Command signatures that depend on the first argument
export const SpecialCommandSignatures = {
	Attach: {
		ATTACK_SENSOR: attachSig1,
		BUMP_SENSOR: attachSig1,
		LAUNCHER: attachSig2,
		PARTICLE_EMITTER: attachSig2,
	},
	OnEntity: {
		ENTERS_WAYPOINT_AREA: onEntitySig1,
		LEAVES_WAYPOINT_AREA: onEntitySig1,
		ENTERS_TARGET_WAYPOINT_AREA: onEntitySig2,
		LEAVES_TARGET_WAYPOINT_AREA: onEntitySig2,
	}
};