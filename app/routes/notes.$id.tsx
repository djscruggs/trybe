import { loadNoteSummary, loadRepost } from '~/models/note.server'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'

import CardNote from '~/components/cardNote'
import { requireCurrentUser } from '../models/auth.server'
import type { ObjectData, Note } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '../models/prisma.server'

interface NoteObjectData {
  note: Note
  hasLiked: boolean
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const note = await loadNoteSummary(params.id)
  if (!note) {
    const error = { loadingError: 'Note not found' }
    return json(error)
  }
  // load memberships & likes for current user if it exists
  let hasReposted = false
  let hasLiked = false
  if (currentUser) {
    // has the user liked this note?
    const likes = await prisma.like.count({
      where: {
        noteId: note.id,
        userId: Number(currentUser.id)
      }
    })
    hasLiked = likes > 0
    // has the user reposted this note?
    const reposted = await loadRepost(note.id, currentUser.id, null)
    if (reposted) {
      hasReposted = true
    }
  }
  // get count of resposts
  const repostCount = await prisma.note.count({
    where: {
      replyToId: note.id,
      body: null
    }
  })
  // get replies
  const replies = await prisma.note.findMany({
    where: {
      replyToId: note.id,
      body: {
        not: null
      }
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })
  const data: NoteObjectData = { note, hasLiked, hasReposted, repostCount, replies }
  return json(data)
}

export default function ViewNote (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit') || location.pathname.includes('quote')) {
    return <Outlet />
  }

  const data: ObjectData = useLoaderData() as ObjectData
  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.note) {
    return <p>Loading...</p>
  }
  return (
    <>
    <div className='w-dvw md:max-w-md lg:max-w-lg mt-10 p-4'>
      <CardNote note={data.note} repostCount={data.repostCount} hasLiked={Boolean(data.hasLiked)} hasReposted={Boolean(data.hasReposted)} />
    </div>
    <div className='max-w-[400px] md:max-w-md lg:max-w-lg'>
      {data.replies?.map((reply) => {
        return <CardNote key={reply.id} note={reply} isReplyTo={true} />
      })}
    </div>
    </>
  )
}
