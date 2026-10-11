import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminView from '@/views/AdminView.vue'
import AdminUserModel from '@/core/models/AdminUserModel'
import ReviewModel from '@/core/models/ReviewModel'
import ApiError from '@/core/http/ApiError'
import { adminUserMapper } from '@/core/mappers/admin-user-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('AdminView', () => {
  const user = (id, username, overrides = {}) =>
    AdminUserModel.createAdminUser(
      { id, username, email: `${username}@mail.com`, role: 'USER', banned: false, createdAt: '2026-10-07T15:44:59', ...overrides },
      adminUserMapper,
    )
  const review = (id) =>
    ReviewModel.createReview(
      {
        id,
        rating: 2,
        body: `Review ${id}`,
        createdAt: '2026-10-11T10:00:00',
        author: { id: 2, username: 'demo' },
        game: { id: 2, rawgId: 1, title: 'Hades', genres: [] },
      },
      reviewMapper,
    )

  let adminService

  const mountAdmin = async (path = '/admin') => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin', component: AdminView },
        { path: '/:any(.*)*', component: { template: '<div />' } },
      ],
    })
    router.push(path)
    await router.isReady()

    const wrapper = mount(AdminView, { global: { plugins: [router], provide: { AdminService: adminService } } })
    await flushPromises()
    return { wrapper, router }
  }

  const clickTwice = async (button) => {
    await button.trigger('click')
    await button.trigger('click')
    await flushPromises()
  }

  beforeEach(() => {
    adminService = {
      getStats: vi.fn().mockResolvedValue({ users: 3, bannedUsers: 0, games: 12, customGames: 1, reviews: 2, logs: 7 }),
      getUsers: vi.fn().mockResolvedValue({
        users: [user(1, 'admin', { role: 'ADMIN' }), user(2, 'demo'), user(3, 'spammer', { banned: true })],
        page: 0,
        totalPages: 1,
      }),
      setBanned: vi.fn(),
      getReviews: vi.fn().mockResolvedValue({ reviews: [review(1), review(2)], page: 0, totalPages: 1 }),
      deleteReview: vi.fn().mockResolvedValue(''),
    }
  })

  it('shows the site stats', async () => {
    const { wrapper } = await mountAdmin()

    const stats = wrapper.find('[data-test="stats"]').text()
    expect(stats).toContain('Games12')
    expect(stats).toContain('Logs7')
  })

  it('lists the players with their status', async () => {
    const { wrapper } = await mountAdmin()

    expect(adminService.getUsers).toHaveBeenCalledWith('', 0)
    expect(wrapper.find('[data-test="user-demo"]').text()).toContain('Active')
    expect(wrapper.find('[data-test="user-spammer"]').text()).toContain('Banned')
  })

  it('never offers to ban an admin', async () => {
    const { wrapper } = await mountAdmin()

    expect(wrapper.find('[data-test="user-admin"] [data-test="ban"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="user-spammer"] [data-test="ban"]').text()).toBe('Unban')
  })

  it('bans a player after confirming and refreshes the stats', async () => {
    adminService.setBanned.mockResolvedValue(user(2, 'demo', { banned: true }))
    const { wrapper } = await mountAdmin()

    await clickTwice(wrapper.find('[data-test="user-demo"] [data-test="ban"]'))

    expect(adminService.setBanned).toHaveBeenCalledWith(2, true)
    expect(wrapper.find('[data-test="user-demo"]').text()).toContain('Banned')
    expect(adminService.getStats).toHaveBeenCalledTimes(2)
  })

  it('shows why an action failed', async () => {
    adminService.setBanned.mockRejectedValue(new ApiError(403, 'Admins cannot be banned'))
    const { wrapper } = await mountAdmin()

    await clickTwice(wrapper.find('[data-test="user-demo"] [data-test="ban"]'))

    expect(wrapper.find('[data-test="action-error"]').text()).toBe('Admins cannot be banned')
  })

  it('searches players while typing, waiting for a pause', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountAdmin()

    await wrapper.find('[data-test="search"]').setValue('spam')
    vi.advanceTimersByTime(400)
    await flushPromises()
    vi.useRealTimers()

    expect(adminService.getUsers).toHaveBeenLastCalledWith('spam', 0)
  })

  it('moderates reviews in their own tab', async () => {
    const { wrapper, router } = await mountAdmin()

    await wrapper.find('[data-test="tab-reviews"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ tab: 'reviews' })
    expect(wrapper.find('[data-test="reviews"]').text()).toContain('Review 1')
  })

  it('deletes a review after confirming', async () => {
    const { wrapper } = await mountAdmin('/admin?tab=reviews')

    await clickTwice(wrapper.findAll('[data-test="delete-review"]')[0])

    expect(adminService.deleteReview).toHaveBeenCalledWith(1)
    expect(wrapper.find('[data-test="reviews"]').text()).not.toContain('Review 1')
    expect(wrapper.find('[data-test="reviews"]').text()).toContain('Review 2')
  })
})
