import { existsSync, writeFileSync } from 'node:fs'
import { importJsFileFromDependantApp } from './finder.mjs'
import { STATE_FILE_NAME } from './constants.mjs'


const INITIAL_STATE = { currentEnv: null }


export async function getState() {
  if (!existsSync(STATE_FILE_NAME)) {
    // return initState()
  } else {
    // const state = await import(STATE_FILE_NAME)
    // return state.default
    const { default: state } = await importJsFileFromDependantApp('datocms-mw-state.mjs')
    return state
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
