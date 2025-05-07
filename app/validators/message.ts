import vine from '@vinejs/vine'

export const storeValidator = vine.compile(
  vine.object({
    content: vine.string().minLength(1),
  })
)
