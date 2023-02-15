import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { DEPENDANT_APP_ROOT, readFileFromDependantAppRoot } from './finder.mjs'
import { errorLog, log } from './console.mjs'
import { CONFIG_FILE_NAME, DEFAULT_CONFIG } from './constants.mjs'


export const config = (async () => {
  const configPath = join(DEPENDANT_APP_ROOT, CONFIG_FILE_NAME)
  const configExists = existsSync(configPath)

  if (!configExists) {
    errorLog(`Could not find a ${CONFIG_FILE_NAME} in project root.`)
  }

  const configuration = await readFileFromDependantAppRoot(CONFIG_FILE_NAME)

  const mergedConfiguration = {
    ...DEFAULT_CONFIG,
    ...configuration,
    'datocms-mw-config': {
      ...DEFAULT_CONFIG['datocms-mw-config'],
      ...configuration['datocms-mw-config'],
    }
  }

  const profileNameSpecifiedInConfig = mergedConfiguration['datocms-mw-config'].profile
  const profileSpecifiedInConfig = mergedConfiguration.profiles[profileNameSpecifiedInConfig]
  const migrationsDirInSpecifiedProfile = profileSpecifiedInConfig?.migrations?.directory
  const migrationsModelApiKeyInSpecifiedProfile = profileSpecifiedInConfig?.migrations?.modelApiKey

  if (!migrationsDirInSpecifiedProfile) {
    const migrationsDirInDefaultProfile = mergedConfiguration.profiles.default.migrations.directory
    migrationsDirInSpecifiedProfile = migrationsDirInDefaultProfile

    log(`No migrations.directory specified in profile "${profileNameSpecifiedInConfig}". Using migrations.directory "${migrationsDirInDefaultProfile}" (from the "default" profile) instead.`)
  }

  if (!migrationsModelApiKeyInSpecifiedProfile) {
    const migrationsModelApiKeyInDefaultProfile = mergedConfiguration.profiles.default.migrations.modelApiKey
    migrationsModelApiKeyInSpecifiedProfile = migrationsModelApiKeyInDefaultProfile

    log(`No migrations.modelApiKey specified in profile "${profileNameSpecifiedInConfig}". Using migrations.modelApiKey "${migrationsModelApiKeyInDefaultProfile}" (from the "default" profile) instead.`)
  }

  return mergedConfiguration
})()
