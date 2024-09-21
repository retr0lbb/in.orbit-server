import z from 'zod'
//bilock

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
