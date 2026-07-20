import devConfig from './config/vite.dev'
import proConfig from './config/vite.pro'
const config = process.env.NODE_ENV === 'production' ? proConfig : devConfig
export default config
