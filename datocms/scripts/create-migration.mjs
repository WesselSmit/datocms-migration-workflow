import { existsSync, unlinkSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as dotenv from 'dotenv-safe'
import { args, log, errorLog } from './lib/cli.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, getAppliedMigrationsForEnv } from './lib/dato-helpers.mjs'
import { TEST_ENV_NAME_SUFFIX, DEFAULT_DATOCMS_CONFIG_PROFILE } from './lib/constants.mjs'


dotenv.config()

const { APP_ROOT } = process.env
const [migrationName, envName] = args


if (!migrationName) {
  errorLog('You must specify a name for the new migration.')
}

if (!envName) {
  errorLog('You must specify an existing datocms environment name.')
}

try {
  const datocmsConfigPath = resolve(APP_ROOT, 'datocms.config.json')
  const hasDatocmsConfig = existsSync(datocmsConfigPath)
  const { id: primaryEnvId } = await getPrimaryEnv()
  const testEnvName = `${envName}${TEST_ENV_NAME_SUFFIX}`
  let migrationsDir
  let migrationsModelApiKey

  if (hasDatocmsConfig) {
    const datocmsConfig = JSON.parse(readFileSync(datocmsConfigPath, 'utf8'))
    const migrationsConfig = datocmsConfig.profiles[DEFAULT_DATOCMS_CONFIG_PROFILE].migrations

    migrationsDir = migrationsConfig.directory
    migrationsModelApiKey = migrationsConfig.modelApiKey
  } else {
    migrationsDir = './migrations'
    migrationsModelApiKey = 'schema_migration'
  }

  const allMigrations = readdirSync(migrationsDir)
  const appliedMigrations = await getAppliedMigrationsForEnv(envName, migrationsModelApiKey)
  const unAppliedMigrations = allMigrations.filter(migration => !appliedMigrations.includes(migration))

  unAppliedMigrations.forEach(migration => {
    const migrationPath = resolve(APP_ROOT, migrationsDir, migration)
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
