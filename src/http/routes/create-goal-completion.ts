import z from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../../functions/create-goal-completion'

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/completions',
    {
      schema: {
        body: z.object({
          goalId: z.string().cuid2(),
        }),
      },
    },
    async (request, reply) => {
      const { goalId } = request.body

      await createGoalCompletion({
        goalId,
      })

      return reply
        .status(200)
        .send({ status: 200, message: 'Goal completed with sucess' })
    }
  )
}
