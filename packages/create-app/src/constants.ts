import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type PackageManager = 'pnpm' | 'npm' | 'yarn'

export interface CreateOptions {
  name: string
  template: string
  pm: PackageManager
}

export interface PartialCreateOptions {
  name?: string
  template?: string
  pm?: PackageManager
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')

export const DEFAULT_PM: PackageManager = 'pnpm'

export const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
