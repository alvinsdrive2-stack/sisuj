const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

interface QueueItem {
  fn: () => Promise<any>
  resolve: (val: any) => void
  reject: (err: any) => void
}

class ApiClient {
  private queue: QueueItem[] = []
  private running = 0
  private maxConcurrency = 1

  setMaxConcurrency(n: number) {
    this.maxConcurrency = n
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.enqueue(() =>
      fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json', ...this.authHeader(), ...options?.headers },
        ...options,
      }).then(this.handleResponse<T>)
    )
  }

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.enqueue(() =>
      fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...this.authHeader(),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      }).then(this.handleResponse<T>)
    )
  }

  async put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.enqueue(() =>
      fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...this.authHeader(),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      }).then(this.handleResponse<T>)
    )
  }

  async raw(path: string, options?: RequestInit): Promise<Response> {
    return this.enqueue(() =>
      fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...this.authHeader(), ...options?.headers },
      })
    )
  }

  private async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.process()
    })
  }

  private process() {
    if (this.running >= this.maxConcurrency) return
    const item = this.queue.shift()
    if (!item) return
    this.running++
    item
      .fn()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this.running--
        this.process()
      })
  }

  private authHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const body = await res.text()
      let msg: string
      try {
        const json = JSON.parse(body)
        msg = json.message || json.error || res.statusText
      } catch {
        msg = body || res.statusText
      }
      throw new ApiError(msg, res.status, body)
    }
    return res.json()
  }
  /** Patch global fetch — only intercept calls to BASE_URL, rest pass through */
  patchGlobal() {
    const originalFetch = window.fetch
    const self = this
    window.fetch = function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : ''
      if (url.startsWith(BASE_URL)) {
        return self.enqueue(() => originalFetch.call(window, input, init))
      }
      return originalFetch.call(window, input, init)
    }
  }
}

export class ApiError extends Error {
  status: number
  body: string
  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export const api = new ApiClient()
