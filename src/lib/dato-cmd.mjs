import { exec } from 'node:child_process'
import * as dotenv from 'dotenv-safe'
import { logInColor, errorLog } from './console.mjs'
import { config } from './config.mjs'


dotenv.config()

const { DATOCMS_API_TOKEN } = process.env
const CONFIG = await config

if (DATOCMS_API_TOKEN === undefined) {
  errorLog('Could not find a DATOCMS_API_TOKEN env variable.')
}


export default async function datoCmd(cmd) {
  const apiTokenArg = `--api-token=${DATOCMS_API_TOKEN}`
  const jsonFlag = CONFIG['datocms-mw-config']?.logJsonOutput ? '--json' : ''
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
