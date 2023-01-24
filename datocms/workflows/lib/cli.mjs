import { argv, exit } from 'node:process'
import { errorLog } from './console.mjs'
import { DEFAULT_EXIT_CODE } from './constants.mjs'


export const args = (() => {
  const args = argv.slice(2)
  const normalisedArgs = args.map(arg => normaliseCliArgs(arg))

  return normalisedArgs
})()

export function stop(code = DEFAULT_EXIT_CODE) {
  exit(code)
}


function normaliseCliArgs(string) {
  const allowedCharsRegex = /^[a-zA-Z0-9-]*$/
  const normalisedString = string
    .replaceAll(' ', '-')
    .toLowerCase()

  if (!allowedCharsRegex.test(normalisedString)) {
    errorLog(`The received arg "${string}" contains invalid chars.`)
    stop()
  }

  return normalisedString
}

