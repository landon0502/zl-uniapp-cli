import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

vi.mock('../../src/utils/download.js', () => ({
  downloadTemplate: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@zlskuniapp/shared', () => ({
  replaceProjectName: vi.fn().mockResolvedValue(undefined),
}))

describe('executeCreate', () => {
  const defaultOptions: CreateOptions = {
    name: 'test-app',
    template: 'uni-vue3',
    pm: 'pnpm',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应调用 downloadTemplate 并传递模板名和临时目录', async () => {
    const { downloadTemplate } = await import('../../src/utils/download.js')
    const targetDir = path.join(os.tmpdir(), 'create-app-test-target')

    await executeCreate(defaultOptions, targetDir)

    expect(downloadTemplate).toHaveBeenCalledWith('uni-vue3', expect.any(String))

    // 清理
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  })

  it('应调用 replaceProjectName 并传递临时目录和项目名', async () => {
    const { replaceProjectName } = await import('@zlskuniapp/shared')
    const targetDir = path.join(os.tmpdir(), 'create-app-test-target')

    await executeCreate(defaultOptions, targetDir)

    expect(replaceProjectName).toHaveBeenCalledWith(expect.any(String), 'test-app')

    // 清理
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  })

  it('downloadTemplate 失败时应清理临时目录并抛出错误', async () => {
    const { downloadTemplate } = await import('../../src/utils/download.js')
    ;(downloadTemplate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('模板拉取失败'))

    const targetDir = path.join(os.tmpdir(), 'create-app-test-fail')

    await expect(executeCreate(defaultOptions, targetDir)).rejects.toThrow('模板拉取失败')

    // 目标目录不应存在
    expect(fs.existsSync(targetDir)).toBe(false)
  })
})
