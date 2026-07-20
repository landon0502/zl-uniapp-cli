import themes from './theme-vars'

let currentTheme = 'green'
export function setTheme(theme) {
	if (currentTheme === theme || !theme) {
		return
	}

	currentTheme = theme
	const themeVars = themes[theme]
	// #ifdef H5
	if (typeof document !== 'undefined') {
		Object.entries(themeVars).forEach(([key, value]) => {
			document.documentElement.style.setProperty(`--${key}`, value)
		})
	}
	// #endif
	// #ifdef APP
	let wvs = plus.webview.all()
	for (let i = 0; i < wvs.length; i++) {
		Object.entries(themeVars).forEach(([key, value]) => {
			wvs[i].evalJS(`window.document.documentElement.style.setProperty('--${key}','${value}')`)
		})
	}
	// #endif
}

export function getThemeVars() {
	return themes[currentTheme]
}

export function getCurrentTheme() {
	return currentTheme
}
