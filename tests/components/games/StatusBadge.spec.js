import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/games/StatusBadge.vue'

describe('StatusBadge', () => {
  it.each([
    ['COMPLETED', 'Completed', 'text-emerald-400'],
    ['PLAYING', 'Playing', 'text-sky-400'],
    ['BACKLOG', 'Backlog', 'text-slate-300'],
    ['WISHLIST', 'Wishlist', 'text-amber-400'],
    ['DROPPED', 'Dropped', 'text-red-400'],
  ])('shows %s as "%s" with its colour', (status, label, colour) => {
    const wrapper = mount(StatusBadge, { props: { status } })

    expect(wrapper.text()).toBe(label)
    expect(wrapper.classes()).toContain(colour)
  })

  it('only accepts the backend statuses', () => {
    expect(StatusBadge.props.status.validator('COMPLETE')).toBe(false)
  })
})
