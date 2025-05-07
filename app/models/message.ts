import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'
import Conversation from '#models/conversation'
import User from '#models/user'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare content: string

  @column()
  declare aiResponse: string

  @column()
  declare conversationId: string

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Conversation)
  declare conversation: relations.BelongsTo<typeof Conversation>

  @belongsTo(() => User)
  declare author: relations.BelongsTo<typeof User>
}
