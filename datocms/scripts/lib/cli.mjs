import { argv, exit, stdout } from 'node:process'


const DEFAULT_EXIT_CODE = 1
const ANSI_COLORS = {
  DEFAULT: '\x1b[0m',
  RED: '\x1b[31m',
}


export const args = (() => {
  const args = argv.slice(2)
  const normalisedArgs = args.map(arg => normaliseCliArgs(arg))

  return normalisedArgs
})()

export function stop(code = DEFAULT_EXIT_CODE) {
  exit(code)
}

export function log(string) {
  const formattedString = formatString(string, false)

  stdout.write(formattedString)
}

export function errorLog(string, exitCode = DEFAULT_EXIT_CODE) {
  const formattedString = formatString(string, true)

  stdout.write(formattedString)
  stop(exitCode)
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

function formatString(string, isError = false) {
  const prefix = isError ? '[ERROR]' : '[LOG]'
  const color = isError ? ANSI_COLORS.RED : ANSI_COLORS.DEFAULT

  return `${color}${prefix} ${string}${ANSI_COLORS.DEFAULT}\n`
}
