import { exec } from 'node:child_process'
import * as dotenv from 'dotenv-safe'


dotenv.config()

const { DATOCMS_API_TOKEN } = process.env


export default async function datoCmd(cmd, jsonOutput = true) {
  const apiTokenArg = `--api-token=${DATOCMS_API_TOKEN}`
  const jsonFlag = jsonOutput ? '--json' : ''
  const fullCmd = `${cmd} ${apiTokenArg} ${jsonFlag}`

  return new Promise((resolve, reject) => {
    exec(
      fullCmd,
      (err, stdout) => {
        console.log(stdout)
        err ? reject(err) : resolve()
      }
    )
  })
}
