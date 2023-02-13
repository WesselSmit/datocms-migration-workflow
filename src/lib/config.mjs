import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { DEPENDANT_APP_ROOT, readFileFromDependantAppRoot } from './finder.mjs'
import { errorLog } from './console.mjs'
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
  }

  return mergedConfiguration
})()
