import { pinyin } from '../../static/pinyin-pro/corejs/index.mjs'

export function chineseToPinyin(text) {
	return pinyin(text, { toneType: 'none' });
}