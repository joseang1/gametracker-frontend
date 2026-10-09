import httpClient from '@/core/http/http-client'

export default class Repository {
  constructor(uri, client = httpClient) {
    this.uri = uri
    this.client = client
  }

  getUri() {
    return this.uri
  }

  async get(path = '', params = {}) {
    const response = await this.client.get(this.uri + path, { params })
    return response.data
  }

  async post(path = '', body = {}) {
    const response = await this.client.post(this.uri + path, body)
    return response.data
  }

  async put(path = '', body = {}) {
    const response = await this.client.put(this.uri + path, body)
    return response.data
  }

  async patch(path = '', body = {}) {
    const response = await this.client.patch(this.uri + path, body)
    return response.data
  }

  async delete(path = '') {
    const response = await this.client.delete(this.uri + path)
    return response.data
  }
}
