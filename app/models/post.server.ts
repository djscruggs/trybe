import { type Post } from '@prisma/client'
import { prisma } from './prisma.server'
import { deleteFromCloudinary } from '~/utils/uploadFile'
export const createPost = async (
  post: Pick<Post, 'title' | 'body' | 'userId'>
) => {
  return await prisma.post.create({
    data: post
  })
}
export const updatePost = async (post: prisma.postCreateInput): Promise<Post> => {
  // extract id, computed and other fields that prisma sqawks about on updated
  const { id, challengeId, userId, live, ...data } = post
  return await prisma.post.update({
    where: { id },
    data
  })
}
export const loadPost = async (postId: string | number): Promise<Post | null> => {
  const id = Number(postId)
  return await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}
export const loadPostSummary = async (postId: string | number): Promise<Post | null> => {
  const id = Number(postId)
  return await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      },
      challenge: true,
      user: {
        include: { profile: true }
      }
    }
  })
}
export const loadUserPosts = async (userId: string | number): Promise<Post[]> => {
  const uid = Number(userId)
  return await prisma.post.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { likes: true, comments: true }
      }
    }
  })
}
export const deletePost = async (postId: number, userId: number): Promise<Post> => {
  const id = Number(postId)
  const uid = Number(userId)
  const post = await loadPost(id)
  if (post?.videoMeta?.public_id) {
    await deleteFromCloudinary(post.videoMeta.public_id as string, 'video')
  }
  if (post?.imageMeta?.public_id) {
    await deleteFromCloudinary(post.imageMeta.public_id as string, 'image')
  }

  return await prisma.post.delete({
    where: {
      id,
      userId: uid
    }
  })
}
export const fetchPosts = async (): Promise<Post[]> => {
  return await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}

export const fetchUserPosts = async (userId: number, includeDrafts = false): Promise<Post[]> => {
  return await prisma.post.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      },
      user: {
        include: {
          profile: true
        }
      }
    }
  })
}
