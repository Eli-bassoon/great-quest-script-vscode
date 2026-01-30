export const entityFlags = [
    "Hide",
    "UnusedBitFlag01",
    "ForceStayActive",
    "FaceTargetEntity",
    "HideShadow",
    "AllowWaypointInteraction",
    "Active",
    "EnableTerrainTracking",
    "DisableAI",
    "EnableCollision",
    "EnablePhysics",
    "CanTakeDamage",
    "UnusedBitFlag11",
    "UnusedBitFlag12",
    "PlayerCanInteract",
    "ResetEntity",
    "UpdatesEnabled",
    "PreventDeath",
];

export const kcScriptFunctionFlags = {
    "SetFlags": entityFlags,
    "ClearFlags": entityFlags,
    "InitFlags": entityFlags,
    "SetSequence": [
        "IgnoreIfAlreadyActive",
        "OpenBoneChannel",
    ],
    "SetAnimation": [
        "Repeat",
        "Reverse",
        "ReverseOnComplete",
        "StartTime",
    ],
    "TakeDamage": [
        "Fire",
        "Ice",
        "Melee",
        "Ranged",
        "Fall",
    ],
    "SetAlarm": [
        "Repeat",
    ],
};

export const gqsSectionFlags = {
    "Models": [
        "CreateModelDesc",
    ],
    "Textures": [
        "Import",
        "Resize",
        "Delete",
    ],
    "SoundEffects": [
        "Music",
        "VoiceClip",
        "Repeat",
        "Priority",
        "Volume",
        "Pan",
        "Pitch",
        "SampleRate",
        "BitDepth",
        "ChannelCount",
        "Embedded",
        "Stream",
        "Import",
    ],
};

export const kcScriptGeneralFlags = [
    "AsEntity",
    "ExternalEntity",
];
