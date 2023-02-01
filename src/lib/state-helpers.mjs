import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { APP_ROOT } from './constants.mjs'


const STATE_PATH = resolve(APP_ROOT, 'state.json')


export function getCurrentEnvFromState() {
  if (!existsSync(STATE_PATH)) {
    initState()
  }

  const { currentEnv } = JSON.parse(readFileSync(STATE_PATH, 'utf8'))

  return currentEnv
}

export function setCurrentEnvInState(newEnv) {
  if (!existsSync(STATE_PATH)) {
    initState()
  }

  const newState = { currentEnv: newEnv }

  writeFileSync(STATE_PATH, JSON.stringify(newState, null, 2), 'utf8')

  return newEnv
}


function initState() {
  const initialState = { currentEnv: null }

  writeFileSync(STATE_PATH, JSON.stringify(initialState, null, 2), 'utf8')

  return initialState
}
