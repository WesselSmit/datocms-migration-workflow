#!/usr/bin/env node

import { args } from './lib/cli.mjs'
import { log, errorLog } from './lib/console.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv } from './lib/dato-env.mjs'
import { setState } from './lib/state-helpers.mjs'
import { config } from './lib/config.mjs'


const [envName] = args
const CONFIG = await config

if (!envName) {
  errorLog('You must specify a name to create a new datocms environment for.')
}

try {
  const { id: primaryEnvId } = await getPrimaryEnv()
  const testEnvName = `${envName}${CONFIG['datocms-mw-config'].testEnvSuffix}`

  await datoCmd(`environments:fork ${primaryEnvId} ${envName}`)
  log(`Created a new datocms environment called "${envName}".`)

  await datoCmd(`environments:fork ${primaryEnvId} ${testEnvName}`)
  log(`Created a new datocms test environment called "${testEnvName}".`)

  setState({ currentEnv: envName })
} catch(error) {
  errorLog(error)
}
