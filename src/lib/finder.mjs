import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
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

  const profileSpecifiedInConfig = CONFIG['datocms-mw-config'].profile
  let pathToMigrationsDirInDependantAppRoot = CONFIG.profiles[profileSpecifiedInConfig]?.migrations?.directory

  if (!pathToMigrationsDirInDependantAppRoot) {
    pathToMigrationsDirInDependantAppRoot = CONFIG.profiles.default.migrations.directory
  }

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

export async function readFileFromDependantAppRoot(filename) {
  if (!filename) {
    errorLog(`No filename provided.`)
  }

  const fileExtension = extname(filename)

  if (!fileExtension) {
    errorLog(`No file extension provided.`)
  }

  const filePath = join(DEPENDANT_APP_ROOT, filename)
  let importedFileContents

  switch (fileExtension) {
    case '.js':
    case '.mjs':
      importedFileContents = await importJsFile(filePath)
      break
    case '.json':
      importedFileContents = await importJsonFile(filePath)
      break
    default:
      errorLog(`No import support for "${fileExtension}" files.`)
  }

  return importedFileContents
}

export function writeJsFileToDependantAppRoot(filename, content) {
  const filePath = findFileInDependantAppRoot(filename)
  const contentJsString = `export default ${JSON.stringify(content, null, 2)}`

  writeFileSync(filePath, contentJsString, 'utf8')
}


async function importJsFile(filePath) {
  try {
    const js = await import(filePath)

    return js
  } catch (error) {
    errorLog(error)
  }
}

async function importJsonFile(filePath) {
  try {
    const file = readFileSync(filePath, 'utf8')
    const json = JSON.parse(file)

    return json
  } catch (error) {
    errorLog(error)
  }
}
