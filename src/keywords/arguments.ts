export const kcScriptCauseArgs = {
	"OnLevel": [
		"BEGIN",
		"END"
	],
	"OnPlayer": [
		"INTERACT",
		"BUMPS",
		"TARGET_FOR_ATTACK",
		"PICKUP_ITEM"
	],
	"OnActor": [
		"BUMPS",
		"HEAL",
		"DEATH"
	],
	"OnDamage": [
		"FIRE",
		"ICE",
		"MELEE",
		"RANGED",
		"FALL"
	],
	"OnAlarm": [
		"REPEAT",
		"FINISHED"
	],
	"OnDialog": [
		"BEGIN",
		"ADVANCE"
	],
	"OnReceiveNumber": [
		"EQUAL_TO",
		"NOT_EQUAL_TO",
		"LESS_THAN",
		"GREATER_THAN",
		"LESS_THAN_OR_EQUAL_TO",
		"GREATER_THAN_OR_EQUAL_TO"
	],
    "OnReceivePlayerHasItem": [
        "true",
        "false",
    ],
	"OnEntity": [
		"ENTERS_TARGET_WAYPOINT_AREA",
		"LEAVES_TARGET_WAYPOINT_AREA"
	],
	"OnWaypoint": [
		"ENTITY_ENTERS",
		"ENTITY_LEAVES"
	],
};

const axes = ["X", "Y", "Z"];

export const kcScriptFunctionArgs = {
	"SetAxisPosition": axes,
    "AddToAxisPosition": axes,
    "SetAxisRotation": axes,
    "AddToAxisRotation": axes,
    "WaitForAxisRotation": axes,
	"SendNumber": [
		"LITERAL",
		"VARIABLE",
		"RANDOM"
	],
	"SetAiGoal": [
		"FIND",
		"FLEE",
		"WANDER",
		"GUARD",
		"DEAD",
		"SLEEP"
	],
    "SetPlayerHasItem": [
        "true",
        "false",
    ],
	"Attach": [
		"ATTACK_SENSOR",
		"BUMP_SENSOR",
		"LAUNCHER",
		"PARTICLE_EMITTER"
	],
	"Detach": [
		"PARTICLE_EMITTER"
	],
	"ActivateSpecial": [
        "NONE",
		"ENTITIES",
		"TERRAIN",
		"BOTH"
	],
	"SetCameraParam": [
		"PIVOT_DISTANCE",
		"TARGET_OFFSET_X",
		"TARGET_OFFSET_Y",
		"TARGET_OFFSET_Z",
		"PIVOT_OFFSET_X",
		"PIVOT_OFFSET_Y",
		"PIVOT_OFFSET_Z",
		"TRANSITION_DURATION",
		"LOCK_PIVOT_Y"
	],
};

export const kcScriptTriggerEventArgs = [
    'LevelCompleted',
    'BeginScreenFade',
    'EndScreenFade',
    'LockPlayerControl',
    'UnlockPlayerControl',
    'ShakeCameraRand',
    'PlayMidMovie01',
    'PlayMidMovie02',
    'PlayMidMovie03',
    'PlayMidMovie04',
    'PlayMidMovie05',
    'PlayMidMovie06',
    'PlayMidMovie07',
    'PlayMidMovie08',
    'PlayMidMovie09',
    'PlayMidMovie10',
    'LevelLoadComplete',
    'LevelBegin',
    'LevelEnd',
    'LevelUnload',
    'DialogBegin',
    'DialogAdvance',
    'DialogEnd',
    'StartMovie',
    'CutMovie',
    'MovieContinueGame',
    'LevelLoad',
    'LevelUnloadComplete',
    'PlayerAttack',
    'PlayerDamage',
    'PlayerDead',
    'MovieCutFog',
    'ModeAfterMovie',
    'TracePublicEvent',
    'EvStartDemoBGM',
];