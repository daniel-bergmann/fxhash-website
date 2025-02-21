import { useRouter } from "next/router"
import React, { PropsWithChildren, useState } from "react"
import { ErrorPage } from "../components/Error/ErrorPage"
import { LoaderBlock } from "../components/Layout/LoaderBlock"
import { Qu_event, Qu_eventMintPass } from "../queries/events/events"
import { eventsClient } from "../services/EventsClient"
import { LiveMintingEvent, LiveMintingPass } from "../types/entities/LiveMinting"
import { useClientAsyncEffect } from "../utils/hookts"

/**
 * The LiveMinting context exposes informations about an event and some extra
 * data required for the whole live minting pipeline.
 */

export interface ILiveMintingContext {
  loading: boolean
  event: LiveMintingEvent|null
  mintPass: LiveMintingPass|null
  error: string|null
}

const defaultCtx: ILiveMintingContext = {
  loading: true,
  event: null,
  mintPass: null,
  error: null,
}

export const LiveMintingContext = React.createContext(defaultCtx)

type Props = PropsWithChildren<{
}>
export function LiveMintingProvider({
  children,
}: Props) {
  const [context, setContext] = useState(defaultCtx)
  
  // get the id and the token from the router
  const router = useRouter()
  const { id, token } = router.query
  
  // make queries to the events backend
  useClientAsyncEffect(async (isMounted) => {
    if (router.isReady) {
      try {
        // query the event
        let response: any
        try {
          response = await eventsClient.query({
            query: Qu_event,
            variables: {
              where: {
                id: id
              }
            }
          })
        }
        catch(err) {
          console.log(err)
          throw new Error("Network error: cannot find the event.")
        }
  
        // if there is no event in the response, access is denied
        const event = response?.data?.event
        if (!event) {
          throw new Error("The event loaded from the URL doesn't exist.")
        }

        // check if the token exists and is valid for this event
        try {
          response = await eventsClient.query({
            query: Qu_eventMintPass,
            variables: {
              where: {
                token: token
              }
            }
          })
        }
        catch(err) {
          throw new Error("Network error: cannot find the mint pass.")
        }

        // if there is no mintPass in the response, it's invalid
        const mintPass = response?.data?.mintPass
        if (!mintPass || mintPass.group.event.id !== event.id) {
          throw new Error("This mint pass is invalid.")
        }

        // we can update the context with the event/pass details
        if (isMounted()) {
          setContext({
            ...context,
            loading: false,
            error: null,
            event: event,
            mintPass: mintPass,
          })
        }
      }
      catch (err: any) {
        if (isMounted()) {
          setContext({
            ...context,
            loading: false,
            error: err.message,
          })
        }
      }
    }
  }, [router.isReady])

  return (
    <LiveMintingContext.Provider value={context}>
      {children}
    </LiveMintingContext.Provider>
  )
}