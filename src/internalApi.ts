import * as express from 'express'

import { INTERNAL_API_BASEURL } from './CONST'
import { Routes, PrivateRouteState, RouteState } from './Restapify'
import { HTTP_VERBS } from './CONST'
import { GetRoutes } from './types/internalApi'
import { getRoutesByFileOrder } from './utils'

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

  const getSortedRoutes = () : GetRoutes => {
    const finalRoutes: GetRoutes = {}
    const sortedRoutes = getRoutesByFileOrder(routes)

    sortedRoutes.forEach(sortedRoute => {
      const { route, method } = sortedRoute
      if (finalRoutes[route] === undefined) {
        finalRoutes[route] = {} as GetRoutes['blas']
      }
      finalRoutes[route][method] = routes[method][route]
    })

    return finalRoutes
  }

  const sortedRoutes = getSortedRoutes()

  app.get(getRoute('/close'), (req, res): void => {
    res.status(204)
    res.send()
    onClose()
  })

  app.get(getRoute('/routes'), (req, res): void => {
    res.json(sortedRoutes)
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
