import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekSummary() {
  const fistDayOfWeek = dayjs().startOf('week').toDate()
  const lasdDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrenquency: goals.desiredWeeklyFrenquency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lasdDayOfWeek))
  )

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
            DATE(${goalCompletions.createdAt})
        `.as('completedAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, fistDayOfWeek),
          lte(goalCompletions.createdAt, lasdDayOfWeek)
        )
      )
  )

  const goalsCompledteByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql`
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    "id", ${goalsCompletedInWeek.id},
                    "title", ${goalsCompletedInWeek.title},
                    "completedAt", ${goalsCompletedInWeek.completedAt}   
                )
            )
        `.as('completions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate.sql)
  )

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompledteByWeekDay)
    .select()
    .from(goalsCompledteByWeekDay)

  return {
    summary: result,
  }
}
