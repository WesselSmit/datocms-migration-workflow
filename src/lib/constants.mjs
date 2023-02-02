import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const currentFilename = fileURLToPath(import.meta.url)
const pathToRoot = resolve(currentFilename, '../../')


export const APP_ROOT = dirname(pathToRoot)
export const STATE_FILE_NAME = 'datocms-mw-state.mjs'
export const DEFAULT_EXIT_CODE = 1
export const MIGRATIONS_DIR = './migrations'
export const MIGRATION_MODEL_API_KEY = 'schema_migration'
export const TEST_ENV_NAME_SUFFIX = '-test'
