import { existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { normaliseValue } from './cli.mjs'
import { APP_ROOT, DEPENDANT_APP_ROOT, readFileFromDependantAppRoot } from './finder.mjs'
import { errorLog } from './console.mjs'
import { CONFIG_FILE_NAME, DEFAULT_CONFIG, TEMP_CONFIG_FILE_NAME } from './constants.mjs'


export const config = (async () => {
  const configPath = join(DEPENDANT_APP_ROOT, CONFIG_FILE_NAME)
  const configExists = existsSync(configPath)

  if (!configExists) {
    errorLog(`Could not find a ${CONFIG_FILE_NAME} in project root.`)
  }

  const configurationFromConfigFile = await readFileFromDependantAppRoot(CONFIG_FILE_NAME)
  const profileNameToUse = configurationFromConfigFile['datocms-mw-config'].profile ?? DEFAULT_CONFIG['datocms-mw-config'].profile

  const mergedConfiguration = {
    profile: {
      ...DEFAULT_CONFIG.profiles[profileNameToUse],
      ...configurationFromConfigFile.profiles[profileNameToUse],
    },
    'datocms-mw-config': {
      ...DEFAULT_CONFIG['datocms-mw-config'],
      ...configurationFromConfigFile['datocms-mw-config'],
    },
  }

  mergedConfiguration['datocms-mw-config'].testEnvSuffix = normaliseValue(mergedConfiguration['datocms-mw-config'].testEnvSuffix.toLowerCase())

  return mergedConfiguration
})()


export function createTempConfigFile() {
  const filePath = join(APP_ROOT, TEMP_CONFIG_FILE_NAME)
  const fileContents = {
    profiles: {
      default: {
        ...config.profile
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(fileContents, null, 2), 'utf8')
}

export function deleteTempConfigFile() {
  const filePath = join(APP_ROOT, TEMP_CONFIG_FILE_NAME)

  unlinkSync(filePath)
}
