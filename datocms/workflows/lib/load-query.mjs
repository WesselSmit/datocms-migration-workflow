import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as dotenv from 'dotenv-safe'
import { errorLog } from './console.mjs'


dotenv.config()

const { APP_ROOT } = process.env


export default function loadQuery(fileName) {
  const queryFilePath = resolve(APP_ROOT, 'datocms', 'workflows', 'queries', `${fileName}.gql`)
  const queryFileExists = existsSync(queryFilePath)

  if (!queryFileExists) {
    errorLog(`Query file "${queryFilePath}" does not exist.`)
  }

  const query = readFileSync(queryFilePath, 'utf8')

  return query
}
