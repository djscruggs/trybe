import { createNote, updateNote, loadRepost, deleteNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  console.log('rawData', rawData.get('unrepost'))
  if (rawData.get('unrepost')) {
    console.log('unreposting', rawData.get('replyToId'))
    const repost = await loadRepost(rawData.get('replyToId'), currentUser?.id, null)
    console.log('result of loadRepost', repost)
    if (repost) {
      console.log('deleting repost', repost)
      await deleteNote(repost.id)
    }
    return json({ message: 'Repost deleted' }, 200)
  }
  console.log('creating repost')
  const image = rawData.get('image')
  console.log(rawData)
  if (!rawData.get('replyToId')) {
    throw new Error('replyToId is required')
  }

  const data = {
    body: rawData.get('body') ?? null,
    replyTo: { connect: { id: parseInt(rawData.get('replyToId')) } },
    isShare: true,
    user: { connect: { id: currentUser?.id } }
  }
  // check to make sure the repost doesn't already exist
  const note = await loadRepost(data.replyToId, currentUser?.id, data.body)
  if (note) {
    return json(note)
  }
  const result = await createNote(data)
  if (image) {
    const nameNoExt = image.name.split('.')[0]
    const webPath = await writeFile(image, nameNoExt)
    result.image = webPath
  }
  const updated = await updateNote(result)
  console.log('returning', updated)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
