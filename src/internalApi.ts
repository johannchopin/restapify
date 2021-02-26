import { Application } from 'express'

import { INTERNAL_API_BASEURL } from './const'
import { Routes, PrivateRouteState, RouteState } from './Restapify'
import { HTTP_VERBS } from './const'
import { GetRoutes } from './types/internalApi'
import { getRoutesByFileOrder } from './utils'

// I N T E R F A C E S
export interface InternalApiParams {
  setState: (newState: RouteState) => void
  states: PrivateRouteState[]
  routes: Routes
  port: number
  baseUrl: string
}

const getRoute = (route: string): string => {
  return INTERNAL_API_BASEURL + route
}

export const getInitialisedInternalApi = (
  app: Application,
  params: InternalApiParams
): Application => {
  const {
    port,
    baseUrl,
    states,
    routes,
    setState
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

  app.get(getRoute('/api'), (req, res): void => {
    res.json({
      port,
      baseUrl,
      routes: sortedRoutes
    })
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
