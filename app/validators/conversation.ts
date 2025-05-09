import vine from '@vinejs/vine'

export const storeValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(1),
  })
)
