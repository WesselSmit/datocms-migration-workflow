#!/usr/bin/env node

import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { args } from './lib/cli.mjs'
import { log, errorLog } from './lib/console.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, getAppliedMigrationsForEnv } from './lib/dato-env.mjs'
import { getState } from './lib/state-helpers.mjs'
import { getMigrationsDir } from './lib/finder.mjs'
import { config } from './lib/config.mjs'
import { STATE_FILE_NAME, MIGRATION_MODEL_API_KEY, TEST_ENV_NAME_SUFFIX } from './lib/constants.mjs'


const [migrationName, envNameFromCli] = args
const CONFIG = await config
const MIGRATIONS_DIR = await getMigrationsDir()
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
    errorLog('You must specify an existing datocms environment name.')
  }
}

try {
  const { id: primaryEnvId } = await getPrimaryEnv()
  const testEnvName = `${envName}${TEST_ENV_NAME_SUFFIX}`
  const migrationsDirExists = existsSync(MIGRATIONS_DIR)

  if (migrationsDirExists) {
    const allMigrations = readdirSync(MIGRATIONS_DIR)
    const appliedMigrations = await getAppliedMigrationsForEnv(envName, MIGRATION_MODEL_API_KEY)

    const unAppliedMigrations = allMigrations.filter(migration => {
      const migrationIsApplied = appliedMigrations.includes(migration)
      const fileExtension = extname(migration)
      const isJsOrTsFile = ['.js', '.ts'].includes(fileExtension)

      return !migrationIsApplied && isJsOrTsFile
    })

    unAppliedMigrations.forEach(migration => {
      const migrationPath = resolve(MIGRATIONS_DIR, migration)
      unlinkSync(migrationPath)
      log(`Deleted the outdated "${migrationPath}".`)
    })
  }

  const migrationOutputFlag = CONFIG['datocms-mw-config'].typescript ? '--ts' : '--js'

  await datoCmd(`migrations:new ${migrationName} --autogenerate=${envName}:${primaryEnvId} ${migrationOutputFlag}`)
  log(`Created migration for changes on "${envName}" based on "${primaryEnvId}".`)

  await datoCmd(`environments:destroy ${testEnvName}`)
  await datoCmd(`environments:fork ${primaryEnvId} ${testEnvName}`)
  await datoCmd(`migrations:run --source=${testEnvName} --in-place`)
  log(`Re-created the "${testEnvName}" environment and applied all pending migrations.`)
  log(`You can now test your changes on the "${testEnvName}" environment.`)
} catch(error) {
  errorLog(error)
}
