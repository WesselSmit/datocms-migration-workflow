import { exec } from 'node:child_process'
import * as dotenv from 'dotenv-safe'
import { logInColor, errorLog } from './console.mjs'


dotenv.config()

const { DATOCMS_API_TOKEN } = process.env

if (DATOCMS_API_TOKEN === undefined) {
  errorLog('Could not find a DATOCMS_API_TOKEN env variable.')
}


export default async function datoCmd(cmd, jsonOutput = true) {
  const apiTokenArg = `--api-token=${DATOCMS_API_TOKEN}`
  const jsonFlag = jsonOutput ? '--json' : ''
  const fullCmd = `${cmd} ${apiTokenArg} ${jsonFlag}`

  return new Promise((resolve, reject) => {
    exec(
      fullCmd,
      (err, stdout) => {
        logInColor(stdout, 'gray')
        err ? reject(err) : resolve()
      }
    )
  })
}
