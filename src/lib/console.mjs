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

export async function prompt(question, { isYesNoQuestion = false }) {
  const YES_NO_QUESTION = {
    YES_VALUES: ['y', 'yes'],
    NO_VALUES: ['n', 'no'],
    get ACCEPTABLE_VALUES() {
      return [...this.YES_VALUES, ...this.NO_VALUES]
    },
  }

  const questionOptions = isYesNoQuestion ? '(y/n)' : ''
  const formattedQuestion = `${question} ${questionOptions}\n`
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
      const answeredWithYesOrNo = YES_NO_QUESTION.ACCEPTABLE_VALUES.includes(normalisedAnswer)

      if (isYesNoQuestion) {
        if (!answeredWithYesOrNo) {
          const response = await prompt(question, true)
          resolve(response)
        } else {
          if (YES_NO_QUESTION.YES_VALUES.includes(normalisedAnswer)) {
            resolve(true)
          } else if (YES_NO_QUESTION.NO_VALUES.includes(normalisedAnswer)) {
            resolve(false)
          }
        }
      } else {
        resolve(normalisedAnswer)
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
