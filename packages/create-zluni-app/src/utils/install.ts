import { execa } from 'execa'
import type { PackageManager } from '../constants.js'

export async function installDependencies(
  dir: string,
  pm: PackageManager,
): Promise<void> {
  try {
    await execa(pm, ['install'], { cwd: dir, stdio: 'inherit' })
  } catch (error) {
    console.error(`\n❌ 依赖安装失败，请手动运行: cd ${dir} && ${pm} install\n`)
    throw error
  }
}
