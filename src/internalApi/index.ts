import * as express from 'express'

import { INTERNAL_API_BASEURL } from '../server/CONST'
import { Routes } from '../server'

// I N T E R F A C E S
export interface InternalApiParams {
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
  const { routes, onClose } = params

  app.get(getRoute('/close'), (req, res): void => {
    res.status(204)
    res.send()
    onClose()
  })

  app.get(getRoute('/routes'), (req, res): void => {
    res.json(routes)
  })

  return app
}
