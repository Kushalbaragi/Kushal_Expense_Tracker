import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const FILE = join(__dir, 'data.json')

function read() {
  if (!existsSync(FILE)) return []
  try {
    return JSON.parse(readFileSync(FILE, 'utf8'))
  } catch {
    return []
  }
}

function write(data) {
  writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
}

export const db = { read, write }
