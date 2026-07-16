import { describe, it, expect } from 'vitest'
import {
  COPY_IGNORE_PATTERNS,
  DEFAULT_PM,
  KEBAB_CASE_REGEX,
  PKG_ROOT,
  TEMPLATES_DIR,
} from '../src/constants.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

describe('constants', () => {
  it('COPY_IGNORE_PATTERNS 应包含必需的忽略项', () => {
    expect(COPY_IGNORE_PATTERNS).toContain('.svn')
    expect(COPY_IGNORE_PATTERNS).toContain('node_modules')
    expect(COPY_IGNORE_PATTERNS).toContain('.DS_Store')
    expect(COPY_IGNORE_PATTERNS).toContain('package-lock.json')
  })

  it('DEFAULT_PM 应为 pnpm', () => {
    expect(DEFAULT_PM).toBe('pnpm')
  })

  it('KEBAB_CASE_REGEX 应匹配合法 kebab-case 项目名', () => {
    expect(KEBAB_CASE_REGEX.test('my-app')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('uni-vue3')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('hello-world123')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('a')).toBe(true)
  })

  it('KEBAB_CASE_REGEX 应拒绝非法项目名', () => {
    expect(KEBAB_CASE_REGEX.test('My-App')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('my_app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('my app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('-start')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('123app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('')).toBe(false)
  })

  it('PKG_ROOT 应指向包根目录', () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const expected = path.resolve(__dirname, '../')
    expect(PKG_ROOT).toBe(expected)
  })

  it('TEMPLATES_DIR 应指向 templates 子目录', () => {
    expect(TEMPLATES_DIR).toBe(path.join(PKG_ROOT, 'templates'))
  })

  it('TEMPLATES_DIR 目录应存在', () => {
    expect(fs.existsSync(TEMPLATES_DIR)).toBe(true)
  })
})
