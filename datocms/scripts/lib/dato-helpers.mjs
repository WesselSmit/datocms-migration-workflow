import fetch from 'node-fetch'
import * as dotenv from 'dotenv-safe'
import { errorLog } from './lib/cli.mjs'
import loadQuery from './load-query.mjs'

dotenv.config()

const { DATOCMS_API_TOKEN } = process.env
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${DATOCMS_API_TOKEN}`,
}


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


async function datoSiteRequest(endpoint) {
  try {
    const res = await fetch(`https://site-api.datocms.com/${endpoint}`, {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'X-Api-Version': '3',
      },
    })
    const { data } = await res.json()

    return data
  } catch (error) {
    errorLog(error)
  }
}

async function datoContentRequest(query, {
  url = 'https://graphql.datocms.com/',
  vars = {},
  fieldName
}) {
  async function getContent({ variables }) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          query,
          variables,
        }),
      })
      const { data } = await res.json()

      return data
    } catch (error) {
      errorLog(error)
    }
  }

  if (fieldName) {
    let data = { [fieldName]: [] }

    while (true) {
      const newData = await getContent({
        query,
        variables: {
          ...vars,
          skip: data[fieldName].length || 0,
        },
      })

      Object
        .keys(newData)
        .forEach(key => {
          if (key !== fieldName) {
            data[key] = newData[key]
          }
        })

      if (!newData[fieldName]?.length) {
        break
      }

      data[fieldName] = [
        ...data[fieldName],
        ...newData[fieldName],
      ]
    }

    return data
  } else {
    return await getContent({
      query,
      variables: vars
    })
  }
}
