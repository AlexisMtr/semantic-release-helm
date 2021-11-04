# semantic-release-helm

This is a plugin for _semantic-release_. It updates `version` and `appVersion` of a [Helm](https://helm.sh/) chart's
_Chart.yaml_.

The `version` is increased according to `nextRelease.type`, which can be one of

- major
- premajor
- minor
- preminor
- patch
- prepatch
- prerelease

or _null_ if it's not valid.

The `appVersion` is set to `nextRelease.version` if `onlyUpdateVersion`is false or unset.
##### Examples:

```
version 0.1.0  
appVersion 1.16.0
```

1. patch (1.16.0 -> 1.16.1)  
   New chart version is 0.1.1

2. minor (1.16.0 -> 1.17.0)  
   New chart version is 0.2.0

3. major (1.16.0 -> 2.0.0)  
   New chart version is 1.0.0
## Usage

### Configuration
| name | type | default | required | description |
| ---- | ---- | ------- | -------- | ----------- |
| chartPath | string | "" | true | Chart directory, where the _Chart.yaml_ is located.|
| registry | string | "" | false | URI of a container registry. |
| onlyUpdateVersion | bool | false | false | Don't change `appVersion` if this is true. Useful if your chart is in a different git repo than the application. |
| oci | bool | false | false | If true, set `HELM_EXPERIMENTAL_OCI` environment variable to `1` |
| crPublish | boolean | false | false | Enable chart releaser |
| crPathConfig | string | "" | false | path to .ct.yaml chart-releaser configuration file |

Credentials for registry must be exported
```sh
export REGISTRY_USERNAME=<USERNAME>
export REGISTRY_PASSWORD=<PASSWORD>
```
### OCI Compliant Registry
```json
{
  "plugins": [
    [
      "semantic-release-helm",
      {
        chartPath: './chart',
        registry: 'localhost:5000/repo/chart',
        oci: true
      }
    ]
  ]
}
```
### AWS S3 Regsitry
You should first export credentials
```sh
export AWS_REGION=<REGION>
export AWS_ACCESS_KEY_ID=<ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY>
```

```json
{
  "plugins": [
    [
      "semantic-release-helm",
      {
        chartPath: './chart',
        registry: 's3://my-s3-bucket-repo/s3-prefix',
        onlyUpdateVersion: true,
        oci: false
      }
    ]
  ]
}
```
### Google GCS Registry
You should first login using `gcloud` CLI or export Account credentials file
```sh
 export GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

```json
{
  "plugins": [
    [
      "semantic-release-helm",
      {
        chartPath: './chart',
        registry: 'gs://my-gcs-bucket-repo/gcs-prefix',
        onlyUpdateVersion: true,
        oci: false
      }
    ]
  ]
}
```