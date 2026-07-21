import degit from 'degit'
import fs from 'node:fs'
import ora from 'ora'

const TEMPLATE_REPO = 'landon0502/zl-uniapp-cli/templates'

export async function downloadTemplate(
  template: string,
  dest: string,
): Promise<void> {
  const spinner = ora(`正在拉取模板 ${template}...`)

  const emitter = degit(`${TEMPLATE_REPO}/${template}`, {
    cache: false,
    force: true,
  })

  emitter.on('info', (info: { message: string }) => {
    spinner.text = info.message
  })

  spinner.start()

  try {
    await emitter.clone(dest)
    spinner.succeed('模板拉取完成')
  } catch (err: unknown) {
    spinner.fail('模板拉取失败')

    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }

    if (isDegitError(err)) {
      switch (err.code) {
        case 'MISSING_REF':
          throw new Error(`模板 "${template}" 不存在，请检查模板名称是否正确`)
        case 'MISSING_REPO':
          throw new Error('模板仓库不存在，请检查网络或联系维护者')
        default:
          throw new Error(`模板拉取失败: ${err.message}`)
      }
    }

    if (err instanceof Error) {
      throw new Error('网络连接失败，请检查网络后重试')
    }

    throw new Error(`模板拉取失败: ${String(err)}`)
  }
}

function isDegitError(err: unknown): err is Error & { code: string } {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as Error & { code: string }).code === 'string'
  )
}
