import path from 'node:path'
import { copyTemplate } from '@wh-templates/shared'
import { TEMPLATES_DIR } from '../constants.js'

export async function downloadTemplate(
  template: string,
  dest: string,
): Promise<void> {
  const templateDir = path.join(TEMPLATES_DIR, template)
  await copyTemplate(templateDir, dest)
}
