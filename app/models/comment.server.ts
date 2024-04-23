import { prisma } from './prisma.server'

interface FetchCommentsParams {
  challengeId?: number
  postId?: number
}

export const fetchComments = async (params: FetchCommentsParams): Promise<prisma.comment[]> => {
  const { challengeId, postId } = params
  if (!challengeId && !postId) {
    throw new Error('challengeId or postId must be provided')
  }
  const comments = await prisma.comment.findMany({
    where: {
      OR: [
        { challengeId: challengeId ? Number(challengeId) : undefined },
        { postId: postId ? Number(postId) : undefined }
      ]
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })
  return comments
}

export const createComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  console.log('comment data', comment)
  try {
    const newComment = await prisma.comment.create({
      data: comment
    })
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
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const loadComment = async (commentId: string | number, userId: string | number | undefined): Promise<prisma.comment> => {
  const id = Number(commentId)
  const uid = Number(userId)
  return await prisma.comment.findUnique({
    where: {
      id,
      userId: uid
    },
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
  return await prisma.comment.delete({
    where: {
      id
    }
  })
}
