export function getApiBase() {
	return 'http://127.0.0.1:8000'
}

export async function apiFetch(path: string, options: RequestInit = {}) {
	const token = localStorage.getItem('token')
	const headers = new Headers(options.headers || {})
	headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
	headers.set('Accept', headers.get('Accept') || 'application/json')
	if (token) headers.set('Authorization', `Bearer ${token}`)

	const res = await fetch(`${getApiBase()}${path}`, { ...options, headers })
	if (!res.ok) throw new Error(await safeMessage(res))
	return res.json()
}

async function safeMessage(res: Response) {
	try {
		const j = await res.json()
		if ((j as any)?.errors && typeof (j as any).errors === 'object') {
			const msgs: string[] = []
			for (const k of Object.keys((j as any).errors)) {
				const arr = (j as any).errors[k]
				if (Array.isArray(arr)) msgs.push(...arr)
			}
			if (msgs.length) return msgs.join('\n')
		}
		return (j as any).message || res.statusText
	} catch {
		return res.statusText
	}
}
