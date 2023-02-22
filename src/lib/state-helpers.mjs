import { existsSync } from 'node:fs'
import { readFileFromDependantAppRoot, writeJsFileToDependantAppRoot, writeJsonFileToDependantAppRoot } from './finder.mjs'
import { STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }


export async function getState() {
  if (!existsSync(STATE_FILE_NAME)) {
    return initState()
  } else {
    // const { default: state } = await readFileFromDependantAppRoot(STATE_FILE_NAME)
    const state = await readFileFromDependantAppRoot(STATE_FILE_NAME)

    return state
  }
}

export function setState(newState) {
  if (!existsSync(STATE_FILE_NAME)) {
    initState()
  }

  // writeJsFileToDependantAppRoot(STATE_FILE_NAME, newState)
  writeJsonFileToDependantAppRoot(STATE_FILE_NAME, newState)

  return newState
}

// todo remove unused imports


function initState() {
  // writeJsFileToDependantAppRoot(STATE_FILE_NAME, INITIAL_STATE)
  writeJsonFileToDependantAppRoot(STATE_FILE_NAME, INITIAL_STATE)

  console.log('====> initting state')

  return INITIAL_STATE
}
