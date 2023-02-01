#!/usr/bin/env node

import { unlinkSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { args } from './lib/cli.mjs'
import { log, errorLog, promptYesNo } from './lib/console.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, getAppliedMigrationsForEnv } from './lib/dato-helpers.mjs'
import { getCurrentEnvFromState } from './lib/state-helpers.mjs'
import { APP_ROOT, MIGRATIONS_DIR, MIGRATION_MODEL_API_KEY, TEST_ENV_NAME_SUFFIX } from './lib/constants.mjs'


const [migrationName, envNameFromCli] = args
let envName = envNameFromCli

if (!migrationName) {
  errorLog('You must specify a name for the new migration.')
}

if (!envNameFromCli) {
  const envNameFromState = getCurrentEnvFromState()

  if (envNameFromState) {
    log(`No datocms environment name specified, but we detected "${envNameFromState}" in your local state (state.json).`)
    const useEnvNameFromState = await promptYesNo(`Do you want to use "${envNameFromState}" as datocms environment?`)

    if (useEnvNameFromState) {
      envName = envNameFromState
      log(`Using "${envNameFromState}" as datocms environment.`)
    } else {
      errorLog('Aborting. You must specify an existing datocms environment name.')
    }
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
    const migrationPath = resolve(APP_ROOT, MIGRATIONS_DIR, migration)
    unlinkSync(migrationPath)
    log(`Deleted the outdated "${migrationPath}".`)
  })

  await datoCmd(`npx datocms migrations:new ${migrationName} --autogenerate=${envName}:${primaryEnvId}`)
  log(`Created migration for changes on "${envName}" based on "${primaryEnvId}".`)

  await datoCmd(`npx datocms environments:destroy ${testEnvName}`)
  await datoCmd(`npx datocms environments:fork ${primaryEnvId} ${testEnvName}`)
  await datoCmd(`npx datocms migrations:run --source=${testEnvName} --in-place`)
  log(`Re-created the "${testEnvName}" environment and applied all pending migrations.`)
  log(`You can now test your changes on the "${testEnvName}" environment.`)
} catch(error) {
  errorLog(error)
}
