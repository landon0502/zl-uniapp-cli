export default function setupMock(config) {
	const { setup } = config
	if (process.env.NODE_ENV !== 'development') return
	setup()
}
