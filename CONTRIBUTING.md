# Contributing to Restapify

Hello! 👋

Thanks for contributing on [Restapify](https://github.com/johannchopin/restapify/). Before implementing new features and changes, feel free to [submit an issue](https://github.com/johannchopin/restapify/issues/new). We're going to talk here.

## 🌱 How to submit a pull request?

1. Fork this repository.
2. Create a new feature branch. (Eg: `feature/add-selector-syntax`)
3. Make your changes.
4. Make a little check using `yarn lint && yarn test`
5. Commit your changes using the [gitmoji](https://gitmoji.dev/) convention.
6. Submit your pull request.

## 🔨 How to start Restapify locally

1. Clone the project

```bash
git clone https://github.com/johannchopin/restapify.git
cd restapify
```

2. Install the dependencies and run the initialisation

```bash
yarn install && yarn restapify:init
```

3. Run the test script

You can easily see your change by running the `./test/run.ts` script that serve the mocked API from `./test/api`:

```bash
yarn test:manual
```

## 💻 Use the cli locally

If you make some update on the cli of restapify and want to test the changes, just run the command `yarn link` at the root of the project.

## 🎨 Design

All the icons are created by using Figma https://www.figma.com/file/ggaBPd6ix2QvIyCx8QQpWg/icons.
