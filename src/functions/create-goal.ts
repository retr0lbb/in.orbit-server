import { FastifyInstance } from 'fastify'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

interface createGoalRequest {
  title: string
  desiredWeeklyFrenquency: number
}

export async function createGoal({
  title,
  desiredWeeklyFrenquency,
}: createGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      desiredWeeklyFrenquency,
      title,
    })
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
