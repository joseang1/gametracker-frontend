/*
 * Same rules and messages as the backend DTOs (LoginDTORequest, RegisterDTORequest),
 * so the user gets feedback before sending. The backend still validates everything.
 * Each function returns { field: message } with only the invalid fields.
 */
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isBlank = (value) => !value || !value.trim()

export function validateLogin({ username, password }) {
  const errors = {}
  if (isBlank(username)) errors.username = 'Username cannot be empty'
  if (isBlank(password)) errors.password = 'Password cannot be empty'
  return errors
}

export function validateRegister({ username, email, password, confirmPassword }) {
  const errors = {}

  if (isBlank(username)) errors.username = 'Username cannot be empty'
  else if (username.length < 3 || username.length > 30)
    errors.username = 'Username must have between 3 and 30 characters'
  else if (!USERNAME_PATTERN.test(username)) errors.username = 'Username can only contain letters, numbers and _'

  if (isBlank(email)) errors.email = 'Email cannot be empty'
  else if (email.length > 120) errors.email = 'Email is too long'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Email is not valid'

  if (isBlank(password)) errors.password = 'Password cannot be empty'
  else if (password.length < 8 || password.length > 72)
    errors.password = 'Password must have between 8 and 72 characters'

  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'

  return errors
}
