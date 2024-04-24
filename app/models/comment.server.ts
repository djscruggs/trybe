import { prisma } from './prisma.server'

interface FetchCommentsParams {
  challengeId?: number
  postId?: number
}
function generateIncludeObject (levels: number): any {
  if (levels <= 0) {
    return true
  }
  return {
    user: {
      include: {
        profile: true
      }
    },
    replies: { include: generateIncludeObject(levels - 1) }
  }
}
function printIncludes (includes: any, level: number = 0) {
  for (const key in includes) {
    if (typeof includes[key] === 'object') {
      console.log(' '.repeat(level * 2) + key)
      printIncludes(includes[key], level + 1)
    } else {
      console.log(' '.repeat(level * 2) + key + ': ' + includes[key])
    }
  }
}

export const fetchComments = async (params: FetchCommentsParams): Promise<prisma.comment[]> => {
  const { challengeId, postId } = params
  if (!challengeId && !postId) {
    throw new Error('challengeId or postId must be provided')
  }
  const includes = generateIncludeObject(5)
  console.log('includes')
  printIncludes(includes)
  const comments = await prisma.comment.findMany({
    where: {
      AND: {
        replyToId: null,
        OR: [
          { challengeId: challengeId ? Number(challengeId) : undefined },
          { postId: postId ? Number(postId) : undefined }
        ]
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: includes
  })
  return comments
}
export const fetchReplies = async (commentId: string | number): Promise<prisma.comment[]> => {
  const id = Number(commentId)
  const includes = generateIncludeObject(5)
  return await prisma.comment.findUnique({
    where: { id },
    orderBy: {
      createdAt: 'desc'
    },
    include: includes
  })
}

export const createComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  console.log('comment data', comment)
  try {
    const newComment = await prisma.comment.create({
      data: comment
    })
    void upateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const updateComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  const id = Number(comment.id)
  delete comment.id
  try {
    const newComment = await prisma.comment.update({
      where: { id },
      data: comment
    })
    // update counts of replies
    void upateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const loadComment = async (commentId: string | number, userId?: string | number | undefined): Promise<prisma.comment> => {
  const id = Number(commentId)
  const where: prisma.commentWhereUniqueInput = { id }
  if (userId) {
    where.userId = Number(userId)
  }
  return await prisma.comment.findUnique({
    where,
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })
}

export const deleteComment = async (commentId: string | number): Promise<prisma.comment> => {
  const id = Number(commentId)
  const deleted = await prisma.comment.delete({
    where: {
      id
    }
  })
  void upateCounts(deleted)
  return deleted
}

const upateCounts = async (comment: prisma.comment): Promise<void> => {
  console.log('updaeCounts', comment)
  let count = 0
  if (comment.replyToId) {
    const replyToId = Number(comment.replyToId)
    count = await prisma.comment.count({
      where: { replyToId }
    })
    await prisma.comment.update({
      where: { id: replyToId },
      data: { replyCount: count }
    })
  }
  if (comment.postId) {
    const postId = Number(comment.postId)
    count = await prisma.comment.count({
      where: { postId }
    })
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: count }
    })
  }
  if (comment.challengeId) {
    const challengeId = Number(comment.challengeId)
    count = await prisma.comment.count({
      where: { challengeId }
    })
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { commentCount: count }
    })
  }
}
