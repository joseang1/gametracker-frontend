import { mount } from '@vue/test-utils'
import StarRatingInput from '@/components/ui/StarRatingInput.vue'

describe('StarRatingInput', () => {
  const mountInput = (modelValue = null) => {
    const wrapper = mount(StarRatingInput, {
      props: { modelValue, 'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }) },
    })
    return wrapper
  }
  const option = (wrapper, stars) => wrapper.find(`[aria-label="${stars} stars"]`)

  it('offers ten options, from half a star to five', () => {
    const labels = mountInput().findAll('[role="radio"]').map((radio) => radio.attributes('aria-label'))

    expect(labels).toHaveLength(10)
    expect(labels[0]).toBe('0.5 stars')
    expect(labels[9]).toBe('5 stars')
  })

  it('stores the rating on the 1 to 10 scale of the backend', async () => {
    const wrapper = mountInput()

    await option(wrapper, 3.5).trigger('click')

    expect(wrapper.props('modelValue')).toBe(7)
    expect(wrapper.find('[data-test="value"]').text()).toBe('3.5')
  })

  it('marks the chosen option', () => {
    expect(option(mountInput(9), 4.5).attributes('aria-checked')).toBe('true')
  })

  it('clears the rating when the same option is clicked again', async () => {
    const wrapper = mountInput(7)

    await option(wrapper, 3.5).trigger('click')

    expect(wrapper.props('modelValue')).toBeNull()
  })

  it('previews a rating while hovering without changing it', async () => {
    const wrapper = mountInput(4)

    await option(wrapper, 5).trigger('mouseenter')
    expect(wrapper.find('[data-test="value"]').text()).toBe('5.0')
    expect(wrapper.props('modelValue')).toBe(4)

    await wrapper.find('[data-test="stars"]').trigger('mouseleave')
    expect(wrapper.find('[data-test="value"]').text()).toBe('2.0')
  })

  it('moves by half a star with the arrow keys, within the limits', async () => {
    const wrapper = mountInput(9)
    const stars = wrapper.find('[data-test="stars"]')

    await stars.trigger('keydown', { key: 'ArrowRight' })
    await stars.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.props('modelValue')).toBe(10)

    await stars.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.props('modelValue')).toBe(9)
  })
})
