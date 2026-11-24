import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'mock-user-id' } },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

class TestResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new Headers(init.headers)
  }

  static json(data, init = {}) {
    const response = new TestResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    })
    return response
  }

  async json() {
    return JSON.parse(this.body)
  }

  get headers() {
    return this._headers
  }

  set headers(value) {
    this._headers = value
  }
}

global.Response ??= TestResponse

class Headers {
  constructor(init = {}) {
    this._headers = {}
    if (typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => {
        this._headers[key.toLowerCase()] = value
      })
    }
  }

  get(name) {
    return this._headers[name.toLowerCase()]
  }

  set(name, value) {
    this._headers[name.toLowerCase()] = value
  }
}
