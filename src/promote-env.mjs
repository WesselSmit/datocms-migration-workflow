#!/usr/bin/env node

import { stop } from './lib/cli.mjs'
import { log, errorLog, promptYesNo } from './lib/console.mjs'
import datoCmd from './lib/dato-cmd.mjs'
import { getPrimaryEnv, createNewPrimaryEnvId } from './lib/dato-env.mjs'


try {
  const { id: currentPrimaryEnvId } = await getPrimaryEnv()
  const newPrimaryEnvId = await createNewPrimaryEnvId()

  await datoCmd(`npx datocms environments:fork ${currentPrimaryEnvId} ${newPrimaryEnvId}`)
  await datoCmd(`npx datocms maintenance:on`)
  await datoCmd(`npx datocms migrations:run --source=${newPrimaryEnvId} --in-place`)

  log(`Created "${newPrimaryEnvId}" environment with all migrations applied.`)
  log(`Check your changes one last time on the "${newPrimaryEnvId}" environment.`)
  log(`When you have checked the changes, confirm whether you want to continue the promotion.`)

  const continuePromotion = await promptYesNo('Do you want to continue the promotion?')

  if (!continuePromotion) {
    await datoCmd(`npx datocms environments:destroy ${newPrimaryEnvId}`)
    await datoCmd(`npx datocms maintenance:off`)
    log(`Promotion aborted. Deleted the "${newPrimaryEnvId}" environment.`)
    stop()
  }

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
