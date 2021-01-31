# Restapify

![Codecov](https://img.shields.io/codecov/c/github/johannchopin/restapify)
<a href="https://gitmoji.dev">
  <img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square" alt="Gitmoji">
</a>

Restapify is a tool that allows you to easily and quickly deploy a local REST API using an intuitive and developer friendly JSON file structure.

## Summary
- [**Why Restapify**](#why-restapify)
- [**Getting Started**](#getting-started)
- [**Features**](#features)
- [**Contributing**](#contributing)

## Why Restapify

## Features

- 💻 **Incredible DX** - Intuitive files structure and JSON syntax to easily mock your API
- 🔥 **Built in hot watcher** - Directly see your changes after a file update
- 📝 **[Fakerjs](https://github.com/marak/Faker.js/) implementation** - Intuive syntax to use this library in your mocked API creation
- 🏷️ **TypeScript support**

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

## Contributing

All remarks are welcome so feel free to [open an issue](https://github.com/johannchopin/restapify/issues).
Wants to collaborate? Please read the [contributing guidelines](./CONTRIBUTING.md).


## Documentation

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
 ┃ ┗ 📜 my-post.PUT.json
 ┣ 📜 posts.json
```

It will serve the following routes:
```
GET    /users
GET    /users/:userid
DELETE /users/:userid
GET    /posts
GET    /posts/:postid
PUT    /posts/my-post
```

### File name

```
{scope}.{method}.{statusCode}.{state}.json
```

#### `scope`:
#### Fixed value
The following file structure...
```
📂 api
 ┣ 📂 posts
 ┃ ┗ 📜 my-post.json
 ┣ 📜 posts.json
```

...will serve the following routes:
```
GET /posts
GET /posts/my-post
```

#### Star selector
The following file structure...
```
📂 api
 ┣ 📂 posts
 ┃ ┗ 📜 *.json
 ┣ 📜 *.json
```

...will serve the following routes:
```
GET /
GET /posts
```

#### Variable

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
