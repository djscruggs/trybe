import React, {
  useState,
  useEffect,
  useRef,
  type ChangeEvent
} from 'react'
import { Form, useNavigate } from '@remix-run/react'
import type { ObjectData } from '~/utils/types'
import { Button, Select, Option, Radio } from '@material-tailwind/react'
import { FormField } from '~/components/formField'
import DatePicker from 'react-datepicker'
import { addDays } from 'date-fns'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { colorToClassName, getIconOptionsForColor, handleFileUpload } from '~/utils/helpers'
import { useRevalidator } from 'react-router-dom'

interface Errors {
  name?: string
  description?: string
  mission?: string
  startAt?: string
  endAt?: string
  coverPhoto?: string
  locale?: string
}

export default function FormChallenge (props: ObjectData): JSX.Element {
  const frequencies = ['DAILY', 'WEEKDAYS', 'ALTERNATING', 'WEEKLY']
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const challengeForm = useRef(null)
  const [errors, setErrors] = useState<Errors>()
  // make a copy so it doesn't affect parent renders
  const challenge = { ...props.challenge }
  delete challenge._count
  const [formData, setFormData] = useState(challenge)
  const localDateFormat = props.locale === 'en-US' ? 'M-dd-YYYY' : 'dd-M-YYYY'
  function selectDate (name: string, value: Date): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    if (name === 'public') {
      setFormData((prevFormData: ObjectData) => ({
        ...prevFormData,
        [name]: value === 'true'
      }))
      return
    }
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  function handleSelect (value: string | undefined): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      frequency: value
    }))
  }
  const colorOptions = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'pink',
    'purple'
  ]
  function handleColorChange (value: string): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      color: value
    }))
  }

  const iconOptions: Record<string, JSX.Element> = getIconOptionsForColor(formData?.color as string)
  const handleIconChange = (value: string): void => {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      icon: value
    }))
  }
  function handleCancel (event: React.FormEvent): void {
    event.preventDefault()
    navigate(-1)
  }
  function parseErrors (errors: any, path: string = ''): Record<string, string> {
    let result: Record<string, string> = {}

    for (const key in errors) {
      if (key === '_errors') {
        result[path] = errors[key][0]
      } else if (typeof errors[key] === 'object') {
        const nestedErrors = parseErrors(errors[key], path ? `${path}.${key}` : key)
        result = { ...result, ...nestedErrors }
      }
    }

    return result
  }
  async function handleSubmit (event: React.FormEvent): Promise<void> {
    event.preventDefault()
    // validation
    const validation: Errors = {}
    if (formData.name.trim() === '') { validation.name = 'Name is required' }
    if (formData.description.trim() === '') { validation.description = 'Description is required' }
    if (!formData.mission || formData.mission.trim() === '') { validation.mission = 'Mission is required' }
    if (!formData.startAt) { validation.startAt = 'Start date is required' }
    if (!formData.endAt) { validation.endAt = 'End date is required' }
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    const toSubmit = new FormData()
    for (const key in formData) {
      if (key === 'id') continue
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key]
        if (typeof value === 'string') {
          toSubmit.append(key, value)
        } else if (value instanceof Blob) {
          toSubmit.append(key, value)
        } else {
          toSubmit.append(key, String(value))
        }
      }
    }
    if (formData.coverPhoto) {
      toSubmit.set('coverPhoto', formData.coverPhoto)
    }
    if (photo !== null) {
      toSubmit.append('photo', photo)
    }
    if (formData.id !== undefined) {
      toSubmit.append('id', String(formData.id))
    }
    const url = '/api/challenges'
    const headers = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const response = await axios.post(url, toSubmit, headers)
    const msg = (formData.id !== null) ? 'Challenge saved' : 'Challenge created'
    if (!response.data.id || response.data.errors) {
      toast.error('An error occured')
      if (response.data.errors) {
        console.error('errors', response.data.errors)
        const parsedErrors = parseErrors(response.data.errors)
        console.log('parsedErrors', parsedErrors)
        setErrors(parsedErrors as Errors)
      }
    } else {
      revalidator.revalidate()
      toast.success(msg)
      navigate(`/challenges/${response.data.id}`)
    }
  }
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoURL, setPhotoURL] = useState<string | null>(formData.coverPhoto ? String(formData.coverPhoto) : null)

  const handleCoverPhoto = (event: ChangeEvent<HTMLInputElement>): void => {
    const params = {
      event,
      setFile: setPhoto,
      setFileURL: setPhotoURL
    }
    handleFileUpload(params)
  }
  const removePhoto = (): void => {
    setPhoto(null)
    setPhotoURL(null)
    if (formData.coverPhoto) {
      setFormData((prevFormData: ObjectData) => ({
        ...prevFormData,
        coverPhoto: 'delete'
      }))
    }
  }

  // useEffect(() => {
  //   let fileReader: FileReader | null = null
  //   let isCancel = false
  //   if (photo) {
  //     fileReader = new FileReader()
  //     fileReader.onload = (e) => {
  //       const result = e.target?.result
  //       if (result && !isCancel) {
  //         if (typeof result === 'string') {
  //           setPhotoURL(result)
  //         } else {
  //           setPhotoURL(null)
  //         }
  //       }
  //     }
  //     fileReader.readAsDataURL(photo)
  //   }
  //   return () => {
  //     isCancel = true
  //     if (fileReader && fileReader.readyState === 1) {
  //       fileReader.abort()
  //     }
  //   }
  // }, [photo])
  const photoInput = (): JSX.Element => {
    const textColor = photoURL ? 'white' : 'blue-gray-50'
    return (
      <input type="file"
        name="coverPhoto"
        onChange={handleCoverPhoto}
        accept="image/*"
        className={`text-sm text-${textColor}
                  file:text-white
                    file:mr-5 file:py-2 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    file:cursor-pointer file:bg-blue
                    hover:file:bg-red`}
      />
    )
  }
  return (
      <>
        <div className='w-full flex justify-center md:justify-start'>
          <Form method="post" ref={challengeForm} encType="multipart/form-data" onSubmit={handleSubmit}>
            {/* this is here so tailwind generates the correct classes, should be moveed to tailwind.config.js file */}

            <div className="w-full max-w-[600px] md:max-w-[800px] px-2 grid grid-cols-1 md:grid-cols-2  ">
              <div className="col-span-2 w-full lg:col-span-1">
                <div className="relative mb-2 max-w-[400px]">
                  <FormField
                    name='name'
                    placeholder='Give your challenge a catchy name'
                    required={true}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors?.name}
                    label="Name of Challenge" />
                </div>
                {/* material-tailwind <Select> element doesn't populate an actual HTML input element, so this hidden field captres the value for submission */}
                <input type="hidden" name='frequency' value={formData.frequency} />
                <div className="relative mb-2 max-w-[400px] text-sm">
                  <label htmlFor='public'>Who can join?</label>
                  <div className="flex items-center space-x-2">
                    <Radio
                      name='public'
                      value='true'
                      label='Anyone'
                      checked={formData.public === true}
                      onChange={handleChange}
                      crossOrigin={undefined}
                    />

                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio
                      name='public'
                      value='false'
                      label='Invite only'
                      checked={formData.public === false}
                      onChange={handleChange}
                      crossOrigin={undefined}
                    />
                  </div>
                </div>
                <div className="max-w-[400px] relative flex mb-2">
                  <Select
                    label="Select frequency"
                    placeholder='frequency'
                    name="_frequency"
                    value={formData.frequency}
                    onChange={handleSelect}
                    >
                    {frequencies.map((frequency: string, index: number) => (
                        <Option key={index} value={frequency}>{frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()}</Option>
                    ))
                    }
                  </Select>
                </div>
                <div className="relative flex flex-col mb-2 md:flex-row md:space-x-2">
                  <div className="relative max-w-[200px] mr-2">
                    <label>Start Date</label>

                    <DatePicker
                      name='startAt'
                      required={true}
                      dateFormat={localDateFormat}
                      minDate={new Date()}
                      selected={formData.startAt ? new Date(formData.startAt) : null}
                      onChange={(date: Date) => { selectDate('startAt', date) }}
                      className={`p-1 border rounded-md pl-2 ${errors?.startAt ? 'border-red' : 'border-slate-gray-500'}`}
                      />
                    {errors?.startAt && (
                      <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                        {errors?.startAt}
                      </div>
                    )}
                  </div>
                  <div className="relative max-w-[200px] mr-2">
                    <label>End Date</label>
                    <DatePicker
                      name='endAt'
                      required={true}
                      placeholderText='At least one week long'
                      dateFormat={localDateFormat}
                      minDate={formData.startAt ? addDays(new Date(formData.startAt), 7) : addDays(new Date(), 7)}
                      selected={formData.endAt ? new Date(formData.endAt) : null}
                      onChange={(date: Date) => { selectDate('endAt', date) }}
                      className={`p-1 border rounded-md pl-2 ${errors?.endAt ? 'border-red' : 'border-slate-gray-500'}`}
                      />
                    {errors?.endAt && (
                      <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                        {errors?.endAt}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative max-w-[400px]">
                  <FormField
                    name='description'
                    placeholder='Develop a new habit, eat healthy and lower your carbon footprint'
                    required={true}
                    type="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    error={errors?.description}
                    label="Description"
                  />
                </div>
                <div className="max-w-[400px] relative">
                  <FormField
                    name='mission'
                    placeholder='Eat vegetarian every day for two weeks. Check in daily to stay on track.'
                    required={true}
                    type="textarea"
                    rows={4}
                    value={formData.mission}
                    onChange={handleChange}
                    error={errors?.mission} label="Mission"
                  />
                </div>
              </div>
              <div className="max-w-[400px] sm:col-span-2 md:ml-4 lg:col-span-1">
              <div className="max-w-[400px] relative flex flex-wrap">
                  <label className='w-full block mb-2 text-left'>Color</label>
                  {colorOptions.map((option, index) => (
                    <div key={index} onClick={() => { handleColorChange(option) }} className={`w-10 h-10 cursor-pointer rounded-full bg-${colorToClassName(option, 'red')} mr-2 mb-2 ${formData.color === option ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}></div>
                  ))}
                </div>
                <div className="mt-4 max-w-[400px] relative flex flex-wrap">
                  <label className='w-full block mb-2 text-left'>Icon</label>
                  {Object.keys(iconOptions).map((key, index) => (
                    <div key={key} onClick={() => { handleIconChange(key) }} className={`w-12 h-12 cursor-pointer rounded-full mr-4 mb-2 ${formData.icon === key ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}>{iconOptions[key]}</div>
                  ))}
                </div>
                <div className='w-full mt-2'>
                  <div className={`max-w-md mb-2 h-60 rounded-md flex items-center justify-center ${photoURL ? '' : 'bg-blue-gray-50'}`}>
                    {photoURL &&
                      <>
                      <img src={photoURL} alt="cover photo" className="max-w-full max-h-60" />
                      </>
                    }
                    {!photoURL &&
                      <div className="flex flex-col items-center justify-end">
                        <p className="text-2xl text-blue-gray-500 text-center">Upload a cover photo</p>
                        <div className='mt-10 ml-36'>
                          {photoInput()}
                        </div>
                      </div>
                    }
                  </div>
                  <div className='px-[28%] justify-center items-center'>
                    {photoURL &&
                      <>
                        {photoInput()}
                        <p onClick={removePhoto} className='text-red underline ml-[130px] -mt-8 cursor-pointer'>remove</p>
                      </>
                    }

                  </div>
                </div>

              </div>
            </div>
            <div className="mt-8 flex justify-left">
              <Button type="submit" onClick={handleSubmit} placeholder='Save' className="bg-blue">Save Challenge</Button>
              <Button type="submit" onClick={handleCancel} placeholder='Cancel' className="ml-2 bg-red">Cancel</Button>
            </div>

          </Form>
        </div>
        <div className='hidden'>
        <div className='text-purple-400 bg-purple-400 border-purple-400 ring-purple-400'>purple</div>
        <div className='text-blue-gray-50 bg-blue-gray-50 border-blue-gray-50 ring-blue-gray-50'>blue-gray</div>
        <div className='text-white bg-white border-white ring-white'>white</div>
        <div className='bg-gradient-to-b from-purple-400 to-white ring-purple-400'>gradient</div>
        <div className='text-pink-300 bg-pink-300 border-pink-300 ring-pink-300'>pink</div>
        <div className='bg-gradient-to-b from-pink-300 to-white ring-pink-300'>gradient</div>
        <div className='text-blue-500 bg-blue border-blue ring-blue'>blue</div>
        <div className='bg-gradient-to-b from-blue to-white ring-blue'>gradient</div>
        <div className='text-yellow bg-yellow border-yellow ring-yellow'>yellow</div>
        <div className='bg-gradient-to-b from-yellow to-white'>gradient</div>
        <div className='text-orange-500 bg-orange-500 border-orange-500'>orange</div>
        <div className='bg-gradient-to-b from-orange-500 to-white'>gradient</div>
        <div className='text-red bg-red border-red'>red</div>
        <div className='bg-gradient-to-b from-red to-white'>gradient</div>
        <div className='text-green-500 bg-green-500 border-green-500 ring-green-500'>green</div>
        <div className='bg-gradient-to-b from-green-500 to-white ring-green-500'>gradient</div>
        <div className='text-grey bg-grey border-grey ring-grey'>grey</div>
        <div className='bg-gradient-to-b from-grey to-white'>gradient</div>
        </div>
      </>
  )
}
