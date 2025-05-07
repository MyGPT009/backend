import { Server } from 'socket.io'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import env from '#start/env'

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    cors: {
      origin: [env.get('FRONTEND_URL')],
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('joinConversation', (conversationId) => {
      const stringConversationId = String(conversationId) // Assure que c'est une string
      console.log(`🔹 User ${socket.id} joined conversation: ${stringConversationId}`)
      socket.join(stringConversationId)
    })

    socket.on('newMessage', (data) => {
      const stringConversationId = String(data.channelId) // Assure que c'est une string
      console.log(`🔹 Message reçu: ${data.content} (Channel: ${stringConversationId})`)
      io.to(stringConversationId).emit('newMessage', data)
    })

    socket.on('disconnect', () => {
      console.log(`🔻 User disconnected: ${socket.id}`)
    })
  })
})
