import { useAsync } from '@/composables/useAsync'
import ApiError from '@/core/http/ApiError'

describe('useAsync', () => {
  it('starts with the initial value and not loading', () => {
    const { data, isLoading, error } = useAsync(vi.fn(), [])

    expect(data.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('stores what the loader returns', async () => {
    const { data, run } = useAsync(() => Promise.resolve(['Hades']), [])

    await run()

    expect(data.value).toEqual(['Hades'])
  })

  it('passes its arguments to the loader', async () => {
    const loader = vi.fn().mockResolvedValue({})
    const { run } = useAsync(loader)

    await run(42)

    expect(loader).toHaveBeenCalledWith(42)
  })

  it('is loading only while the loader runs', async () => {
    let finish
    const { isLoading, run } = useAsync(() => new Promise((resolve) => (finish = resolve)))

    const pending = run()
    expect(isLoading.value).toBe(true)
    finish()
    await pending

    expect(isLoading.value).toBe(false)
  })

  it('keeps the error message when the loader fails', async () => {
    const { error, run } = useAsync(() => Promise.reject(new Error('Game not found')))

    await run()

    expect(error.value).toBe('Game not found')
  })

  it('clears the previous error when retrying', async () => {
    const loader = vi.fn().mockRejectedValueOnce(new Error('Timeout')).mockResolvedValue('ok')
    const { error, data, run } = useAsync(loader)

    await run()
    await run()

    expect(error.value).toBe('')
    expect(data.value).toBe('ok')
  })

  it('remembers the HTTP status of the error', async () => {
    const { errorStatus, run } = useAsync(() => Promise.reject(new ApiError(404, 'Game not found')))

    await run()

    expect(errorStatus.value).toBe(404)
  })
})
