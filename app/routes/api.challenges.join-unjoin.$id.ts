import { joinChallenge, unjoinChallenge, challengeSchema } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node' // or cloudflare/deno

export async function action (args: ActionFunctionArgs): Promise<prisma.challenge> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return {
      result: 'not-logged-in'
    }
  }
  const { params } = args
  const user = await loadUser(currentUser.id)
  if (user.memberChallenges.filter((c) => c.challengeId === parseInt(params.id)).length > 0) {
    const result = await unjoinChallenge(user.id, Number(params.id))
    console.log('unjoined', result)
    return {
      result: 'unjoined',
      data: result
    }
  } else {
    const result = await joinChallenge(user.id, Number(params.id))
    console.log('joined', result)
    return {
      result: 'joined',
      data: result
    }
  }
}
export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
