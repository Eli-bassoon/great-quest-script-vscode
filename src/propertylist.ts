import * as keywords from './keywords';
import * as doctext from './doctext';
import * as TC from './parser/typechecking';
import { TokenTypes as TT, Token, TokenTypes } from './parser/tokens';

const TTC = TC.TokenTC;
const ATC = TC.ArrayTC;
const VATC = TC.VarArrayTC;
const ETC = TC.EnumTC;

type GQSProperty = {
    name: string,
    options: string[],
    typeChecker?: TC.TypeChecker<any>,
    required?: (properties: Map<string, any>) => boolean,
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
            // Populate the type checker for enum types
            if (keyval.options && (keyval.typeChecker === undefined)) {
                keyval.typeChecker = new ETC(TC.IdentTC, keyval.options);
            }
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

    *iterFullProperties(): Generator<GQSProperty> {
        // Provide properties, then walk parent for all properties
        var curr: PropertyList | null = this;
        while (curr) {
            for (const property of curr.propertyMap.values()) {
                yield property;
            }
            curr = curr.parent;
        }
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

    getPropertyType(key: string): GQSProperty | null {
        // Look in this map for key, then look in parents
        var res: GQSProperty | undefined;
        var curr: PropertyList | null = this;
        while (curr) {
            res = curr.propertyMap.get(key);
            if (res !== undefined) {
                return res;
            }
            curr = curr.parent;
        }

        // We didn't get any result
        return null;
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

const alwaysTrue = (_: any) => true;
const boolOptions = ['true', 'false'];

const entityPL = new PropertyList(
    "ENTITY",
    null,
    [
        { name: 'type', options: ["CHARACTER", "PROP", "PARTICLE_EMITTER", "WAYPOINT", "ACTOR", "ACTOR_BASE", "COIN", "GEM", "HONEY_POT", "ITEM", "MAGIC_STONE", "OBJ_KEY", "UNIQUE_ITEM"], required: alwaysTrue },
        { name: 'defaultFlags', options: keywords.flags.entity, typeChecker: TC.VarArrEnumTC(keywords.flags.entity), required: alwaysTrue },
        { name: 'boundingSpherePos', options: [], typeChecker: TC.Vector3TC },
        { name: 'boundingSphereRadius', options: [], typeChecker: TC.PosNumTC },
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
        { name: 'texture', options: [], typeChecker: TC.IdentTC },
        { name: 'lifeTime', options: [], typeChecker: new TC.OrTC([TC.MakeBoundNumTC(-1, -1), TC.MakeBoundNumExTC(0, 60)]) }, // Range: {-1} U (0, 60)
        { name: 'burstMode', options: [], typeChecker: TC.IntTC },
        { name: 'emitAngle', options: [], typeChecker: TC.NumericTC },
        { name: 'emitAngleVariance', options: [], typeChecker: TC.NumericTC },
        { name: 'partPerSecond', options: [], typeChecker: TC.IntTC },
        { name: 'speed', options: [], typeChecker: TC.NumericTC },
        { name: 'speedVariance', options: [], typeChecker: TC.NumericTC },
        { name: 'lifeVariance', options: [], typeChecker: TC.NumericTC },
        { name: 'sizeBegin', options: [], typeChecker: TC.NumericTC },
        { name: 'sizeEnd', options: [], typeChecker: TC.NumericTC },
        { name: 'sizeVariance', options: [], typeChecker: TC.NumericTC },
        { name: 'colorBegin', options: [], typeChecker: TC.IntTC },
        { name: 'colorEnd', options: [], typeChecker: TC.IntTC },
        { name: 'colorVariance', options: [], typeChecker: TC.IntTC },
        { name: 'gravityBegin', options: [], typeChecker: TC.Vector4TC },
        { name: 'gravityEnd', options: [], typeChecker: TC.Vector4TC },
        { name: 'gravityVariance', options: [], typeChecker: TC.NumericTC },
        { name: 'lineLeft', options: [], typeChecker: TC.MakeBoundNumTC(0, 20) },
        { name: 'lineRight', options: [], typeChecker: TC.MakeBoundNumTC(0, 20) },
        { name: 'orientation', options: [], typeChecker: TC.NumericTC },
    ]
);

const waypointPL = new PropertyList(
    "WAYPOINT",
    entityPL,
    [
        { name: 'waypointType', options: ["BOUNDING_SPHERE", "BOUNDING_BOX", "APPLY_WATER_CURRENT"], required: alwaysTrue },
        { name: 'prevWaypoint', options: [], typeChecker: TC.IdentTC },
        { name: 'nextWaypoint', options: [], typeChecker: TC.IdentTC },
        { name: 'boundingBoxDimensions', options: [], typeChecker: TC.Vector3TC, required: (properties) => properties.get("waypointType") === "BOUNDING_BOX" },
        { name: 'strength', options: [], typeChecker: TC.PosNumTC, required: (properties) => properties.get("waypointType") === "APPLY_WATER_CURRENT" },
    ]
);

const actorBasePL = new PropertyList(
    "ACTOR_BASE",
    entityPL,
    [
        { name: 'modelDesc', options: [], typeChecker: TC.IdentTC },
        { name: 'proxyDesc', options: [], typeChecker: TC.IdentTC },
        { name: 'skeleton', options: [], typeChecker: TC.IdentTC },
        { name: 'channelCount', options: [], typeChecker: TC.PosIntTC },
        { name: 'animationSet', options: [], typeChecker: TC.IdentTC },
        { name: 'actionSequenceTable', options: [], typeChecker: TC.IdentTC },
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
        { name: 'maxHealth', options: [], typeChecker: TC.PosIntTC },
        { name: 'startHealth', options: [], typeChecker: TC.PosIntTC },
        { name: 'immuneMask', options: keywords.flags.functions.TakeDamage, typeChecker: TC.VarArrEnumTC(keywords.flags.functions.TakeDamage) },
        { name: 'invincibleDurationLimitMs', options: [], typeChecker: TC.PosIntTC },
    ]
);

const characterPL = new PropertyList(
    "CHARACTER",
    actorPL,
    [
        { name: 'characterType', options: ["PLAYER", "STATIC", "WALKER", "FLYER", "SWIMMER"], required: alwaysTrue },
        { name: 'weaponMask', options: keywords.flags.functions.TakeDamage, typeChecker: TC.VarArrEnumTC(keywords.flags.functions.TakeDamage), required: alwaysTrue },
        { name: 'aggressionTimer', options: [], typeChecker: TC.MakeBoundIntTC(0, 255), required: alwaysTrue },
        { name: 'aiMeleeDamage', options: [], typeChecker: TC.PosIntTC, required: alwaysTrue },
        { name: 'attackGoalPercent', options: [], typeChecker: TC.PercentTC, required: alwaysTrue },
        { name: 'attackStrength', options: [], typeChecker: TC.PosIntTC },
        { name: 'flyOrSwimSpeed', options: [], typeChecker: TC.PosIntTC, required: (properties) => (properties.get("characterType")?.literal === "SWIMMER" || properties.get("characterType")?.literal === "FLYER") },
        { name: 'avoidWater', options: boolOptions, required: (properties) => (properties.get("characterType")?.literal === "FLYER") },
        { name: 'homePos', options: [], typeChecker: TC.Vector4TC },
        { name: 'visionRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'visionFov', options: [], typeChecker: TC.PosNumTC },
        { name: 'hearRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'attackRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'meleeRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'missileRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'monsterGroup', options: [], typeChecker: TC.PosIntTC },
        { name: 'fleePercent', options: [], typeChecker: TC.PercentTC },
        { name: 'tauntPercent', options: [], typeChecker: TC.PercentTC },
        { name: 'wanderGoalPercent', options: [], typeChecker: TC.PercentTC },
        { name: 'preferRanged', options: boolOptions },
        { name: 'recoverySpeed', options: [], typeChecker: TC.PosIntTC },
        { name: 'meleeAttackSpeed', options: [], typeChecker: TC.PosIntTC },
        { name: 'rangedAttackSpeed', options: [], typeChecker: TC.PosIntTC },
        { name: 'preferRun', options: boolOptions },
        { name: 'protectLike', options: [], typeChecker: TC.IntTC },
        { name: 'homeRange', options: [], typeChecker: TC.NumericTC },
        { name: 'activationRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'climbHeight', options: [], typeChecker: TC.NumericTC },
        { name: 'fallHeight', options: [], typeChecker: TC.NumericTC },
        { name: 'aiRangeDamage', options: [], typeChecker: TC.NumericTC },
        { name: 'closeDistance', options: [], typeChecker: TC.NumericTC },
        { name: 'defendRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'dodgePercent', options: [], typeChecker: TC.PercentTC },
        { name: 'guardHome', options: [], typeChecker: TC.IntTC },
        { name: 'huntRange', options: [], typeChecker: TC.PosNumTC },
        { name: 'sleepGoalPercent', options: [], typeChecker: TC.PercentTC },
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
    [
        { name: 'itemType', options: ["BONE", "SEED", "CLOVER", "FAKE_CLOVER", "ENGINE_FUEL", "TEMPLE_STATUE", "SQUARE_ARTIFACT", "CIRCLE_ARTIFACT", "TRIANGLE_ARTIFACT", "BONE_CRUNCHER_STATUE", "CROWN", "RUBY_SHARD", "RUBY_SPHERE", "RUBY_TEARDROP"], required: alwaysTrue }
    ]
);

const coinPL = new PropertyList(
    "COIN",
    itemPL,
    [
        { name: 'coinType', options: ["COPPER", "SILVER", "GOLD"], required: alwaysTrue },
    ]
);

const gemPL = new PropertyList(
    "GEM",
    itemPL,
    [
        { name: 'gemType', options: ["AMETHYST", "RUBY", "DIAMOND", "SAPPHIRE"], required: alwaysTrue },
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
        { name: 'stoneType', options: ["FIRE", "ICE", "SPEED", "SHRINK"], required: alwaysTrue },
    ]
);

const objKeyPL = new PropertyList(
    "OBJ_KEY",
    itemPL,
    [
        { name: 'keyType', options: ["DOOR", "CHEST", "SLICK_WILLY", "CLOVER_GATE", "FAIRY_TOWN_A", "FAIRY_TOWN_B", "FAIRY_TOWN_C", "TREE_OF_KNOWLEDGE", "ENGINE_ROOM"], required: alwaysTrue },
    ]
);

// Collision
const collisionPL = new PropertyList(
    "COLLISION",
    null,
    [
        { name: 'type', options: ['CAPSULE', 'TRIMESH'], required: alwaysTrue },
        { name: 'reaction', options: ['SLIDE', 'PENETRATE', 'HALT'], required: alwaysTrue },
        { name: 'collisionGroups', options: keywords.flags.collisionGroups, typeChecker: TC.VarArrEnumTC(keywords.flags.collisionGroups), required: alwaysTrue },
        { name: 'collideWith', options: keywords.flags.collisionGroups, typeChecker: TC.VarArrEnumTC(keywords.flags.collisionGroups), required: alwaysTrue },
        { name: 'radius', options: [], typeChecker: TC.PosNumTC, required: (properties) => (properties.get("type")?.literal === "CAPSULE") },
        { name: 'height', options: [], typeChecker: TC.PosNumTC, required: (properties) => (properties.get("type")?.literal === "CAPSULE") },
        { name: 'offset', options: [], typeChecker: TC.NumericTC, required: (properties) => (properties.get("type")?.literal === "CAPSULE") },
        { name: 'collisionMesh', options: [], typeChecker: TC.IdentTC, required: (properties) => (properties.get("type")?.literal === "TRIMESH") }
    ]
);

// Entity Instance
const entityInstPL = new PropertyList(
    "ENTITY_INSTANCE",
    null,
    [
        { name: 'description', options: [], typeChecker: TC.IdentTC, required: alwaysTrue },
        { name: 'priority', options: [], typeChecker: TC.IntTC },
        { name: 'targetEntity', options: [], typeChecker: TC.IdentTC },
        { name: 'flags', options: keywords.flags.entity, typeChecker: TC.VarArrEnumTC(keywords.flags.entity) },
        { name: 'billboardAxis', options: ["X", "Y", "Z"] },
        { name: 'position', options: [], required: alwaysTrue, typeChecker: TC.Vector3TC },
        { name: 'rotation', options: [], typeChecker: TC.Vector3TC  },
        { name: 'scale', options: [], typeChecker: TC.Vector3TC  },
    ]
);

// Launcher
const launcherInstPL = new PropertyList(
    "LAUNCHER",
    null,
    [
        { name: 'projectileModel', options: [], typeChecker: TC.IdentTC },
        { name: 'cruiseParticleEffect', options: [], typeChecker: TC.IdentTC },
        { name: 'hitParticleEffect', options: [], typeChecker: TC.IdentTC },
        { name: 'projectileLifeTime', options: [], typeChecker: TC.PosNumTC, required: alwaysTrue },
        { name: 'projectileSpeed', options: [], typeChecker: TC.PosNumTC, required: alwaysTrue },
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