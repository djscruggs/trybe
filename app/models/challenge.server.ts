import { prisma } from './prisma.server'
import type { ChallengeData } from '~/utils/types.server'
import z from 'zod'

export const createChallenge = async (challenge: prisma.challengeCreateInput): Promise<ChallengeData> => {
  const newChallenge = await prisma.challenge.create({
    data: challenge
  })
  return newChallenge
}
export const updateChallenge = async (challenge: prisma.challengeCreateInput): Promise<ChallengeData> => {
  return await prisma.challenge.update({
    where: { id: challenge.id },
    data: challenge
  })
}
export const loadChallenge = async (challengeId: string | number, userId: string | number | undefined) => {
  const id = Number(challengeId)
  const uid = Number(userId)
  return await prisma.challenge.findUnique({
    where: {
      id,
      userId: uid
    }
  })
}
export const loadChallengeSummary = async (challengeId: string | number, counts = false): Promise<Array<Record<string, any>>> => {
  const id = Number(challengeId)
  return await prisma.challenge.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  })
}
export const loadUserCreatedChallenges = async (userId: string | number) => {
  const uid = Number(userId)
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { members: true }
      }
    }
  })
}
export const deleteChallenge = async (challengeId: string | number) => {
  const id = Number(challengeId)
  // load the challenge first so you can get a handle to the coverPhoto
  const challenge = await prisma.challenge.findUnique({
    where: { id }
  })
  if (challenge?.coverPhoto) {
    try {
      const file = `${process.cwd()}/public${challenge.coverPhoto}`
      const fs = require('fs')
      await fs.unlink(file, (error: Error) => {
        if (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error('file does  not  exist', file)
          } else {
            throw error
          }
        }
      })
    } catch (error: any) {
      return error
    }
  }
  return await prisma.challenge.delete({
    where: {
      id
    }
  })
}
export const fetchChallenges = async (userId: string | number | undefined): Promise<Challenge[]> => {
  const uid = userId ? Number(userId) : undefined
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    }
  })
}
export const fetchChallengeSummaries = async (userId?: string | number | undefined) => {
  const uid = userId ? Number(userId) : undefined
  const params: prisma.challengeFindManyArgs = {
    where: userId ? { userId: uid } : undefined,
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  }
  return await prisma.challenge.findMany(params)
}
export const fetchChallengeMembers = async (cId: string | number): Promise<any> => {
  const params: prisma.memberChallengeFindManyArgs = {
    where: { challengeId: parseInt(cId.toString()) },
    include: {
      challenge: true,
      user: {
        include: {
          profile: true
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return await prisma.memberChallenge.findMany(params)
}
export const joinChallenge = async (userId: number, challengeId: number): Promise<any> => {
  return await prisma.memberChallenge.create({
    data: {
      userId,
      challengeId
    }
  })
}
export const unjoinChallenge = async (userId: number, challengeId: number): Promise<any> => {
  return await prisma.memberChallenge.delete({
    where: {
      challengeId_userId: {
        userId,
        challengeId
      }
    }
  })
}
export function getSchemaDefaults<Schema extends z.AnyZodObject> (schema: Schema) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
      return [key, undefined]
    })
  )
}
export const challengeSchema =
                    z.object({
                      name: z
                        .string()
                        .min(1, { message: 'Challenge name is required' }),
                      description: z
                        .string({ invalid_type_error: 'Wrong type' })
                        .min(1, { message: 'Description is required' }),
                      mission: z
                        .string({ invalid_type_error: 'Wrong type' })
                        .min(1, { message: 'Mission is required' }),
                      startAt: z
                        .date({ required_error: 'Please select a date' }),
                      endAt: z
                        .date()
                        .or(z.literal(''))
                        .nullable(),
                      frequency: z
                        .enum(['DAILY', 'WEEKDAYS', 'ALTERNATING', 'WEEKLY', 'CUSTOM']),
                      coverPhoto: z
                        .string()
                        .nullable()
                        .optional(),
                      icon: z
                        .string()
                        .nullable()
                        .optional(),
                      color: z
                        .string()
                        .nullable()
                        .optional(),
                      reminders: z
                        .boolean()
                        .default(false),
                      syncCalendar: z
                        .boolean()
                        .default(false),
                      publishAt: z
                        .string()
                        .pipe(z.coerce.date())
                        .or(z.date())
                        .or(z.literal(''))
                        .nullable()
                        .optional(),
                      published: z
                        .boolean()
                        .default(false),
                      userId: z
                        .coerce
                        .bigint()
                    })
