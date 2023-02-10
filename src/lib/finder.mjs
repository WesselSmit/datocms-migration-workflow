import { readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


export const APP_ROOT = (() => {
  const currentFilename = fileURLToPath(import.meta.url)
  const pathToRoot = resolve(currentFilename, '..', '..')

  return dirname(pathToRoot)
})()

export const MIGRATIONS_DIR = (() => {
  const dependantAppRoot = dirname(findFileInDependantAppRoot('package.json'))
  const migrationsDirInDependantApp = join(dependantAppRoot, 'migrations')

  return migrationsDirInDependantApp
})()

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

export async function importJsFileFromDependantAppRoot(filename) {
  const filePath = findFileInDependantAppRoot(filename)
  const file = await import(filePath)

  return file
}

export function writeJsFileToDependantAppRoot(filename, content) {
  const filePath = findFileInDependantAppRoot(filename)
  const contentJsString = `export default ${JSON.stringify(content, null, 2)}`

  writeFileSync(filePath, contentJsString, 'utf8')
}
