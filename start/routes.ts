import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const MessagesController = () => import('#controllers/messages_controller')
const ConversationsController = () => import('#controllers/conversations_controller')

router
  .group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.delete('logout', [AuthController, 'logout']).use(middleware.auth())
    router
      .get('me', async ({ auth, response }) => {
        try {
          const user = auth.getUserOrFail()
          return response.ok(user)
        } catch (error) {
          return response.unauthorized({ error: 'User not found' })
        }
      })
      .use(middleware.auth())
  })
  .prefix('auth')

router
  .group(() => {
    router.get('', [ConversationsController, 'index']).use(middleware.auth())
    router.post('/new', [ConversationsController, 'store']).use(middleware.auth())
  })
  .prefix('conversation')

router
  .group(() => {
    router.get('conversation/:conversationId', [MessagesController, 'index'])
    router
      .post('conversation/:conversationId/send', [MessagesController, 'send'])
      .use(middleware.auth())
  })
  .prefix('message')
