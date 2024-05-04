import React, { useState, useContext } from 'react'
import FormComment from './formComment'
import { Avatar, Spinner } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { convertlineTextToJSX } from '~/utils/helpers'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import type { Comment } from '~/utils/types'
import CommentsContainer from './commentsContainer'
import { formatDistanceToNow } from 'date-fns'
import { FaRegComment } from 'react-icons/fa'
import Liker from './liker'

interface CommentsProps {
  comment: Comment | null
  isReply: boolean
  likedCommentIds: number[]
}

export default function CommentItem (props: CommentsProps): JSX.Element {
  const [comment, setComment] = useState<Comment | null>(props.comment ?? null)
  const [replies, setReplies] = useState<Comment[]>(comment?.replies ?? [])
  const { likedCommentIds } = props
  const [firstReply, setFirstReply] = useState<Comment | null>(null)
  const [isLiked, setIsLiked] = useState(likedCommentIds.includes(comment?.id ?? 0))

  const [deleting, setDeleting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [replying, setReplying] = useState(false)
  const { currentUser } = useContext(CurrentUserContext)
  const handleEdit = (): void => {
    if (!comment || deleting) return
    setShowForm(true)
  }

  const handleDelete = async (): Promise<void> => {
    if (!comment) return
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', comment.id.toString())
      formData.append('intent', 'delete')
      const response = await axios.post('/api/comments', formData)
      toast.success('Comment deleted')
      setComment(null)
    } catch (error) {
      toast.error('Error deleting comment')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }
  const afterSave = (comment: Comment): void => {
    setComment(comment)
    setShowForm(false)
  }
  const afterSaveReply = async (reply: Comment): void => {
    // refresh comment after save
    if (replies) {
      const newReplies = [reply].concat(replies)
      setReplies(newReplies)
    } else {
      setFirstReply(reply)
    }

    setReplying(false)
  }
  const allowReplies = (): boolean => {
    return Boolean(currentUser?.id && comment && comment.threadDepth < 5)
  }
  console.log(comment)
  if (!comment) return <></>
  return (
    <>
    {showForm
      ? (
        <div className='w-full border-l-2  pl-4 mb-4'>
          <FormComment afterSave={afterSave} onCancel={() => { setShowForm(false) }} comment={comment} />
        </div>
        )
      : (
      <>
        <div className="w-full pl-4" >
          <div className={'relative mb-2 p-2 break-all'}>
            {comment.user?.id === currentUser?.id &&
              <div className="text-xs text-gray-500 w-sm flex text-right justify-end absolute top-2 right-2">
                <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                {deleting ? <Spinner className='h-4 w-4' /> : <span className='underline cursor-pointer mr-1' onClick={handleDelete}>delete</span>}
              </div>
            }
            <div className='flex'>
              <div className='flex-shrink-0'>
                <Avatar src={comment.user?.profile?.profileImage} className='mr-2' size='sm'/>
              </div>
              <div className='flex-grow'>
              <div className='text-xs mb-2'>{comment.user?.profile?.firstName} {comment.user?.profile?.lastName} - <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span></div>
                  {convertlineTextToJSX(comment.body)}
              </div>
            </div>
            <div className='ml-10 mt-4 mb-4'>
              {replying && <FormComment afterSave={afterSaveReply} onCancel={() => { setReplying(false) }} replyToId={comment.id} /> }
              {!replying &&
                <div className='flex justify-start'>
                  <Liker isLiked={isLiked} itemId={comment.id} itemType='comment' count={comment.likeCount}/>
                {allowReplies() &&
                  <div className='ml-2'>
                  <FaRegComment className='h-4 w-4 text-grey cursor-pointer' onClick={() => { setReplying(true) }}/>
                  </div>
                }
            </div>
            }
        </div>
          </div>

        </div>
        {/* comment contains replies, so create a new container for those */}
        {replies && replies.length > 0 &&
          <div className='pl-4'>
            <CommentsContainer firstComment={firstReply} likedCommentIds={likedCommentIds} comments={replies} isReply={true} />
          </div>
        }
      </>
        )
  }
  </>
  )
}
