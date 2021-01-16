# Restapify

![Codecov](https://img.shields.io/codecov/c/github/johannchopin/restapify)
<a href="https://gitmoji.dev">
  <img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square" alt="Gitmoji">
</a>

## Overview
Restapify is a tool that allows you to easily and quickly deploy a local REST API using an intuitive and developer friendly JSON file structure.

## Getting Started
### Using the cli
The simplest way to use Restapify is to use his [cli](https://github.com/johannchopin/restapify-cli):

```bash
npm i -g restapify-cli
```

and then serve the api folder:

```bash
restapify serve path/to/folder/
```

Read more about the cli *here*. <!-- TODO: add link -->

### Using the JavaScript class

You can install restapify's class using `npm` (note that this package should be a devDependency):

```bash
npm i -D restapify
```

You can then import the class and instanciate it to serve the api folder:

```javascript
import Restapify from 'restapify'

const apiFolderPath = path.resolve(__dirname, './path/to/folder')

const rpfy = new Restapify({
  rootDir: apiFolderPath
})
rpfy.run()
```

## Documentation

### Introduction
Todo

### File structure
Restapify allow you to easily create REST API routes using a specific file structure. Take the following folder `api/` for example:
```
📂 api
 ┣ 📂 users
 ┃ ┗ 📜 *.json
 ┃ ┗ 📜 [userid].json
 ┃ ┗ 📜 [userid].DELETE.204.json
 ┣ 📂 posts
 ┃ ┗ 📜 [postid].json
 ┃ ┗ 📜 [postid].PUT.json
 ┣ 📜 posts.json
```

It will serve the following routes:
```
GET    /users          -> respond with status code 200
GET    /users/:userid
DELETE /users/:userid  -> respond with status code 204
GET    /posts
GET    /posts/:postsid
PUT    /posts/:postsid
```

### File content

The content of the `json` file will correspond to the body of the response. For example if the file `/api/users/*.json` contains this content:
```json
[
  {
    "id": 1,
    "name": "bob"
  },
  {
    "id": 2,
    "name": "alice"
  }
]
```

...you will get it as the request's body:

```js
let response = await fetch('/api/users')
let body = await response.json()
console.log(body) // [{"id":1,"name":"bob"},{"id":2,"name":"alice"}]
```
