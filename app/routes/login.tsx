import Button from '@mui/material/Button';
import { FormField } from '~/src/components/form-field';
import { useState } from 'react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { login, register, getUser } from '~/src/utils/auth.server'
import { validateEmail, validateName, validatePassword } from '~/src/utils/validators.server'
import { useActionData } from '@remix-run/react'
import { useRef, useEffect } from 'react'


export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect('/') : null
}
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const action = form.get('_action')
  const email = form.get('email')
  const password = form.get('password')
  let firstName = form.get('firstName')
  let lastName = form.get('lastName')

  if (typeof action !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
  }

  if (action === 'register' && (typeof firstName !== 'string' || typeof lastName !== 'string')) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
  }
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === 'register'
      ? {
          firstName: validateName((firstName as string) || ''),
          lastName: validateName((lastName as string) || ''),
        }
      : {}),
  }
  
  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 })
  }
  switch (action) {
    case 'login': {
        return await login({ email, password })
    }
    case 'register': {
        firstName = firstName as string
        lastName = lastName as string
        return await register({ email, password, firstName, lastName })
    }
    default:
        return json({ error: `Invalid Form Data` }, { status: 400 });
  }
    
}
export default function Login() {
  const actionData = useActionData()
  const [action, setAction] = useState(actionData?.form ? actionData.form : 'login')
  
  const firstLoad = useRef(true)
  const [errors, setErrors] = useState(actionData?.errors || {})
  const [formError, setFormError] = useState(actionData?.error || '')
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.lastName || '',
    lastName: actionData?.fields?.firstName || '',
  })
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }
  useEffect(() => {
    if (!firstLoad.current) {
      const newState = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      }
      setErrors(newState)
      setFormError('')
      setFormData(newState)
    }
  }, [action])

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError('')
    }
  }, [formData])

  useEffect(() => { firstLoad.current = false }, [])
  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">
      
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Trybe!</h2>
        <p className="font-semibold text-slate-300">Please Log In!</p>
        <Button
          variant="outlined"
          onClick={() => setAction(action == 'login' ? 'register' : 'login')}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === 'login' ? 'Sign Up' : 'Sign In'}
        </Button>

        <form method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
        {action === 'register' && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={e => handleInputChange(e, 'firstName')}
                error={errors?.firstName}
                value={formData.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                error={errors?.lastName}
                onChange={e => handleInputChange(e, 'lastName')}
                value={formData.lastName}
              />
            </>
          )}
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            error={errors?.email}
            onChange={e => handleInputChange(e, 'email')}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            error={errors?.password}
            value={formData.password}
            onChange={e => handleInputChange(e, 'password')}
          />
          
          <Button
            name="_action"
            type="submit"
            value={action}
            variant="contained"
          >
             
          
            {action === 'login' ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </div>
  )
}