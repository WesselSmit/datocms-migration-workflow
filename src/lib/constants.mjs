export const STATE_FILE_NAME = 'datocms-mw-state.json'
// export const STATE_FILE_NAME = 'datocms-mw-state.mjs'
export const CONFIG_FILE_NAME = 'datocms.config.json'
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
  'datocms-mw-config': {
    profile: 'default',
    typescript: true,
    jsonLogs: true,
    testEnvSuffix: '-test',
  }
}
