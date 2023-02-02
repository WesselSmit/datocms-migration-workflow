import { datoSiteRequest } from './dato-request.mjs'
import loadQuery from './load-query.mjs'


export async function getAppliedMigrationsForEnv(env, migrationsModelApiKey) {
  const query = loadQuery('migrations')
  const url = `https://graphql.datocms.com/environments/${env}`

  const { allSchemaMigrations } = await datoContentRequest(query, {
    url,
    fieldName: migrationsModelApiKey
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
