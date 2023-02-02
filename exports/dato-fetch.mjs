import { datoContentRequest } from '../lib/dato-request.mjs'
import { getState } from '../lib/state-helpers.mjs'
import { STATE_FILE_NAME } from '../lib/constants.mjs'

export default async function datoFetch(query, options, useEnvFromState = true) {
  if (!query) {
    throw new Error('Please pass a query to the datoFetch function.')
  }

  if (useEnvFromState) {
    const { currentEnv: envFromState } = await getState()

    if (envFromState) {
      console.log(`Using "${envFromState}" as datocms environment to fetch from (found in ${STATE_FILE_NAME}).\n`)
      options.url = `https://graphql.datocms.com/environments/${envFromState}`
    }
  }

  try {
    const data = await datoContentRequest(query, options)

    return data
  } catch (error) {
    console.error(error)
    return error
  }
}
