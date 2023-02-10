import { existsSync } from 'node:fs'
import { readFileFromDependantAppRoot, writeJsFileToDependantAppRoot } from './finder.mjs'
import { STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }


export async function getState() {
  if (!existsSync(STATE_FILE_NAME)) {
    return initState()
  } else {
    const { default: state } = await readFileFromDependantAppRoot(STATE_FILE_NAME)

    return state
  }
}

export function setState(newState) {
  if (!existsSync(STATE_FILE_NAME)) {
    initState()
  }

  writeJsFileToDependantAppRoot(STATE_FILE_NAME, newState)

  return newState
}


function initState() {
  writeJsFileToDependantAppRoot(STATE_FILE_NAME, INITIAL_STATE)

  return INITIAL_STATE
}
