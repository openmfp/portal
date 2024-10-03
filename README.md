# Openmfp Portal

## Use the docker build locally

The docker build needs a GitHub token with a scope to access the packages of openmfp.

The following command will create a secret file with the token and build the docker image. If the build fails, the secret file will be removed.
It assumes that the token is stored in the environment variable `$OPENMFP_GITHUB_TOKEN`.
```bash
mkdir -p .secret && echo -n $OPENMFP_GITHUB_TOKEN > .secret/gh-token && docker build --secret id=NODE_AUTH_TOKEN,src=.secret/gh-token . || rm .secret/gh-token
```