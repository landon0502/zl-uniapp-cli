import { pinyin } from '../../static/pinyin-pro/index.mjs'

export function chineseToPinyin(text) {
	return pinyin(text, { toneType: 'none' });
}