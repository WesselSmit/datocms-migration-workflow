import { log, errorLog } from './lib/cli.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, createNewPrimaryEnvId } from './lib/dato-helpers.mjs'


try {
  const { id: currentPrimaryEnvId } = await getPrimaryEnv()
  const newPrimaryEnvId = await createNewPrimaryEnvId()

  await datoCmd(`npx datocms environments:fork ${currentPrimaryEnvId} ${newPrimaryEnvId}`)
  await datoCmd(`npx datocms maintenance:on`)
  // todo add option to use '--force' flag in "npx datocms maintenance:on --force"
  await datoCmd(`npx datocms migrations:run --source=${newPrimaryEnvId} --in-place`)
  // todo users should really check/test the changes one more time before continuing with the promotion - maybe add a prompt here that awaits a y/n response?

  await datoCmd(`npx datocms environments:promote ${newPrimaryEnvId}`)
  await datoCmd(`npx datocms maintenance:off`)

  log(`Promotion of "${newPrimaryEnvId}" to primary environment is done.`)
  log(`The previous primary "${currentPrimaryEnvId}" environment still exists and can function as backup if a roll-back is needed.`)
  // todo think about whether you want to add the following 2 options/features:
  // todo - delete the previous/old primary env from datocms
  // todo - delete the previous/old non-primary envs from datocms (e.g. the one you created when running the 'npx datocms:create-env' script)
} catch(error) {
  errorLog(error)
}
