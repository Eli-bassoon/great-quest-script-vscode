import { gqsSections, kcScriptSections } from './sections';
import { kcScriptCauses, kcScriptFunctions, kcScriptInSequenceFns, kcScriptOutSequenceFns } from './functions';
import { kcScriptCauseArgs, kcScriptFunctionArgs, kcScriptTriggerEventArgs } from './arguments';
import { entityFlags, kcScriptFunctionFlags, gqsSectionFlags, kcScriptGeneralFlags, kcScriptCauseFlags, collisionGroups } from './flags';

export const keywords = {
    gqsSections,
    kcScriptSections,
    kcScriptCauses,
    kcScriptFunctions,
    kcScriptInSequenceFns,
    kcScriptOutSequenceFns,
    kcScriptCauseArgs,
    kcScriptFunctionArgs,
    kcScriptTriggerEventArgs,
    entityFlags,
    kcScriptFunctionFlags,
    gqsSectionFlags,
    kcScriptGeneralFlags,
    kcScriptCauseFlags,
    collisionGroups,
};

export { kcScriptFunction } from './functions';