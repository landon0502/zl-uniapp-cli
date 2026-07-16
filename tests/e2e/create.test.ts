import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

describe('create CLI 集成测试', () => {
  let tempOutputDir: string

  beforeEach(() => {
    tempOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-create-'))
  })

  afterEach(() => {
    fs.rmSync(tempOutputDir, { recursive: true, force: true })
  })

  it('应完整创建项目：复制 → 替换 name → 目录结构完整', async () => {
    const options: CreateOptions = {
      name: 'my-test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'my-test-app')

    await executeCreate(options, targetDir)

    // 验证目标目录存在
    expect(fs.existsSync(targetDir)).toBe(true)

    // 验证 package.json 存在且 name 已替换
    const pkgPath = path.join(targetDir, 'package.json')
    expect(fs.existsSync(pkgPath)).toBe(true)
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(pkg.name).toBe('my-test-app')

    // 验证关键目录/文件存在
    expect(fs.existsSync(path.join(targetDir, 'src'))).toBe(true)
    expect(fs.existsSync(path.join(targetDir, 'index.html'))).toBe(true)
  })

  it('应排除忽略列表中的文件和目录', async () => {
    const options: CreateOptions = {
      name: 'ignore-test',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'ignore-test')

    await executeCreate(options, targetDir)

    // 验证忽略项未被复制
    expect(fs.existsSync(path.join(targetDir, 'node_modules'))).toBe(false)
    expect(fs.existsSync(path.join(targetDir, '.svn'))).toBe(false)
    expect(fs.existsSync(path.join(targetDir, '.DS_Store'))).toBe(false)
    expect(
      fs.existsSync(path.join(targetDir, 'package-lock.json')),
    ).toBe(false)
  })

  it('应保留 package.json 中除 name 外的所有字段', async () => {
    const options: CreateOptions = {
      name: 'field-preserve-test',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'field-preserve-test')

    await executeCreate(options, targetDir)

    const pkg = JSON.parse(
      fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'),
    )
    expect(pkg.name).toBe('field-preserve-test')
    expect(pkg.version).toBeDefined()
    expect(pkg.scripts).toBeDefined()
    expect(pkg.dependencies).toBeDefined()
    expect(pkg.devDependencies).toBeDefined()
  })

  it('目标目录已存在时 executeCreate 应抛出错误', async () => {
    const options: CreateOptions = {
      name: 'existing-dir',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'existing-dir')
    fs.mkdirSync(targetDir)
    fs.writeFileSync(path.join(targetDir, 'existing-file.txt'), 'old')

    // executeCreate 会直接 rename，如果目标已存在会抛错
    await expect(executeCreate(options, targetDir)).rejects.toThrow()
  })
})
