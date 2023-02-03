import { readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


export const APP_ROOT = findAppRoot()
export const DEPENDENT_APP_ROOT = findDirOfFileLocation(resolve(APP_ROOT, '..'), 'package.json')


function findAppRoot() {
  const currentFilename = fileURLToPath(import.meta.url)
  const pathToRoot = resolve(currentFilename, '../../')

  return dirname(pathToRoot)
}

function findDirOfFileLocation(dir, filename) {
  const ls = readdirSync(dir)
  const hasStateFile = ls.includes(filename)

  if (hasStateFile) {
    return dir
  } else if (dir === '/') {
    throw new Error(`Could not find a ${filename} in project root.`)
  } else {
    return findDirOfFileLocation(resolve(dir, '..'), filename)
  }
}
