import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { replaceProjectName } from '../../src/core/replacer.js'

describe('replaceProjectName', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'replacer-test-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('应替换 package.json 的 name 字段', async () => {
    const pkgPath = path.join(tempDir, 'package.json')
    fs.writeFileSync(pkgPath, JSON.stringify({ name: 'old-name', version: '1.0.0' }))

    await replaceProjectName(tempDir, 'my-new-app')

    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(content.name).toBe('my-new-app')
    expect(content.version).toBe('1.0.0')
  })

  it('不应修改 package.json 中的其他字段', async () => {
    const pkgPath = path.join(tempDir, 'package.json')
    const original = {
      name: 'template-name',
      version: '0.0.0',
      scripts: { dev: 'uni' },
      dependencies: { vue: '^3.0.0' },
    }
    fs.writeFileSync(pkgPath, JSON.stringify(original))

    await replaceProjectName(tempDir, 'new-project')

    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(content.name).toBe('new-project')
    expect(content.version).toBe('0.0.0')
    expect(content.scripts).toEqual({ dev: 'uni' })
    expect(content.dependencies).toEqual({ vue: '^3.0.0' })
  })

  it('当 package.json 不存在时应抛出错误', async () => {
    await expect(replaceProjectName(tempDir, 'my-app')).rejects.toThrow()
  })
})
