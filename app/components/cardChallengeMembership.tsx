import { useContext } from 'react'
import { useNavigate } from '@remix-run/react'
import {
  Card,
  Button
} from '@material-tailwind/react'
import { type Challenge, type MemberChallenge } from '../utils/types'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import ShareMenu from './shareMenu'

interface CardChallengeProps {
  membership: MemberChallenge
}

export default function CardChallengeMembership ({ membership }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const challenge: Challenge = membership.challenge!
  const goToChallenge = (): void => {
    if (challenge) {
      const url = `/challenges/${challenge.id}`
      navigate(url)
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/${challenge.id}`
  }

  return (
    <div className="mt-2 border-0 drop-shadow-none mr-2 w-full cursor-pointer" onClick={goToChallenge} >
      <div className="drop-shadow-none">
        <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-1 bg-white'}>
          <Card className='md:col-span-2 bg-gray-200 p-2 border-1 drop-shadow-lg border-gray rounded-md'>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col justify-center items-center col-span-1">
                  <div className="flex flex-col items-center col-span-2">
                    Member since: {new Date(membership.createdAt).toLocaleDateString()}
                  </div>
              </div>
              <div className="flex flex-col items-center col-span-2">
                <div className='mt-2 font-bold'>{challenge.name}</div>
                <Button onClick={goToChallenge} className='bg-red p-3 py-2 rounded-full mt-3 text-white'>Check In</Button>
              </div>
            </div>
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {challenge.public &&
      <>
        <hr />
        <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
          <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={challenge.id}/>
          </div>
        </div>
      </>
      }
    </div>
  )
}