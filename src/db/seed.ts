import { client, db } from './index'
import { goalCompletions, goals } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const data = await db
    .insert(goals)
    .values([
      { title: 'Dormir mais de 8 horas', desiredWeeklyFrenquency: 5 },
      { title: 'Beber 2 litros de agua', desiredWeeklyFrenquency: 3 },
      { title: 'Ir a academia', desiredWeeklyFrenquency: 3 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: data[0].id, createdAt: startOfWeek.toDate() },
    { goalId: data[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
  ])
}

seed().finally(() => {
  client.end()
})
