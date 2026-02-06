import * as keywords from './keywords';
import * as doctext from './doctext';

type GQSProperty = {
    name: string,
    options: string[],
}

export class PropertyList {
    parent: PropertyList | null = null;
    properties: GQSProperty[] = [];
    id: string = "";
    propertyNames: string[] = [];
    propertyMap: Map<string, GQSProperty> = new Map();
    keysDocs: object = {};

    constructor(id: string, parent: PropertyList | null, properties: GQSProperty[]) {
        this.id = id;
        this.parent = parent;
        this.properties = properties;

        // Construct property names
        this.propertyNames = this.properties.map((e) => e.name);

        // Construct property map
        for (let keyval of this.properties) {
            this.propertyMap.set(keyval.name, keyval);
        }

        // Construct key documentation map
        if (id in doctext.entityDescs) {
            this.keysDocs = doctext.entityDescs[id as keyof typeof doctext.entityDescs];
        }
    }

    getProperties(): string[] {
        // Provide properties, then walk parent for all properties
        var _propertyNames: string[] = [];

        var curr: PropertyList | null = this;
        while (curr) {
            _propertyNames = _propertyNames.concat(curr.propertyNames);
            curr = curr.parent;
        }
        return _propertyNames;
    }

    getEnumOptions(key: string): string[] {
        // Look in this map for key, then look in parents
        var res: GQSProperty | undefined;
        var curr: PropertyList | null = this;
        while (curr) {
            res = curr.propertyMap.get(key);
            if (res !== undefined) {
                return res.options;
            }
            curr = curr.parent;
        }

        // We didn't get any result
        return [];
    }

    getPropertyDocs(key: string): string {
        // Look in this map for docs, then look in parents
        var curr: PropertyList | null = this;
        while (curr) {
            if (key in curr.keysDocs) {
                return curr.keysDocs[key as keyof typeof curr.keysDocs];
            }
            curr = curr.parent;
        }

        // We didn't get any result
        return "";
    }
}

/*
Entity Descriptions

Entity
 ->ParticleEmitter
 ->Waypoint
 ->ActorBase
  ->Prop
  ->Actor
   ->Character
  ->Item
   ->Coin
   ->Gem
   ->Honeypot
   ->MagicStone
   ->ObjKey
   ->UniqueItem

*/

const boolOptions = ['true', 'false'];

const entityPL = new PropertyList(
    "ENTITY",
    null,
    [
        { name: 'type', options: ["CHARACTER", "PROP", "PARTICLE_EMITTER", "WAYPOINT", "ACTOR", "ACTOR_BASE", "COIN", "GEM", "HONEY_POT", "ITEM", "MAGIC_STONE", "OBJ_KEY", "UNIQUE_ITEM"] },
        { name: 'defaultFlags', options: keywords.flags.entity },
        { name: 'boundingSpherePos', options: [] },
        { name: 'boundingSphereRadius', options: [] },
    ]
);

const blendModes = [
    "ZERO",
    "ONE",
    "SRC_COLOR",
    "INV_SRC_COLOR",
    "SRC_ALPHA",
    "INV_SRC_ALPHA",
    "DEST_ALPHA",
    "INV_DEST_ALPHA,",
    "DEST_COLOR",
    "INV_DEST_COLOR",
    "SRC_ALPHA_SAT",
    "BOTH_SRC_ALPHA",
    "BOTH_INV_SRC_ALPHA",
];

const particleEmitterPL = new PropertyList(
    "PROPERTY_LIST",
    entityPL,
    [
        { name: 'srcBlend', options: blendModes },
        { name: 'dstBlend', options: blendModes },
        { name: 'texture', options: [] },
        { name: 'lifetime', options: [] },
    ]
);

const waypointPL = new PropertyList(
    "WAYPOINT",
    entityPL,
    [
        { name: 'waypointType', options: ["BOUNDING_SPHERE", "BOUNDING_BOX", "APPLY_WATER_CURRENT"] },
        { name: 'prevWaypoint', options: [] },
        { name: 'nextWaypoint', options: [] },
        { name: 'boundingBoxDimensions', options: [] },
        { name: 'strength', options: [] },
    ]
);

const actorBasePL = new PropertyList(
    "ACTOR_BASE",
    entityPL,
    [
        { name: 'modelDesc', options: [] },
        { name: 'proxyDesc', options: [] },
        { name: 'skeleton', options: [] },
        { name: 'channelCount', options: [] },
        { name: 'animationSet', options: [] },
        { name: 'actionSequenceTable', options: [] },
    ]
);

const propPL = new PropertyList(
    "PROP",
    actorBasePL,
    []
);

const actorPL = new PropertyList(
    "ACTOR",
    actorBasePL,
    [
        { name: 'maxHealth', options: [] },
        { name: 'startHealth', options: [] },
        { name: 'immuneMask', options: keywords.flags.functions.TakeDamage },
        { name: 'invincibleDurationLimitMs', options: [] },
    ]
);

const characterPL = new PropertyList(
    "CHARACTER",
    actorPL,
    [
        { name: 'characterType', options: ["PLAYER", "STATIC", "WALKER", "FLYER", "SWIMMER"] },
        { name: 'weaponMask', options: keywords.flags.functions.TakeDamage },
        { name: 'aggressionTimer', options: [] },
        { name: 'aiMeleeDamage', options: [] },
        { name: 'attackGoalPercent', options: [] },
        { name: 'attackStrength', options: [] },
        { name: 'flyOrSwimSpeed', options: [] },
        { name: 'avoidWater', options: boolOptions },
        { name: 'homePos', options: [] },
        { name: 'visionRange', options: [] },
        { name: 'visionFov', options: [] },
        { name: 'hearRange', options: [] },
        { name: 'attackRange', options: [] },
        { name: 'meleeRange', options: [] },
        { name: 'missileRange', options: [] },
        { name: 'monsterGroup', options: [] },
        { name: 'fleePercent', options: [] },
        { name: 'tauntPercent', options: [] },
        { name: 'wanderGoalPercent', options: [] },
        { name: 'preferRanged', options: boolOptions },
        { name: 'recoverySpeed', options: [] },
        { name: 'meleeAttackSpeed', options: [] },
        { name: 'rangedAttackSpeed', options: [] },
        { name: 'preferRun', options: boolOptions },
        { name: 'protectLike', options: [] },
        { name: 'homeRange', options: [] },
        { name: 'activationRange', options: [] },
        { name: 'climbHeight', options: [] },
        { name: 'fallHeight', options: [] },
        { name: 'aiRangeDamage', options: [] },
        { name: 'closeDistance', options: [] },
        { name: 'defendRange', options: [] },
        { name: 'dodgePercent', options: [] },
        { name: 'guardHome', options: [] },
        { name: 'huntRange', options: [] },
        { name: 'sleepGoalPercent', options: [] },
    ]
);

const itemPL = new PropertyList(
    "ITEM",
    actorBasePL,
    []
);

const uniqueItemPL = new PropertyList(
    "UNIQUE_ITEM",
    itemPL,
    [] // Maybe I will add the actual items
);

const coinPL = new PropertyList(
    "COIN",
    itemPL,
    [
        { name: 'coinType', options: ["COPPER", "SILVER", "GOLD"] },
    ]
);

const gemPL = new PropertyList(
    "GEM",
    itemPL,
    [
        { name: 'gemType', options: ["AMETHYST", "RUBY", "DIAMOND", "SAPPHIRE"] },
    ]
);

const honeypotPL = new PropertyList(
    "HONEY_POT",
    itemPL,
    []
);

const magicStonePL = new PropertyList(
    "MAGIC_STONE",
    itemPL,
    [
        { name: 'stoneType', options: ["FIRE", "ICE", "SPEED", "SHRINK"] },
    ]
);

const objKeyPL = new PropertyList(
    "OBJ_KEY",
    itemPL,
    [
        { name: 'keyType', options: ["DOOR", "CHEST", "SLICK_WILLY", "CLOVER_GATE", "FAIRY_TOWN_A", "FAIRY_TOWN_B", "FAIRY_TOWN_C", "TREE_OF_KNOWLEDGE", "ENGINE_ROOM"] },
    ]
);

// Collision
const collisionPL = new PropertyList(
    "COLLISION",
    null,
    [
        { name: 'type', options: ['CAPSULE'] }, // TODO triangle meshes
        { name: 'reaction', options: ['SLIDE', 'PENETRATE', 'HALT'] },
        { name: 'collisionGroups', options: keywords.flags.collisionGroups },
        { name: 'collideWith', options: keywords.flags.collisionGroups },
        { name: 'radius', options: [] },
        { name: 'height', options: [] },
        { name: 'offset', options: [] },
    ]
);

// Entity Instance
const entityInstPL = new PropertyList(
    "ENTITY_INSTANCE",
    null,
    [
        { name: 'description', options: [] },
        { name: 'priority', options: [] },
        { name: 'targetEntity', options: [] },
        { name: 'flags', options: keywords.flags.entity },
        { name: 'billboardAxis', options: ["X", "Y", "Z"] },
        { name: 'position', options: [] },
        { name: 'rotation', options: [] },
        { name: 'scale', options: [] },
    ]
);

// Launcher
const launcherInstPL = new PropertyList(
    "LAUNCHER",
    null,
    [
        { name: 'projectileModel', options: [] },
        { name: 'cruiseParticleEffect', options: [] },
        { name: 'hitParticleEffect', options: [] },
        { name: 'projectileLifeTime', options: [] },
        { name: 'projectileSpeed', options: [] },
    ]
);

export const propertyLists = {
    collision: collisionPL,
    entityInst: entityInstPL,
    launcher: launcherInstPL,
    baseEntity: entityPL,
    entityDesc: {
        PARTICLE_EMITTER: particleEmitterPL,
        WAYPOINT: waypointPL,
        ACTOR_BASE: actorBasePL,
        PROP: propPL,
        ACTOR: actorPL,
        CHARACTER: characterPL,
        ITEM: itemPL,
        UNIQUE_ITEM: uniqueItemPL,
        COIN: coinPL,
        GEM: gemPL,
        HONEY_POT: honeypotPL,
        MAGIC_STONE: magicStonePL,
        OBJ_KEY: objKeyPL,
    },
};