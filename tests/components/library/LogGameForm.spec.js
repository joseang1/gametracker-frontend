import { mount, flushPromises } from '@vue/test-utils'
import LogGameForm from '@/components/library/LogGameForm.vue'
import GameDetailModel from '@/core/models/GameDetailModel'
import GameLogModel from '@/core/models/GameLogModel'
import ReviewModel from '@/core/models/ReviewModel'
import ApiError from '@/core/http/ApiError'
import { gameDetailMapper } from '@/core/mappers/game-mapper'
import { gameLogMapper } from '@/core/mappers/game-log-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('LogGameForm', () => {
  const gameDto = { id: 2, rawgId: 274755, title: 'Hades', genres: [], platforms: ['PC', 'Nintendo Switch'] }
  const game = GameDetailModel.createGameDetail(gameDto, gameDetailMapper)
  const savedLog = GameLogModel.createGameLog({ id: 4, status: 'COMPLETED', favorite: true, game: gameDto }, gameLogMapper)
  const savedReview = ReviewModel.createReview(
    { id: 9, rating: 9, body: 'Great', createdAt: 'x', author: { id: 1, username: 'demo' }, game: gameDto },
    reviewMapper,
  )

  let gameLogService
  let reviewService

  const mountForm = (entry = { log: null, review: null }) =>
    mount(LogGameForm, {
      props: { game, entry },
      global: { provide: { GameLogService: gameLogService, ReviewService: reviewService } },
    })

  const chooseStatus = (wrapper, label) =>
    wrapper
      .findAll('[data-test="statuses"] button')
      .find((button) => button.text() === label)
      .trigger('click')

  const save = async (wrapper) => {
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  beforeEach(() => {
    gameLogService = { saveLog: vi.fn().mockResolvedValue(savedLog), deleteLog: vi.fn().mockResolvedValue('') }
    reviewService = { saveReview: vi.fn().mockResolvedValue(savedReview), deleteReview: vi.fn().mockResolvedValue('') }
  })

  it('logs a game with its status, platform, hours and favourite', async () => {
    const wrapper = mountForm()

    await chooseStatus(wrapper, 'Completed')
    await wrapper.find('[data-test="platform"]').setValue('Nintendo Switch')
    await wrapper.find('[data-test="hours"]').setValue('42')
    await wrapper.find('[data-test="favorite"]').trigger('click')
    await save(wrapper)

    expect(gameLogService.saveLog).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ status: 'COMPLETED', platform: 'Nintendo Switch', hoursPlayed: '42', favorite: true }),
    )
    expect(reviewService.saveReview).not.toHaveBeenCalled()
    expect(wrapper.emitted('change')[0][0]).toEqual({ log: savedLog, review: null })
  })

  it('saves a review with its rating, text and spoiler flag', async () => {
    const wrapper = mountForm()

    await wrapper.find('[aria-label="4.5 stars"]').trigger('click')
    await wrapper.find('[data-test="body"]').setValue('Loved it')
    await wrapper.find('[data-test="spoiler"]').setValue(true)
    await save(wrapper)

    expect(reviewService.saveReview).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ rating: 9, body: 'Loved it', spoiler: true }),
    )
    expect(gameLogService.saveLog).not.toHaveBeenCalled()
  })

  it('asks for a status or a rating before saving an empty form', async () => {
    const wrapper = mountForm()

    await save(wrapper)

    expect(wrapper.find('[data-test="form-error"]').text()).toBe('Choose a status or a rating to save.')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('needs a rating to post a written review', async () => {
    const wrapper = mountForm()

    await chooseStatus(wrapper, 'Playing')
    await wrapper.find('[data-test="body"]').setValue('No stars given')
    await save(wrapper)

    expect(wrapper.find('[data-test="rating-error"]').text()).toBe('Add a rating to post your review.')
    expect(gameLogService.saveLog).not.toHaveBeenCalled()
  })

  it('only accepts whole hours', async () => {
    const wrapper = mountForm()

    await chooseStatus(wrapper, 'Playing')
    await wrapper.find('[data-test="hours"]').setValue('ten')
    await save(wrapper)

    expect(wrapper.text()).toContain('Use whole hours, for example 12')
  })

  it('counts the characters left in the review', async () => {
    const wrapper = mountForm()

    await wrapper.find('[data-test="body"]').setValue('Hello')

    expect(wrapper.find('[data-test="remaining"]').text()).toBe('4995')
  })

  it('starts with what the user saved before', () => {
    const wrapper = mountForm({ log: savedLog, review: savedReview })

    expect(wrapper.find('[role="radio"][aria-checked="true"]').text()).toBe('Completed')
    expect(wrapper.find('[data-test="favorite"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('[data-test="body"]').element.value).toBe('Great')
  })

  it('does not let an existing review lose its rating silently', async () => {
    const wrapper = mountForm({ log: null, review: savedReview })

    await wrapper.find('[aria-label="4.5 stars"]').trigger('click')
    await save(wrapper)

    expect(wrapper.find('[data-test="rating-error"]').text()).toContain('Use "Delete review"')
  })

  it('shows backend errors', async () => {
    gameLogService.saveLog.mockRejectedValue(new ApiError(404, 'Game not found. Id 2 does not exist.'))
    const wrapper = mountForm()

    await chooseStatus(wrapper, 'Backlog')
    await save(wrapper)

    expect(wrapper.find('[data-test="form-error"]').text()).toContain('Game not found')
  })

  it('asks for a second click before removing the game from the library', async () => {
    const wrapper = mountForm({ log: savedLog, review: savedReview })
    const button = wrapper.find('[data-test="delete-log"]')

    await button.trigger('click')
    expect(gameLogService.deleteLog).not.toHaveBeenCalled()
    expect(button.text()).toBe('Click again to remove')

    await button.trigger('click')
    await flushPromises()

    expect(gameLogService.deleteLog).toHaveBeenCalledWith(2)
    expect(wrapper.emitted('change')[0][0]).toEqual({ log: null, review: savedReview })
  })

  it('deletes the review and keeps the log', async () => {
    const wrapper = mountForm({ log: savedLog, review: savedReview })

    await wrapper.find('[data-test="delete-review"]').trigger('click')
    await wrapper.find('[data-test="delete-review"]').trigger('click')
    await flushPromises()

    expect(reviewService.deleteReview).toHaveBeenCalledWith(2)
    expect(wrapper.emitted('change')[0][0]).toEqual({ log: savedLog, review: null })
  })

  it('only offers to delete what exists', () => {
    const wrapper = mountForm()

    expect(wrapper.find('[data-test="delete-log"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="delete-review"]').exists()).toBe(false)
  })
})
