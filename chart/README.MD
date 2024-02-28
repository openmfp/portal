# Helm chart of the jukebox

## Execute the linting in the pipeline

```shell
helm lint -f test-values.yaml
```

## Debug the chart output
```shell
helm template --debug . -f test-values.yaml
```
