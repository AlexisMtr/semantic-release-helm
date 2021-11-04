# CHANGELOG

# semantic-release-helm v3.0.0

### Feature
* add support for GCS Bucket as helm registry
* update helm command to publish on OCI registry (require Helm >= 3.7.0)
* add `oci` option to specify if the registry is compliant with OCI

### BREAKING CHANGES
* [Helm 3.7.0](https://github.com/helm/helm/releases/tag/v3.7.0) or above is required to publish chart on OCI compliant registry

# semantic-release-helm v2.0.0

### Fix
* avoid config conflicts by renaming `path` to `chartPath`

### BREAKING CHANGES
* `path` has been renamed to `chartPath` to prevent config conflicts.