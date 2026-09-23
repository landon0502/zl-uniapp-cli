import fs from 'node:fs'
import path from 'node:path'
import parseJsonc from 'json-format'
import { readJsonValue } from './index.js'
import { writeFile } from './file.js'
export async function replaceProjectName(
  dir: string,
  name: string,
): Promise<void> {
  const pkgPath = path.join(dir, 'package.json')
  const pkg = await readJsonValue(pkgPath)
  pkg.name = name
  await writeFile(pkgPath, parseJsonc(pkg, null, 2) + '\n')
}

export async function replaceAppName(
  dir: string,
  appname: string,
): Promise<void> {
  const manifestPath = path.join(dir, 'src/manifest.json')
  const manifest = await readJsonValue(manifestPath)
  manifest.name = appname
  await writeFile(manifestPath, parseJsonc(manifest, null, 2) + '\n')
}
