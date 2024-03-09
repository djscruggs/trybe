import { requireCurrentUser } from '../utils/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { fetchChallengeSummaries } from '~/utils/challenge.server'
import { Button } from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import React from 'react'
export const loader: LoaderFunction = async ({ request, params }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(request)
  const result = await fetchChallengeSummaries() as { error?: string }
  if (!result || (result.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  return json(result)
}

export default function ChallengesIndex (): JSX.Element {
  const navigate = useNavigate()
  const data: any = useLoaderData()
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  return (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Challenges
            </h1>
            <div className="max-w-md">
            <p className="text-red">We celebrate the power of challenges to help focus, structure and kickstart our growth. When you don't have to do the heavy lifting of planning, scheduling and tracking, you can focus on just showing up, and that's where the magic and self-discovery unfolds!</p>
            <Button placeholder='New Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4">New</Button>

            {(data?.length) > 0 &&
               data.map((challenge: any) => (
                <p key={challenge.id}>
                  <CardChallenge challenge={challenge} />
                </p>
               ))
            }

          </div>
          </>
  )
}
