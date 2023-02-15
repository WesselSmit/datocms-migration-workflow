import { argv, exit } from 'node:process'
import { errorLog } from './console.mjs'


export const args = (() => {
  const args = argv.slice(2)
  const normalisedArgs = args.map(arg => normaliseCliArgs(arg))

  return normalisedArgs
})()

export function stop() {
  exit(1)
}


function normaliseCliArgs(string) {
  const allowedCharsRegex = /^[a-zA-Z0-9-=]*$/
  const normalisedString = string
    .trim()
    .replaceAll(' ', '-')

  if (!allowedCharsRegex.test(normalisedString)) {
    errorLog(`The received arg "${string}" contains invalid chars.`)
    stop()
  }

  return normalisedString
}

