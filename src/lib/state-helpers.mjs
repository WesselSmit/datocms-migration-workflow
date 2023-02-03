import { existsSync, writeFileSync } from 'node:fs'
import { DEPENDENT_APP_ROOT, STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }

import fs from 'node:fs'
export async function getState() {
  console.log('---> STATE_FILE_NAME:', STATE_FILE_NAME, DEPENDENT_APP_ROOT)
  console.log(JSON.parse(fs.readFileSync(1, 'package.json')))
  if (!existsSync(STATE_FILE_NAME)) {
    // return initState()
  } else {
    const state = await import(STATE_FILE_NAME)
    return state.default
  }
}

export function setState(newState) {
  if (!existsSync(STATE_FILE_NAME)) {
    // initState()
  }

  // writeState(newState)

  return newState
}


function initState() {
  writeState(INITIAL_STATE)

  return INITIAL_STATE
}

function writeState(state) {
  const stateJsString = `export default ${JSON.stringify(state, null, 2)}`
  writeFileSync(STATE_FILE_NAME, stateJsString, 'utf8')
}
