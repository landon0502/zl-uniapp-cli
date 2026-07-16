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

export interface TemplateInfo {
  name: string
  path: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PKG_ROOT = path.resolve(__dirname, '../')

export const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates')

export const COPY_IGNORE_PATTERNS = [
  '.svn',
  'node_modules',
  '.DS_Store',
  'package-lock.json',
] as const

export const DEFAULT_PM: PackageManager = 'pnpm'

export const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
