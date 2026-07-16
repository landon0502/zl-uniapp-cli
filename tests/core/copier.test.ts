import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { copyTemplate, createCopyFilter } from '../../src/core/copier.js'
import { COPY_IGNORE_PATTERNS } from '../../src/constants.js'

describe('createCopyFilter', () => {
  it('应排除忽略列表中的文件和目录', () => {
    const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
    expect(filter('/some/path/node_modules')).toBe(false)
    expect(filter('/some/path/.svn')).toBe(false)
    expect(filter('/some/path/.DS_Store')).toBe(false)
    expect(filter('/some/path/package-lock.json')).toBe(false)
  })

  it('应允许忽略列表之外的文件和目录', () => {
    const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
    expect(filter('/some/path/src')).toBe(true)
    expect(filter('/some/path/package.json')).toBe(true)
    expect(filter('/some/path/index.html')).toBe(true)
  })
})

describe('copyTemplate', () => {
  let srcDir: string
  let destDir: string

  beforeEach(() => {
    srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copier-src-'))
    destDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copier-dest-'))
  })

  afterEach(() => {
    fs.rmSync(srcDir, { recursive: true, force: true })
    fs.rmSync(destDir, { recursive: true, force: true })
  })

  it('应复制所有非忽略文件', async () => {
    fs.writeFileSync(path.join(srcDir, 'package.json'), '{"name": "test"}')
    fs.mkdirSync(path.join(srcDir, 'src'))
    fs.writeFileSync(path.join(srcDir, 'src/index.js'), 'console.log("hi")')

    await copyTemplate(srcDir, destDir)

    expect(fs.existsSync(path.join(destDir, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(destDir, 'src/index.js'))).toBe(true)
  })

  it('应排除忽略列表中的目录和文件', async () => {
    fs.writeFileSync(path.join(srcDir, 'package.json'), '{}')
    fs.mkdirSync(path.join(srcDir, 'node_modules'))
    fs.writeFileSync(
      path.join(srcDir, 'node_modules/pkg.js'),
      'should not copy',
    )
    fs.mkdirSync(path.join(srcDir, '.svn'))
    fs.writeFileSync(path.join(srcDir, '.svn/entries'), 'should not copy')
    fs.writeFileSync(path.join(srcDir, '.DS_Store'), 'should not copy')
    fs.writeFileSync(path.join(srcDir, 'package-lock.json'), '{}')

    await copyTemplate(srcDir, destDir)

    expect(fs.existsSync(path.join(destDir, 'node_modules'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, '.svn'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, '.DS_Store'))).toBe(false)
    expect(
      fs.existsSync(path.join(destDir, 'package-lock.json')),
    ).toBe(false)
    expect(fs.existsSync(path.join(destDir, 'package.json'))).toBe(true)
  })
})
