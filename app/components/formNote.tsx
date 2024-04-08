import React, { useState, useRef } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleImageUpload } from '~/utils/helpers'
import CardChallenge from './cardChallenge'
import { type Note, type Challenge } from '~/utils/types.client'
import { Button } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
interface FormNoteProps {
  afterSave?: () => void
  onCancel?: () => void
  note?: Note
  challenge?: Challenge
  replyToId?: number
  prompt?: string
  isRepost?: boolean
}

export default function FormNote (props: FormNoteProps): JSX.Element {
  let { afterSave, onCancel, note, challenge, prompt, replyToId } = props
  if (note?.challenge) {
    challenge = note.challenge
  }
  const placeholder = prompt ?? 'What\'s on your mind?'
  const [body, setBody] = useState(note?.body || '')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileDataURL, setFileDataURL] = useState<string | null>(note?.image ? note.image : null)

  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleImageUpload(e, setFile, setFileDataURL)
  }

  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Note must be at least 10 characters long')
    }

    const formData = new FormData()
    formData.append('body', body)
    if (note) {
      formData.append('id', note.id.toString())
    }
    if (note) {
      formData.append('id', note.id.toString())
    }
    if (replyToId) {
      formData.append('replyToId', replyToId.toString())
    }
    if (challenge) {
      formData.append('challengeId', challenge.id.toString())
    }
    if (file) {
      formData.append('image', file)
    }
    const result = await axios.post('/api/notes', formData)
    setBody('')
    setFile(null)
    setFileDataURL(null)
    if (afterSave) {
      afterSave()
    } else {
      navigate('/notes/' + result.data.id)
    }
  }
  const handleCancel = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    ev.preventDefault()
    setBody('')
    if (onCancel) {
      onCancel()
    }
  }
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='note'
          placeholder={placeholder}
          type='textarea'
          rows={3}
          required={true}
          value={body}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          error={error}
          />
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        <MdOutlineAddPhotoAlternate onClick={imageDialog} className='text-2xl cursor-pointer float-right' />
        {fileDataURL && <img src={fileDataURL} alt="preview" className='h-24 mb-2' />}
        <Button type="submit" placeholder='Save' className="bg-red">Save</Button>
          {onCancel &&
            <button onClick={handleCancel} className="mt-2 text-sm underline ml-2">cancel</button>
          }
        {challenge && <CardChallenge challenge={challenge} isShare={true}/>}

      </Form>

    </div>
  )
}