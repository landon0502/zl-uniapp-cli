class RouteDataPipeline {
	cache = new Map()
	create({ from, to, params, data, onBack }) {
		this.cache.set(to, {
			from,
			to,
			params,
			data,
			onBack
		})
	}
	get(id) {
		const ctx = this.cache.get(id)
		return ctx
	}
	remove(id) {
		this.cache.delete(id)
	}
	has(id) {
		this.cache.has(id)
	}
	clear() {
		this.cache.clear()
	}
}
export default RouteDataPipeline
