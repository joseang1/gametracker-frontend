import { mount } from '@vue/test-utils'
import UserAvatar from '@/components/ui/UserAvatar.vue'

describe('UserAvatar', () => {
  it('shows the picture when the user has one', () => {
    const wrapper = mount(UserAvatar, { props: { username: 'demo', avatarUrl: 'https://img/demo.png' } })

    expect(wrapper.find('img').attributes('src')).toBe('https://img/demo.png')
  })

  it('shows the initials when there is no picture', () => {
    const wrapper = mount(UserAvatar, { props: { username: 'aethel' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('AE')
  })

  it('always gives the same user the same colour', () => {
    const first = mount(UserAvatar, { props: { username: 'demo' } })
    const second = mount(UserAvatar, { props: { username: 'demo' } })

    expect(first.classes()).toEqual(second.classes())
  })
})
