import { existsSync } from 'node:fs'
import { readJsonFileFromDependantAppRoot, writeJsonFileToDependantAppRoot } from './finder.mjs'
import { STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }


export async function getState() {
  if (!existsSync(STATE_FILE_NAME)) {
    return initState()
  } else {
    const state = await readJsonFileFromDependantAppRoot(STATE_FILE_NAME)

    return state
  }
}

export function setState(newState) {
  if (!existsSync(STATE_FILE_NAME)) {
    initState()
  }

  writeJsonFileToDependantAppRoot(STATE_FILE_NAME, newState)

  return newState
}


function initState() {
  writeJsonFileToDependantAppRoot(STATE_FILE_NAME, INITIAL_STATE)

  return INITIAL_STATE
}
