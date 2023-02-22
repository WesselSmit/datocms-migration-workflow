import { datoContentRequest } from '../lib/dato-request.mjs'
import { logInColor } from '../lib/console.mjs'
import { getState } from '../lib/state-helpers.mjs'
import { STATE_FILE_NAME } from '../lib/constants.mjs'


export default async function datoFetch(query, options) {
  if (!query) {
    throw new Error('Please pass a query to the datoFetch function.')
  }

  if (options.env) {
    options.headers = {
      ...options.headers,
      'X-Environment': options.env,
    }
  } else if (options?.useState || options?.useState == null) {
    const { currentEnv: envFromState } = await getState()

    if (envFromState) {
      options.headers = {
        ...options.headers,
        'X-Environment': envFromState,
      }
      logInColor(`Using "${envFromState}" as datocms environment to fetch from (found in ${STATE_FILE_NAME}).\n`, 'yellow')
    } else {
      console.log(`No "currentEnv" specified in ${STATE_FILE_NAME} or ${STATE_FILE_NAME} does not exist.`)
      logInColor(`Using the default environment instead.\n`, 'yellow')
    }
  }

  const { data, errors } = await datoContentRequest(query, options)

  if (errors) {
    const formattedErrors = errors.map(error => error.message)
    throw `Errors: [${formattedErrors}]`
  } else {
    return data
  }
}
