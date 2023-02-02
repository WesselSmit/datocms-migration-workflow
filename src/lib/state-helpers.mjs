import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { APP_ROOT, STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }
const PATH_TO_STATE_FILE = resolve(APP_ROOT, STATE_FILE_NAME)


export async function getState() {
  if (!existsSync(PATH_TO_STATE_FILE)) {
    return initState()
  } else {
    const state = await import(PATH_TO_STATE_FILE)
    return state.default
  }
}

export function setState(newState) {
  if (!existsSync(PATH_TO_STATE_FILE)) {
    initState()
  }

  writeState(newState)

  return newState
}


function initState() {
  writeState(INITIAL_STATE)

  return INITIAL_STATE
}

function writeState(state) {
  const stateJsString = `export default ${JSON.stringify(state, null, 2)}`
  writeFileSync(PATH_TO_STATE_FILE, stateJsString, 'utf8')
}
