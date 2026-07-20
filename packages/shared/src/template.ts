import fs from 'node:fs'
import path from 'node:path'
import type { TemplateInfo } from './constants.js'

export async function discoverTemplates(
  templatesDir: string,
): Promise<TemplateInfo[]> {
  const entries = await fs.promises.readdir(templatesDir, {
    withFileTypes: true,
  })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: path.join(templatesDir, entry.name),
    }))
}
