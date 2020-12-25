import * as express from 'express'

import { INTERNAL_API_BASEURL } from '../CONST'
import { Routes, PrivateRouteState, RouteState } from '../Restapify'
import { HTTP_VERBS } from '../CONST'

// I N T E R F A C E S
export interface InternalApiParams {
  setState: (newState: RouteState) => void
  states: PrivateRouteState[]
  routes: Routes
  onClose: () => void
}

const getRoute = (route: string): string => {
  return INTERNAL_API_BASEURL + route
}

export const getInitialisedInternalApi = (
  app: express.Express,
  params: InternalApiParams
): any => {
  const {
    states,
    routes,
    setState,
    onClose
  } = params

  app.get(getRoute('/close'), (req, res): void => {
    res.status(204)
    res.send()
    onClose()
  })

  app.get(getRoute('/routes'), (req, res): void => {
    res.json(routes)
  })

  app.get(getRoute('/states'), (req, res): void => {
    res.json(states)
  })

  app.put(getRoute('/states'), (req, res): void => {
    const { route, state, method = 'GET' } = req.body
    const isMethodValid = HTTP_VERBS.includes(method)

    if (!route || !isMethodValid) {
      res.status(401).end()
    }

    setState({
      route,
      state,
      method
    })

    res.status(204).end()
  })

  return app
}
