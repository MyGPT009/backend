import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(12).maxLength(512),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(28),
    email: vine
      .string()
      .email()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(12).maxLength(512),
  })
)
