# OpenMFP Portal

![Build Status](https://github.com/openmfp/portal/actions/workflows/pipeline.yaml/badge.svg)
[![REUSE status](
https://api.reuse.software/badge/github.com/openmfp/portal)](https://api.reuse.software/info/github.com/openmfp/portal)

## Getting started

### Running the Portal locally

1.  Configure the `.env` file for the backend server. Copy `.env-example` and set all missing values
```shell
cp backend/.env-example backend/.env
```

2. Install the dependencies
You have to set your GitHub token to `NODE_AUTH_TOKEN`
```shell
export NODE_AUTH_TOKEN=<Your GitHub Token>
```

Then you can run:
```shell
npm install
```

3. Start the Portal application locally

```shell
npm run start
```

### Add environment variables for Portal

In order to add custom variables to Portal add to your `.env` file variable with name starting from `OPENMFP_PORTAL_CONTEXT_`.
You can verify if variable is accessible by navigating to `http://localhost:4300/rest/config`
eg: `OPENMFP_PORTAL_CONTEXT_VARIABLE_NAME=abcd` will result with `"portalContext":{"variableName": "abcd"}`

### Use the docker build locally

The docker build needs a GitHub token with a scope to access the packages of OpenMFP.

The following command will create a secret file with the token and build the docker image. If the build fails, the secret file will be removed.
It assumes that the token is stored in the environment variable `$OPENMFP_GITHUB_TOKEN`.
```bash
mkdir -p .secret && echo -n $OPENMFP_GITHUB_TOKEN > .secret/gh-token && docker build --secret id=NODE_AUTH_TOKEN,src=.secret/gh-token . || rm .secret/gh-token
```

## Requirements

The portal requires a installation of node.js and npm.
Checkout the [package.json](package.json) for the required node version and dependencies.

## Contributing

Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file in this repository for instructions on how to contribute to openMFP.

## Code of Conduct

Please refer to the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file in this repository for information on the expected Code of Conduct for contributing to openMFP.

## Licensing

Copyright 2025 SAP SE or an SAP affiliate company and openMFP contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/openmfp/portal).
