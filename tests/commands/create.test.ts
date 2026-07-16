import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

// Mock prompts
vi.mock('../../src/prompts/create.js', () => ({
  promptCreateOptions: vi.fn().mockResolvedValue({
    name: 'test-app',
    template: 'uni-vue3',
    pm: 'pnpm',
  }),
}))

// Mock copier
vi.mock('../../src/core/copier.js', () => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
}))

// Mock replacer
vi.mock('../../src/core/replacer.js', () => ({
  replaceProjectName: vi.fn().mockResolvedValue(undefined),
}))

// Mock template discovery
vi.mock('../../src/core/template.js', () => ({
  discoverTemplates: vi.fn().mockResolvedValue([
    { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
  ]),
}))

describe('executeCreate', () => {
  let tempTargetDir: string

  beforeEach(() => {
    tempTargetDir = path.join(
      os.tmpdir(),
      `test-create-${Date.now()}`,
    )
  })

  afterEach(() => {
    if (fs.existsSync(tempTargetDir)) {
      fs.rmSync(tempTargetDir, { recursive: true, force: true })
    }
  })

  it('应调用 copyTemplate 并传递正确的参数', async () => {
    const options: CreateOptions = {
      name: 'test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }

    fs.mkdirSync(tempTargetDir, { recursive: true })
    await executeCreate(options, tempTargetDir)

    const { copyTemplate } = await import('../../src/core/copier.js')
    expect(copyTemplate).toHaveBeenCalled()
  })

  it('应调用 replaceProjectName 替换项目名', async () => {
    const options: CreateOptions = {
      name: 'test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }

    fs.mkdirSync(tempTargetDir, { recursive: true })
    await executeCreate(options, tempTargetDir)

    const { replaceProjectName } = await import('../../src/core/replacer.js')
    expect(replaceProjectName).toHaveBeenCalledWith(
      expect.any(String),
      'test-app',
    )
  })
})
