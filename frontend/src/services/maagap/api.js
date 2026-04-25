const configuredBase =
  import.meta.env.VITE_API_URL

export const apiUrl = (path) => {
  const trimmedPath = path.replace(/^\//, '')
  return `/api/${trimmedPath}`
}

export const apiFetch = async (path, { method = 'GET', headers = {}, body, token, ...options } = {}) => {
  const url = apiUrl(path)
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  }

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(url, init)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `${response.status} ${response.statusText}`)
  }

  return data
}