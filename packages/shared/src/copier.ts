import path from 'node:path'
import fse from 'fs-extra'
import { COPY_IGNORE_PATTERNS } from './constants.js'

export function createCopyFilter(
  ignoreList: readonly string[],
): (src: string) => boolean {
  return (src: string) => {
    const basename = path.basename(src)
    return !ignoreList.includes(basename)
  }
}

export async function copyTemplate(
  src: string,
  dest: string,
): Promise<void> {
  const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
  await fse.copy(src, dest, { filter })
}
