import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'
import Message from '#models/message'
import User from '#models/user'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare userId: number // Ajout du propriétaire

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Message)
  declare messages: relations.HasMany<typeof Message>

  @belongsTo(() => User)
  declare owner: relations.BelongsTo<typeof User> // propriétaire de la conversation
}
