export const logger = {
  info: (msg: string) => console.log(`\n${msg}\n`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
  error: (msg: string) => console.error(`\n❌ ${msg}\n`),
  step: (msg: string) => console.log(`  ${msg}`),
}
