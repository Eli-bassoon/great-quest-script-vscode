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
		"LEAVES_TARGET_WAYPOINT_AREA",
		"ENTERS_WAYPOINT_AREA",
		"LEAVES_WAYPOINT_AREA",
	],
	"OnWaypoint": [
		"ENTITY_ENTERS",
		"ENTITY_LEAVES"
	],
};

const axes = ["X", "Y", "Z"];

export const kcScriptItems = [
	"NONE", // 00 / 00
    "STONE_FIRE", // 01 / 01
    "STONE_ICE", // 02 / 02
    "STONE_SPEED", // 03 / 03
    "STONE_SHRINK", // 04 / 04
    "STONE_LIGHTNING", // 05 / 05
    "COIN_G", // 06 / 06
    "COIN_S", // 07 / 07
    "COIN_B", // 08 / 08
    "GEM_D", // 09 / 09
    "GEM_S", // 10 / 0A
    "GEM_R", // 11 / 0B
    "GEM_A", // 12 / 0C
    "DOOR_KEY", // 13 / 0D
    "CHEST_KEY", // 14 / 0E
    "BONE", // 15 / 0F
    "CHECKPOINT", // 16 / 10
    "SEED", // 17 / 11
    "EXTRA_BIN_19", // 18 / 12
    "EXTRA_BIN_20", // 19 / 13

    // Start of bitwise items.
    "MAP_00", // 20 / 14
    "MAP_01", // 21 / 15
    "MAP_02", // 22 / 16
    "MAP_03", // 23 / 17
    "MAP_04", // 24 / 18
    "MAP_05", // 25 / 19
    "MAP_06", // 26 / 1A
    "MAP_07", // 27 / 1B
    "MAP_08", // 28 / 1C
    "MAP_09", // 29 / 1D
    "MAP_10", // 30 / 1E
    "MAP_11", // 31 / 1F
    "MAP_12", // 32 / 20
    "MAP_13", // 33 / 21
    "MAP_14", // 34 / 22
    "MAP_15", // 35 / 23
    "MAP_16", // 36 / 24
    "MAP_17", // 37 / 25
    "MAP_18", // 38 / 26
    "MAP_19", // 39 / 27
    "MAP_20", // 40 / 28
    "MAP_21", // 41 / 29
    "MAP_22", // 42 / 2A
    "MAP_23", // 43 / 2B
    "HONEY_POT", // 44 / 2C
    "ENGINE_ROOM_KEY", // 45 / 2D
    "MAYOR_HOUSE_KEY", // 46 / 2E
    "CLOVER_GATE_KEY", // 47 / 2F
    "CLOVER", // 48 / 30
    "FAKE_CLOVER", // 49 / 31
    "FAIRY_TOWN_KEY_1", // 50 / 32
    "FAIRY_TOWN_KEY_2", // 51 / 33
    "FAIRY_TOWN_KEY_3", // 52 / 34
    "TREE_KEY", // 53 / 35
    "ENGINE_FUEL", // 54 / 36
    "SHRUNK_BONE_CRUSHER", // 55 / 37
    "ENGINE_KEY", // 56 / 38
    "STATUE", // 57 / 39
    "SQUARE_ARTIFACT", // 58 / 3A
    "CIRCLE_ARTIFACT", // 59 / 3B
    "TRIANGLE_ARTIFACT", // 60 / 3C
    "CROWN", // 61 / 3D
    "GRIM_BITE", // 62 / 3E
    "RUBY_SHARD", // 63 / 3F
    "RUBY_SPHERE", // 64 / 40
    "RUBY_TEARDROP" // 65 / 41
];

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
	"Attach": [
		"ATTACK_SENSOR",
		"BUMP_SENSOR",
		"LAUNCHER",
		"PARTICLE_EMITTER"
	],
	"Detach": [
		"PARTICLE_EMITTER"
	],
	"Entity.ActivateSpecial": [
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
	"SendPlayerHasItem": kcScriptItems,
	"SetPlayerHasItem": kcScriptItems,
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