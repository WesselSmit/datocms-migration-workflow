import { readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


export const APP_ROOT = (() => {
  const currentFilename = fileURLToPath(import.meta.url)
  const pathToRoot = resolve(currentFilename, '..', '..')

  return dirname(pathToRoot)
})()

export const DEPENDENT_APP_ROOT = (() => {
  function findDirOfFileLocation(dir, filename) {
    const ls = readdirSync(dir)
    const hasStateFile = ls.includes(filename)

    if (hasStateFile) {
      return dir
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
})()

export async function importJsFileFromDependantApp(filename) {
  const filePath = join(DEPENDENT_APP_ROOT, filename)
  const file = await import(filePath)

  return file
}
