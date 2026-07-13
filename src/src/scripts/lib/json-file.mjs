import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

/** Read and parse a JSON file, returning fallback if it doesn't exist or is invalid. */
export async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'))
  } catch {
    return fallback
  }
}

/** Write data as pretty-printed JSON, creating the parent directory if needed. */
export async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}
