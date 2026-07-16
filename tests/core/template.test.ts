import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { discoverTemplates } from '../../src/core/template.js'

describe('discoverTemplates', () => {
  it('应发现 templates/ 目录下的直接子目录作为模板', async () => {
    const templates = await discoverTemplates()
    expect(templates.length).toBeGreaterThan(0)
    expect(templates[0]).toHaveProperty('name')
    expect(templates[0]).toHaveProperty('path')
  })

  it('应发现 uni-vue3 模板', async () => {
    const templates = await discoverTemplates()
    const uniVue3 = templates.find((t) => t.name === 'uni-vue3')
    expect(uniVue3).toBeDefined()
    expect(uniVue3!.path).toContain('templates/uni-vue3')
  })

  it('空目录应返回空数组', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-templates-'))
    try {
      const result = await discoverTemplates(tmpDir)
      expect(result).toEqual([])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('应忽略非目录文件', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-templates-'))
    try {
      fs.writeFileSync(path.join(tmpDir, 'readme.md'), 'hello')
      fs.mkdirSync(path.join(tmpDir, 'real-template'))
      const result = await discoverTemplates(tmpDir)
      expect(result).toEqual([
        { name: 'real-template', path: path.join(tmpDir, 'real-template') },
      ])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
