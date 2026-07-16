import fs from 'node:fs'
import path from 'node:path'

export async function replaceProjectName(
  dir: string,
  name: string,
): Promise<void> {
  const pkgPath = path.join(dir, 'package.json')
  const content = await fs.promises.readFile(pkgPath, 'utf-8')
  const pkg = JSON.parse(content)
  pkg.name = name
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
