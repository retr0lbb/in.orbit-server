import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface createGoalCompletionRequest {
  goalId: string
}
export async function createGoalCompletion({
  goalId,
}: createGoalCompletionRequest) {
  const fistDayOfWeek = dayjs().startOf('week').toDate()
  const lasdDayOfWeek = dayjs().endOf('week').toDate()
  const goalCompletionCounts = db.$with('goal_completion_count').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, fistDayOfWeek),
          lte(goalCompletions.createdAt, lasdDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrenquency: goals.desiredWeeklyFrenquency,
      completionCount: sql`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))

  const { completionCount, desiredWeeklyFrenquency } = result[0]

  if (completionCount >= desiredWeeklyFrenquency) {
    throw new Error('Cannot complete goal beyond limit')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()
  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
