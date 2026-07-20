export const COPY_IGNORE_PATTERNS = [
  '.svn',
  'node_modules',
  '.DS_Store',
  'package-lock.json',
] as const

export interface TemplateInfo {
  name: string
  path: string
}
