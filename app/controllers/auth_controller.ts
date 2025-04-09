import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.ok({ token: token, ...user.serialize() })
    } catch {
      return response.badRequest({ message: 'Invalid credentials' })
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)
      const user = await User.create(payload)
      return response.created(user)
    } catch {
      return response.badRequest({ message: 'Registration failed' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const token = auth.user?.currentAccessToken.identifier
      if (!token) return response.badRequest({ message: 'Token not found' })

      await User.accessTokens.delete(auth.getUserOrFail(), token)
      return response.ok({ message: 'Logged out' })
    } catch {
      return response.badRequest({ message: 'Logout failed' })
    }
  }
}
