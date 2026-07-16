import { describe, it, expect, vi, beforeEach } from 'vitest'
import { promptCreateOptions } from '../../src/prompts/create.js'
import type { PartialCreateOptions } from '../../src/constants.js'

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}))

// Mock template discovery
vi.mock('../../src/core/template.js', () => ({
  discoverTemplates: vi.fn().mockResolvedValue([
    { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
    { name: 'uni-react', path: '/fake/templates/uni-react' },
  ]),
}))

import inquirer from 'inquirer'

// With ESM default import, `inquirer` resolves to the `default` property of the module
// So `inquirer.prompt` is the mock function, not `inquirer.default.prompt`
const mockPrompt = inquirer.prompt as ReturnType<typeof vi.fn>

describe('promptCreateOptions', () => {
  beforeEach(() => {
    mockPrompt.mockReset()
  })

  it('当所有参数已提供时，应跳过所有交互', async () => {
    const input: PartialCreateOptions = {
      name: 'my-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result).toEqual({
      name: 'my-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    })
    expect(mockPrompt).not.toHaveBeenCalled()
  })

  it('当项目名缺失时，应提示输入', async () => {
    mockPrompt.mockResolvedValueOnce({
      name: 'my-app',
    })
    const input: PartialCreateOptions = {
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.name).toBe('my-app')
  })

  it('当项目名不合法时，应提示重新输入', async () => {
    // Inquirer's validate function would prevent invalid input in real usage,
    // so the mock returns a valid name directly
    mockPrompt.mockResolvedValueOnce({
      name: 'my-app',
    })
    const input: PartialCreateOptions = {
      name: 'My App',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.name).toBe('my-app')
    expect(mockPrompt).toHaveBeenCalledTimes(1)
  })

  it('当模板缺失时，应提示选择', async () => {
    mockPrompt.mockResolvedValueOnce({
      template: 'uni-vue3',
    })
    const input: PartialCreateOptions = {
      name: 'my-app',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.template).toBe('uni-vue3')
  })

  it('当包管理器缺失时，应提示选择', async () => {
    mockPrompt.mockResolvedValueOnce({ pm: 'pnpm' })
    const input: PartialCreateOptions = {
      name: 'my-app',
      template: 'uni-vue3',
    }
    const result = await promptCreateOptions(input)
    expect(result.pm).toBe('pnpm')
  })

  it('仅一个模板时应跳过模板选择', async () => {
    const { discoverTemplates } = await import('../../src/core/template.js')
    vi.mocked(discoverTemplates).mockResolvedValueOnce([
      { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
    ])
    mockPrompt.mockResolvedValueOnce({ pm: 'pnpm' })
    const input: PartialCreateOptions = {
      name: 'my-app',
    }
    const result = await promptCreateOptions(input)
    expect(result.template).toBe('uni-vue3')
  })
})
