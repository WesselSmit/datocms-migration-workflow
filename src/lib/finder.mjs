import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { errorLog } from './console.mjs'


export const APP_ROOT = (() => {
  const currentFilename = fileURLToPath(import.meta.url)
  const pathToRoot = resolve(currentFilename, '..', '..')

  return dirname(pathToRoot)
})()

export const DEPENDANT_APP_ROOT = (() => {
  const packageJsonInDependantAppRoot = findFileInDependantAppRoot('package.json')
  const dependantAppRoot = dirname(packageJsonInDependantAppRoot)

  return dependantAppRoot
})()

export async function getMigrationsDir() {
  // todo refactor (the dynamic import below is necessary to prevent infinite import loops between finder.mjs and config.mjs)
  const { config } = await import('./config.mjs')
  const CONFIG = await config

  const profile = CONFIG['datocms-mw-config'].profile
  const pathToMigrationsDirInDependantAppRoot = CONFIG.profiles[profile].migrations.directory
  const migrationsDirInDependantApp = join(DEPENDANT_APP_ROOT, pathToMigrationsDirInDependantAppRoot)

  return migrationsDirInDependantApp
}

export function findFileInDependantAppRoot(fileInDependantAppRoot) {
  function findDirOfFileLocation(dir, filename) {
    const ls = readdirSync(dir)
    const hasStateFile = ls.includes(filename)

    if (hasStateFile) {
      return join(dir, fileInDependantAppRoot)
    } else if (dir === '/') {
      throw new Error(`Could not find a ${filename} in project root.`)
    } else {
      const newDir = resolve(dir, '..')
      return findDirOfFileLocation(newDir, filename)
    }
  }

  // '..' is used to ensure it doesn't 'find' the package.json of the datocms-migration-workflow package itself
  const startingDir = resolve(APP_ROOT, '..')

  return findDirOfFileLocation(startingDir, 'package.json')
}

export function writeJsonFileToDependantAppRoot(filename, content) {
  const filePath = findFileInDependantAppRoot(filename)
  const json = JSON.stringify(content, null, 2)

  writeFileSync(filePath, json, { encoding: 'utf8' })
}

export async function readJsonFileFromDependantAppRoot(filename) {
  if (!filename) {
    errorLog(`No filename provided.`)
  }

  try {
    const filePath = join(DEPENDANT_APP_ROOT, filename)

    // 'rs+' flag is used to cache bust (see: https://stackoverflow.com/questions/36249576/does-readfile-caches-the-content)
    const file = readFileSync(filePath, { flag: 'rs+', encoding: 'utf8' })
    const json = JSON.parse(file)

    return json
  } catch (error) {
    errorLog(error)
  }
}
