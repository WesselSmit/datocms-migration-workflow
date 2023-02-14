export const STATE_FILE_NAME = 'datocms-mw-state.mjs'
export const CONFIG_FILE_NAME = 'datocms.config.json'
export const MIGRATION_MODEL_API_KEY = 'schema_migration'
export const DEFAULT_EXIT_CODE = 1
export const TEST_ENV_NAME_SUFFIX = '-test'
export const DEFAULT_CONFIG = {
  profiles: {
    default: {
      logLevel: 'BODY',
      migrations: {
        directory: 'migrations',
        modelApiKey: 'schema_migration',
      },
    },
  },
  profile: 'default',
  typescript: false,
  jsonLogs: false,
}
