import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import { downloadTemplate } from '../../src/utils/download.js'

vi.mock('degit', () => {
  const mockClone = vi.fn()
  const mockOn = vi.fn().mockReturnThis()
  const mockEmitter = { clone: mockClone, on: mockOn }
  return { default: vi.fn(() => mockEmitter) }
})

describe('downloadTemplate', () => {
  let existsSyncSpy: ReturnType<typeof vi.spyOn>
  let rmSyncSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    existsSyncSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    rmSyncSpy = vi.spyOn(fs, 'rmSync')
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('应成功调用 degit clone', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockResolvedValue(undefined)

    await downloadTemplate('uni-vue3', '/tmp/test-dest')

    expect(degit).toHaveBeenCalledWith('landon0502/zl-uniapp-cli/templates/uni-vue3', {
      cache: false,
      force: true,
    })
    expect(emitter.clone).toHaveBeenCalledWith('/tmp/test-dest')
  })

  it('MISSING_REF 错误应显示模板不存在提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('not found') as Error & { code: string }
    err.code = 'MISSING_REF'
    emitter.clone.mockRejectedValue(err)
    existsSyncSpy.mockReturnValue(true)

    await expect(downloadTemplate('bad-template', '/tmp/test-dest')).rejects.toThrow(
      '模板 "bad-template" 不存在，请检查模板名称是否正确',
    )
    expect(rmSyncSpy).toHaveBeenCalledWith('/tmp/test-dest', { recursive: true, force: true })
  })

  it('MISSING_REPO 错误应显示仓库不存在提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('repo not found') as Error & { code: string }
    err.code = 'MISSING_REPO'
    emitter.clone.mockRejectedValue(err)
    existsSyncSpy.mockReturnValue(true)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '模板仓库不存在，请检查网络或联系维护者',
    )
  })

  it('网络错误应显示连接失败提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fetch failed'))
    existsSyncSpy.mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '网络连接失败，请检查网络后重试',
    )
  })

  it('未知 degit 错误应显示通用失败提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('some error') as Error & { code: string }
    err.code = 'UNKNOWN_CODE'
    emitter.clone.mockRejectedValue(err)
    existsSyncSpy.mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '模板拉取失败: some error',
    )
  })

  it('失败时应清理已存在的目标目录', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fail'))
    existsSyncSpy.mockReturnValue(true)

    await expect(downloadTemplate('uni-vue3', '/tmp/existing-dest')).rejects.toThrow()
    expect(rmSyncSpy).toHaveBeenCalledWith('/tmp/existing-dest', { recursive: true, force: true })
  })

  it('目标目录不存在时不应调用 rmSync', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fail'))
    existsSyncSpy.mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/new-dest')).rejects.toThrow()
    expect(rmSyncSpy).not.toHaveBeenCalled()
  })

  it('应注册 degit info 事件监听', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockResolvedValue(undefined)

    await downloadTemplate('uni-vue3', '/tmp/test-dest')

    expect(emitter.on).toHaveBeenCalledWith('info', expect.any(Function))
  })

  it('拉取时应显示正在拉取提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockResolvedValue(undefined)

    await downloadTemplate('uni-vue3', '/tmp/test-dest')

    expect(consoleLogSpy).toHaveBeenCalledWith('⠋ 正在拉取模板 uni-vue3...')
  })

  it('拉取成功时应显示完成提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockResolvedValue(undefined)

    await downloadTemplate('uni-vue3', '/tmp/test-dest')

    expect(consoleLogSpy).toHaveBeenCalledWith('✔ 模板拉取完成')
  })
})
