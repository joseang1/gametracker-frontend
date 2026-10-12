import { validateLogin, validateRegister } from '@/core/validators/auth-validators'

describe('auth validators', () => {
  describe('validateLogin', () => {
    it('accepts filled credentials', () => {
      expect(validateLogin({ username: 'demo', password: 'demo1234' })).toEqual({})
    })

    it('requires username and password', () => {
      expect(validateLogin({ username: ' ', password: '' })).toEqual({
        username: 'Username cannot be empty',
        password: 'Password cannot be empty',
      })
    })
  })

  describe('validateRegister', () => {
    const valid = { username: 'new_player', email: 'player@mail.com', password: 'secret123', confirmPassword: 'secret123' }

    it('accepts a valid account', () => {
      expect(validateRegister(valid)).toEqual({})
    })

    it.each([
      ['ab', 'Username must have between 3 and 30 characters'],
      ['a'.repeat(31), 'Username must have between 3 and 30 characters'],
      ['bad name!', 'Username can only contain letters, numbers and _'],
      ['', 'Username cannot be empty'],
    ])('rejects the username "%s"', (username, message) => {
      expect(validateRegister({ ...valid, username }).username).toBe(message)
    })

    it.each([
      ['not-an-email', 'Email is not valid'],
      ['', 'Email cannot be empty'],
      [`${'a'.repeat(115)}@mail.com`, 'Email is too long'],
    ])('rejects the email "%s"', (email, message) => {
      expect(validateRegister({ ...valid, email }).email).toBe(message)
    })

    it('rejects passwords shorter than 8 or longer than 72 characters', () => {
      expect(validateRegister({ ...valid, password: 'short', confirmPassword: 'short' }).password).toBeDefined()
      const long = 'x'.repeat(73)
      expect(validateRegister({ ...valid, password: long, confirmPassword: long }).password).toBeDefined()
    })

    it('requires both passwords to match', () => {
      expect(validateRegister({ ...valid, confirmPassword: 'different1' }).confirmPassword).toBe('Passwords do not match')
    })
  })
})
