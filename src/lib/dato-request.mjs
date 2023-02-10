import fetch from 'node-fetch'
import * as dotenv from 'dotenv-safe'
import { errorLog } from './console.mjs'


dotenv.config()

const { DATOCMS_API_TOKEN } = process.env
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

if (DATOCMS_API_TOKEN === undefined) {
  errorLog('Could not find a DATOCMS_API_TOKEN env variable.')
}


export async function datoSiteRequest(endpoint) {
  try {
    const res = await fetch(`https://site-api.datocms.com/${endpoint}`, {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'X-Api-Version': '3',
        Authorization: `Bearer ${DATOCMS_API_TOKEN}`,
      },
    })
    const { data } = await res.json()

    return data
  } catch (error) {
    errorLog(error)
  }
}

export async function datoContentRequest(query, optionsFromArgs) {
  const DEFAULT_OPTIONS = {
    vars: {},
    paginatedFieldName: '',
  }

  const options = {
    ...DEFAULT_OPTIONS,
    ...optionsFromArgs,
    headers: {
      ...DEFAULT_HEADERS,
      ...(optionsFromArgs?.headers && { ...optionsFromArgs.headers }),
    }
  }

  async function getContent({ variables }) {
    try {
      const res = await fetch('https://graphql.datocms.com', {
        method: 'POST',
        headers: options.headers,
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
  // TODO while() can be rewritten using a function that calls itself recursively (for this you'll need to revert the 'if' statement that has the 'break' statement [then in the reverted 'if' statement you van replace the 'break' statement with the recursive call])
  // TODO introduce a check that, before a fetch, check what vars + which paginatedFieldName are passen and then (using a stirng operator) check if the query actually contains the passed vars/paginatedFieldName. If not, let the dev/user know they're passing the vars/paginatedFieldName to the query but that the query does not contain them.

  if (options.paginatedFieldName) {
    let data = { [options.paginatedFieldName]: [] }

    while (true) {
      const newData = await getContent({
        query,
        variables: {
          ...options.vars,
          skip: data[options.paginatedFieldName].length || 0,
        },
      })

      Object
        .keys(newData)
        .forEach(key => {
          if (key !== options.paginatedFieldName) {
            data[key] = newData[key]
          }
        })

      if (!newData[options.paginatedFieldName]?.length) {
        break
      }

      data[options.paginatedFieldName] = [
        ...data[options.paginatedFieldName],
        ...newData[options.paginatedFieldName],
      ]
    }

    return data
  } else {
    return await getContent({
      query,
      variables: options.vars
    })
  }
}
