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

export const DEFAULT_PM: PackageManager = 'pnpm'

export const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
