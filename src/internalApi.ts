import { Application } from 'express'

import { INTERNAL_API_BASEURL } from './const'
import { Routes, PrivateRouteState, RouteState } from './Restapify'
import { HTTP_VERBS } from './const'
import { GetRoutes } from './types/internalApi'
import { getRoutesByFileOrder } from './utils'
import { FakerLocale, isLocaleValid, LOCALES } from './faker'

// I N T E R F A C E S
export interface InternalApiParams {
  setLocale: (newLocale: FakerLocale) => void
  setState: (newState: RouteState) => void
  states: PrivateRouteState[]
  routes: Routes
  port: number
  baseUrl: string
  locale: FakerLocale
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
    setState,
    setLocale,
    locale
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

    setState({ route, state, method })
    res.status(204).end()
  })

  app.get(getRoute('/configs/locale'), (req, res): void => {
    res.json({ locale })
  })

  app.get(getRoute('/configs/locales'), (req, res): void => {
    res.json(LOCALES)
  })

  app.put(getRoute('/configs/locales'), (req, res): void => {
    const { locale: bodyLocale } = req.body

    if (!isLocaleValid(bodyLocale)) {
      res.status(400).send(`The given locale ${bodyLocale} is not valid! Please refer to the documentation https://github.com/Marak/faker.js#localization`)
    }

    setLocale(bodyLocale)
    res.status(204).end()
  })

  return app
}
