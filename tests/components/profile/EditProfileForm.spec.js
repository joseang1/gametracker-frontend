import { mount, flushPromises } from '@vue/test-utils'
import EditProfileForm from '@/components/profile/EditProfileForm.vue'
import ProfileModel from '@/core/models/ProfileModel'
import ApiError from '@/core/http/ApiError'
import { profileMapper } from '@/core/mappers/profile-mapper'

describe('EditProfileForm', () => {
  const profile = ProfileModel.createProfile(
    { id: 2, username: 'demo', role: 'USER', bio: 'Old bio', avatarUrl: null, joinedAt: '2026-10-07T15:44:59' },
    profileMapper,
  )
  const updated = ProfileModel.createProfile(
    { id: 2, username: 'demo', role: 'USER', bio: 'New bio', avatarUrl: 'https://img/me.png', joinedAt: '2026-10-07T15:44:59' },
    profileMapper,
  )
  let userService

  const mountForm = () =>
    mount(EditProfileForm, { props: { profile }, global: { provide: { UserService: userService } } })

  const save = async (wrapper) => {
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  beforeEach(() => {
    userService = { updateMyProfile: vi.fn().mockResolvedValue(updated) }
  })

  it('starts with the current bio', () => {
    expect(mountForm().find('[data-test="bio"]').element.value).toBe('Old bio')
  })

  it('saves the bio and the avatar and hands back the updated profile', async () => {
    const wrapper = mountForm()

    await wrapper.find('[data-test="bio"]').setValue('New bio')
    await wrapper.find('input[type="url"]').setValue('https://img/me.png')
    await save(wrapper)

    expect(userService.updateMyProfile).toHaveBeenCalledWith(
      expect.objectContaining({ bio: 'New bio', avatarUrl: 'https://img/me.png' }),
    )
    expect(wrapper.emitted('saved')[0][0]).toBe(updated)
  })

  it('previews a valid avatar link', async () => {
    const wrapper = mountForm()

    await wrapper.find('input[type="url"]').setValue('https://img/me.png')

    expect(wrapper.find('[data-test="preview"]').attributes('src')).toBe('https://img/me.png')
  })

  it('rejects avatar links that are not http(s)', async () => {
    const wrapper = mountForm()

    await wrapper.find('input[type="url"]').setValue('ftp://img/me.png')
    await save(wrapper)

    expect(wrapper.text()).toContain('Avatar must be a valid http(s) URL')
    expect(userService.updateMyProfile).not.toHaveBeenCalled()
  })

  it('counts the characters left and stops bios that are too long', async () => {
    const wrapper = mountForm()

    await wrapper.find('[data-test="bio"]').setValue('x'.repeat(301))
    expect(wrapper.find('[data-test="remaining"]').text()).toBe('-1')

    await save(wrapper)
    expect(userService.updateMyProfile).not.toHaveBeenCalled()
  })

  it('shows backend errors', async () => {
    userService.updateMyProfile.mockRejectedValue(new ApiError(0, 'Cannot reach the server. Is the backend running?'))
    const wrapper = mountForm()

    await save(wrapper)

    expect(wrapper.find('[data-test="form-error"]').text()).toContain('Cannot reach the server')
  })
})
