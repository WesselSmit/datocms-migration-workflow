import { argv, exit } from 'node:process'
import parser from 'yargs-parser'
import { errorLog } from './console.mjs'
import { DEFAULT_EXIT_CODE } from './constants.mjs'


export const params = (() => {
  const { _: args, ...flags } = parser(argv.slice(2))
  const normalisedArgs = args.map(arg => normaliseCliParams(arg))
  const normalisedFlags = Object
    .entries(flags)
    .map(([flag, value]) => {
      if (typeof value === 'string') {
        return { [flag]: normaliseCliParams(value) }
      } else {
        return { [flag]: value }
      }
    })

  return {
    args: normalisedArgs,
    flags: normalisedFlags,
  }
})()

export function stop(code = DEFAULT_EXIT_CODE) {
  exit(code)
}


function normaliseCliParams(string) {
  const allowedCharsRegex = /^[a-zA-Z0-9-=]*$/
  const normalisedString = string
    .trim()
    .replaceAll(' ', '-')

  if (!allowedCharsRegex.test(normalisedString)) {
    errorLog(`The received param "${string}" contains invalid chars.`)
    stop()
  }

  return normalisedString
}

