import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import { stop } from './cli.mjs'


export function log(string) {
  const prefixedString = `[LOG] ${string}`
  const coloredString = colorString(prefixedString, 'default')

  print(coloredString)
}

export function errorLog(string) {
  const prefixedString = `[ERROR] ${string}`
  const coloredString = colorString(prefixedString, 'red')

  print(coloredString)
  stop()
}

export function logInColor(string, color) {
  const coloredString = colorString(string, color)

  print(coloredString)
}

// todo ideally promptYesNo would re-prompt if answer is not a y/n answer
export async function promptYesNo(question) {
  const YES_NO_QUESTION = {
    YES_VALUES: ['y', 'yes'],
    NO_VALUES: ['n', 'no'],
  }

  const formattedQuestion = `[PROMPT] ${question} (y/n)`
  const coloredQuestion = colorString(formattedQuestion, 'blue')
  const rl = createInterface({
    input: stdin,
    output: stdout,
  })

  return new Promise(resolve => {
    rl.question(coloredQuestion, async (answer) => {
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


function colorString(string, desiredColor = 'default') {
  const ANSI_COLORS = {
    default: '\x1b[0m',
    red: '\x1b[31m',
    blue: '\x1b[36m',
    gray: '\x1b[90m',
  }

  const color = ANSI_COLORS[desiredColor] ?? ANSI_COLORS.default

  return `${color}${string}${ANSI_COLORS.default}\n`
}

function print(string) {
  stdout.write(string)
}
