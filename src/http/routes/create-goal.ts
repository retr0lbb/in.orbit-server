import z from 'zod'
import { createGoal } from '../../functions/create-goal'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeeklyFrenquency: z.number().int().positive().min(1).max(7),
        }),
      },
    },
    async (request, reply) => {
      const { desiredWeeklyFrenquency, title } = request.body
      await createGoal({
        title: title,
        desiredWeeklyFrenquency: desiredWeeklyFrenquency,
      })
    }
  )
}
