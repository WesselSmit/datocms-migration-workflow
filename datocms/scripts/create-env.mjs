import { args, log, errorLog } from './lib/cli.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv } from './lib/dato-helpers.mjs'
import { TEST_ENV_NAME_SUFFIX } from './lib/constants.mjs'


const [envName] = args

if (!envName) {
  errorLog('You must specify a name to create a new datocms environment for.')
}

try {
  const { id: primaryEnvId } = await getPrimaryEnv()
  const testEnvName = `${envName}${TEST_ENV_NAME_SUFFIX}`

  await datoCmd(`npx datocms environments:fork ${primaryEnvId} ${envName}`)
  log(`Created a new datocms environment called "${envName}".`)

  await datoCmd(`npx datocms environments:fork ${primaryEnvId} ${testEnvName}`)
  log(`Created a new datocms test environment called "${testEnvName}".`)
} catch(error) {
  errorLog(error)
}
