import * as dotenv from 'dotenv-safe'
import { datoSiteRequest, datoContentRequest } from './dato-request.mjs'
import loadQuery from './load-query.mjs'
import { errorLog } from './console.mjs'


dotenv.config()

const { DATOCMS_API_TOKEN } = process.env

if (DATOCMS_API_TOKEN === undefined) {
  errorLog('Could not find a DATOCMS_API_TOKEN env variable.')
}


export async function getAppliedMigrationsForEnv(env, migrationsModelApiKey) {
  const query = loadQuery('migrations')

  const { allSchemaMigrations } = await datoContentRequest(query, {
    paginatedFieldName: migrationsModelApiKey,
    headers: {
      'X-Environment': env,
      Authorization: `Bearer ${DATOCMS_API_TOKEN}`,
    }
  })
  const migrationNames = allSchemaMigrations.map(migration => migration.name)

  return migrationNames
}

export async function getEnvs() {
  const endpoint = 'environments'
  const envs = await datoSiteRequest(endpoint)

  return envs
}

export async function getPrimaryEnv() {
  const environments = await getEnvs()
  const primaryEnv = environments.find(env => env.meta.primary)

  return primaryEnv
}

export async function createNewPrimaryEnvId() {
  const { id: primaryEnvId } = await getPrimaryEnv()
  const [_, currentIndex] = primaryEnvId.split('-')
  const currentIndexParsed = parseInt(currentIndex)
  let newIndex

  if (Number.isNaN(currentIndexParsed)) {
    newIndex = 1
  } else {
    newIndex = currentIndexParsed + 1
  }

  const newPrimaryEnvId = `main-${newIndex}`

  return newPrimaryEnvId
}
