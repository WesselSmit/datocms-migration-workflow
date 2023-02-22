import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { normaliseValue } from './cli.mjs'
import { DEPENDANT_APP_ROOT, readJsonFileFromDependantAppRoot } from './finder.mjs'
import { errorLog, log } from './console.mjs'
import { CONFIG_FILE_NAME, DEFAULT_CONFIG } from './constants.mjs'


export const config = (async () => {
  const configPath = join(DEPENDANT_APP_ROOT, CONFIG_FILE_NAME)
  const configExists = existsSync(configPath)

  if (!configExists) {
    errorLog(`Could not find a ${CONFIG_FILE_NAME} in project root.`)
  }

  const configuration = await readJsonFileFromDependantAppRoot(CONFIG_FILE_NAME)

  const mergedConfiguration = {
    ...DEFAULT_CONFIG,
    ...configuration,
    'datocms-mw-config': {
      ...DEFAULT_CONFIG['datocms-mw-config'],
      ...configuration['datocms-mw-config'],
    }
  }

  mergedConfiguration['datocms-mw-config'].testEnvSuffix = normaliseValue(mergedConfiguration['datocms-mw-config'].testEnvSuffix.toLowerCase())

  if (mergedConfiguration['datocms-mw-config'].testEnvSuffix === '') {
    mergedConfiguration['datocms-mw-config'].testEnvSuffix = DEFAULT_CONFIG['datocms-mw-config'].testEnvSuffix
  }

  const profileNameSpecifiedInConfig = mergedConfiguration['datocms-mw-config'].profile
  const profileSpecifiedInConfig = mergedConfiguration.profiles[profileNameSpecifiedInConfig]

  if (!profileSpecifiedInConfig?.migrations?.directory) {
    const fallbackMigrationsDirectory = mergedConfiguration.profiles.default.migrations.directory
    mergedConfiguration.profiles[profileNameSpecifiedInConfig].migrations.directory = fallbackMigrationsDirectory

    log(`No migrations.directory specified in profile "${profileNameSpecifiedInConfig}". Using migrations.directory "${fallbackMigrationsDirectory}" (from the "default" profile) instead.`)
  }

  if (!profileSpecifiedInConfig?.migrations?.modelApiKey) {
    const fallbackMigrationsModelApiKey = mergedConfiguration.profiles.default.migrations.modelApiKey
    mergedConfiguration.profiles[profileNameSpecifiedInConfig].migrations.modelApiKey = fallbackMigrationsModelApiKey

    log(`No migrations.modelApiKey specified in profile "${profileNameSpecifiedInConfig}". Using migrations.modelApiKey "${fallbackMigrationsModelApiKey}" (from the "default" profile) instead.`)
  }

  return mergedConfiguration
})()
