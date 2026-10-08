import { mount } from '@vue/test-utils'
import FormField from '@/components/ui/FormField.vue'

describe('FormField', () => {
  it('links the label to the input', () => {
    const wrapper = mount(FormField, { props: { label: 'Username' } })

    expect(wrapper.find('label').attributes('for')).toBe(wrapper.find('input').attributes('id'))
  })

  it('updates the v-model value while typing', async () => {
    const wrapper = mount(FormField, {
      props: { label: 'Username', modelValue: '', 'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }) },
    })

    await wrapper.find('input').setValue('demo')

    expect(wrapper.props('modelValue')).toBe('demo')
  })

  it('shows the error and marks the input as invalid', () => {
    const wrapper = mount(FormField, { props: { label: 'Email', error: 'Email is not valid' } })

    expect(wrapper.find('[role="alert"]').text()).toBe('Email is not valid')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('lets the user show and hide a password', async () => {
    const wrapper = mount(FormField, { props: { label: 'Password', type: 'password' } })
    const input = () => wrapper.find('input').attributes('type')

    expect(input()).toBe('password')
    await wrapper.find('[data-test="toggle-password"]').trigger('click')
    expect(input()).toBe('text')
  })

  it('has no visibility toggle on normal fields', () => {
    const wrapper = mount(FormField, { props: { label: 'Username' } })

    expect(wrapper.find('[data-test="toggle-password"]').exists()).toBe(false)
  })
})
