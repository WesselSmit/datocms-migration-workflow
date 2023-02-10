#!/usr/bin/env node

import { unlinkSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { args } from './lib/cli.mjs'
import { log, errorLog } from './lib/console.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, getAppliedMigrationsForEnv } from './lib/dato-env.mjs'
import { getState } from './lib/state-helpers.mjs'
import { MIGRATIONS_DIR } from './lib/finder.mjs'
import {
  STATE_FILE_NAME,
  MIGRATION_MODEL_API_KEY,
  TEST_ENV_NAME_SUFFIX
} from './lib/constants.mjs'


const [migrationName, envNameFromCli] = args
let envName = envNameFromCli

if (!migrationName) {
  errorLog('You must specify a name for the new migration.')
}

if (!envNameFromCli) {
  const { currentEnv: envNameFromState } = await getState()

  if (envNameFromState) {
    log(`No datocms environment name specified, but we detected "${envNameFromState}" in your local state (${STATE_FILE_NAME}).`)
    log(`Using "${envNameFromState}" as datocms environment.`)
    envName = envNameFromState
  } else {
    errorLog('Aborting. You must specify an existing datocms environment name.')
  }
}

try {
  const { id: primaryEnvId } = await getPrimaryEnv()
  const testEnvName = `${envName}${TEST_ENV_NAME_SUFFIX}`

  const allMigrations = readdirSync(MIGRATIONS_DIR)
  const appliedMigrations = await getAppliedMigrationsForEnv(envName, MIGRATION_MODEL_API_KEY)
  const unAppliedMigrations = allMigrations.filter(migration => !appliedMigrations.includes(migration) && migration !== '.gitkeep')

  unAppliedMigrations.forEach(migration => {
    const migrationPath = resolve(MIGRATIONS_DIR, migration)
    unlinkSync(migrationPath)
    log(`Deleted the outdated "${migrationPath}".`)
  })

  await datoCmd(`npx datocms migrations:new ${migrationName} --autogenerate=${envName}:${primaryEnvId} --js`)
  log(`Created migration for changes on "${envName}" based on "${primaryEnvId}".`)

  await datoCmd(`npx datocms environments:destroy ${testEnvName}`)
  await datoCmd(`npx datocms environments:fork ${primaryEnvId} ${testEnvName}`)
  await datoCmd(`npx datocms migrations:run --source=${testEnvName} --in-place`)
  log(`Re-created the "${testEnvName}" environment and applied all pending migrations.`)
  log(`You can now test your changes on the "${testEnvName}" environment.`)
} catch(error) {
  errorLog(error)
}
