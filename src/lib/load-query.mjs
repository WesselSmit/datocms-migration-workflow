import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { errorLog } from './console.mjs'
import { APP_ROOT  } from './finder.mjs'


export default function loadQuery(fileName) {
  const queryFilePath = resolve(APP_ROOT, 'src', 'queries', `${fileName}.gql`)
  const queryFileExists = existsSync(queryFilePath)

  if (!queryFileExists) {
    errorLog(`Query file "${queryFilePath}" does not exist.`)
  }

  const query = readFileSync(queryFilePath, { encoding: 'utf8' })

  return query
}
