import { readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


// get root of datocms-migration-workflow dir
const currentFilename = fileURLToPath(import.meta.url)
const pathToRoot = resolve(currentFilename, '../../')


// get root of datocms-migration-workflow dependant dir (package that has datocms-migration-workflow as a dependency)
function findFileLocation(dir, filename) {
  const ls = readdirSync(dir)
  const hasStateFile = ls.includes(filename)

  if (hasStateFile) {
    return join(dir, filename)
  } else if (dir === '/') {
    throw new Error(`Could not find a ${filename}.`)
  } else {
    return findFileLocation(resolve(dir, '..'))
  }
}


export const APP_ROOT = dirname(pathToRoot)
export const STATE_FILE_NAME = 'datocms-mw-state.mjs'
export const DEPENDENT_APP_ROOT = findFileLocation(resolve(APP_ROOT, '..'), 'package.json')
export const DEFAULT_EXIT_CODE = 1
export const MIGRATIONS_DIR = './migrations'
export const MIGRATION_MODEL_API_KEY = 'schema_migration'
export const TEST_ENV_NAME_SUFFIX = '-test'
