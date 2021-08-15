# Deploy restapify

This documentation explains how to deploy your restapify mocked API on different popular cloud platforms.

<!-- Generate table of content by running `yarn readme:generate-doc-table` -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Heroku](#heroku)
- [Vercel](#vercel)
- [Codesandbox](#codesandbox)
- [Stackblitz](#stackblitz)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Heroku

[Heroku](https://www.heroku.com/) enable you to host nodejs applications. This one is started by using the `start` command in the project's `package.json` file. You will need to start restapify by using his JavaScript's API.

Let's create the `serve.js` file at the root of the project:

```js
// serve.js

const path = require('path')
const Restapify = require('restapify').default

const rootDir = path.resolve(__dirname, './api')
const port = process.env.PORT // <-- get the process used port

const rpfy = new Restapify({ rootDir, port })

console.log("route", rpfy.getServedRoutes());

rpfy.on('error', ({error, message}) => {
   console.log(error + ' ' + message)
})

rpfy.on('start', () => {
  console.log(`restapify API is served at ${rpfy.publicPath}`);
})

rpfy.run()
```

Then in the `package.json` file, define the `start` command:

```json
{
  "name": "...",
  "scripts": {
    "start": "node ./serve.js" 
  }
}
```

You can now publish your app to the plateform.

For a faster start use the [restapify-heroku-template](https://github.com/johannchopin/restapify-heroku-template) repo. You can check it live by visiting [https://restapify-heroku-template.herokuapp.com/restapify](https://restapify-heroku-template.herokuapp.com/restapify).

## Vercel

> ⚠️ Due to the serverless architecture of vercel, the dashboard won't be accessible. We are currently investigating on a workaround! If you need the dashboard interface please use another platform for now.

To deploy on Vercel you will need to have a `start` script in your `package.json`:

```json
{
  "name": "...",
  "scripts": {
    "start": "node ./serve.js" 
  }
}
```

Then create this `serve.js` script with the following:

```js
// serve.js

const path = require('path')
const Restapify = require('restapify').default

const rootDir = path.resolve(__dirname, './api')

const rpfy = new Restapify({ rootDir })

console.log("route", rpfy.getServedRoutes());

rpfy.on('error', ({error, message}) => {
   console.log(error + ' ' + message)
})

rpfy.on('start', () => {
  console.log(`restapify API is served at ${rpfy.publicPath}`);
})

rpfy.run()
```

Finally create the following `vercel.json` configuration file that will redirect all requests to the `serve.js` file:

```json
{
  "version": 2,
  "builds": [{
    "src": "./serve.js",
    "use": "@vercel/node"
  }],
  "routes": [{"handle": "filesystem"},
    {
      "src": "/.*",
      "dest": "serve.js"
    }
  ]
}
```

For a faster start use the [restapify-vercel-template](https://github.com/johannchopin/restapify-vercel-template) repo. You can check it live by visiting [https://restapify-vercel-template.vercel.app/api/users](https://restapify-vercel-template.vercel.app/api/users).

## Codesandbox

You can directly try and play with restapify on [codesandbox](https://codesandbox.io) by using the [restapify template](https://codesandbox.io/s/restapify-h5c3p):

<a href="https://codesandbox.io/s/restapify-h5c3p?fontsize=14&hidenavigation=1&theme=dark">
   <img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="edit restapify template icon" width="180">
</a>

## Stackblitz

> ⚠️ It is currently not possible to change the state of a route from the dashboard on Stackblitz.

Like with [codesandbox](#codesandbox) you can discover and serve restapify from the [stackblitz](https://stackblitz.com/) plateform.

Use for that the [stackblitz's restapify template](https://stackblitz.com/edit/restapify-template?file=README.md).
