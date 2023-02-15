import { argv, exit } from 'node:process'
import { errorLog } from './console.mjs'


export const args = (() => {
  const args = argv.slice(2)
  const normalisedArgs = args.map(arg => normaliseValue(arg))

  return normalisedArgs
})()

export function stop() {
  exit(1)
}

export function normaliseValue(value) {
  if (!typeof value === 'string') {
    return value
  }

  const allowedCharsRegex = /^[a-zA-Z0-9-=]*$/
  const normalisedValue = value
    .trim()
    .replaceAll(' ', '-')

  if (!allowedCharsRegex.test(normalisedValue)) {
    errorLog(`The received arg "${value}" contains invalid chars.`)
    stop()
  }

  return normalisedValue
}

