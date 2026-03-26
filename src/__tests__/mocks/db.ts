import { vi } from 'vitest'

// Deep mock factory for Prisma models
function createModelMock() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    upsert: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({}),
    groupBy: vi.fn().mockResolvedValue([]),
  }
}

export const mockDb = {
  user: createModelMock(),
  book: createModelMock(),
  userBook: createModelMock(),
  annotation: createModelMock(),
  readingLog: createModelMock(),
  readingGoal: createModelMock(),
  follow: createModelMock(),
  feedPost: createModelMock(),
  comment: createModelMock(),
  like: createModelMock(),
  notification: createModelMock(),
  achievement: createModelMock(),
  userAchievement: createModelMock(),
  pointsLog: createModelMock(),
  theme: createModelMock(),
  $transaction: vi.fn().mockImplementation((args) => {
    if (Array.isArray(args)) return Promise.resolve(args)
    return args(mockDb)
  }),
}

vi.mock('@/lib/db', () => ({
  db: mockDb,
}))
