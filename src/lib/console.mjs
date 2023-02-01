import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import { stop } from './cli.mjs'
import { DEFAULT_EXIT_CODE } from './constants.mjs'


export function log(string) {
  const formattedString = formatString(string, false)

  stdout.write(formattedString)
}

export function errorLog(string, exitCode = DEFAULT_EXIT_CODE) {
  const formattedString = formatString(string, true)

  stdout.write(formattedString)
  stop(exitCode)
}

// todo ideally promptYesNo would re-prompt if answer is not a y/n answer
export async function promptYesNo(question) {
  const YES_NO_QUESTION = {
    YES_VALUES: ['y', 'yes'],
    NO_VALUES: ['n', 'no'],
  }

  const formattedQuestion = `${question} (y/n)\n`
  const rl = createInterface({
    input: stdin,
    output: stdout,
  })

  return new Promise(resolve => {
    rl.question(formattedQuestion, async (answer) => {
      rl.close()

      const normalisedAnswer = answer
        .toLowerCase()
        .trim()

      if (YES_NO_QUESTION.YES_VALUES.includes(normalisedAnswer)) {
        resolve(true)
      } else if (YES_NO_QUESTION.NO_VALUES.includes(normalisedAnswer)) {
        resolve(false)
      } else {
        resolve(null)
      }
    })
  })
}


function formatString(string, isError = false) {
  const ANSI_COLORS = {
    DEFAULT: '\x1b[0m',
    RED: '\x1b[31m',
  }

  const prefix = isError ? '[ERROR]' : '[LOG]'
  const color = isError ? ANSI_COLORS.RED : ANSI_COLORS.DEFAULT

  return `${color}${prefix} ${string}${ANSI_COLORS.DEFAULT}\n`
}
