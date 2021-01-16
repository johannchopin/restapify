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
