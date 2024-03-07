import ChallengeForm from '~/components/form-challenge';
import { useLoaderData, useRouteLoaderData, useFetcher } from '@remix-run/react';
import type {ObjectData} from '~/utils/types.server'
import { LoaderFunction } from "@remix-run/node"; 
import {loader as challengeLoader} from './challenges.$id'
// import { useRouteLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return challengeLoader({ request, params, context })
}
export default function EditChallenge() {
  const data: ObjectData  = useLoaderData() as ObjectData
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
   
  if(!data?.object){
    return <p>Loading.</p> 
  }
  //remove _count from object, side effect of using challengeLoader
  if(data.object._count){
    delete data.object._count
  }
  return (
    <ChallengeForm object={data.object}/>
  );
}