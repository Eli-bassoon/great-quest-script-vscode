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

// Collision Groups
export const collisionGroups = [
    "TriangleMeshes",
    "Player",
    "NonHostileEntities",
    "HostileEntities",
    "PlayerKicks",
    "PlayerPunches",
    "Flyers",
    "Swimmers",
    "Sensors",
    "Items",
    "Terrain",
    "Climbable",
];
for (var i of ['06', '07', '08', '09', '10', '13', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']) { // Other collision groups
    collisionGroups.push('UnnamedGroup' + i);
}