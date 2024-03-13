import { type Post } from '@prisma/client'
import { prisma } from './prisma.server'

export const createPost = async (
  post: Pick<Post, 'title' | 'body' | 'userId'>
) => {
  return await prisma.post.create({
    data: post
  })
}