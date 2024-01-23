# setup-roxctl
Javascript Github action written in Typescript which can be used to download and install roxctl cli for Red Hat Advanced Cluster Security (RHACS) for kubernetes.

# Usage
```yaml
- uses: github.com/rprakashg-redhat/setup-roxctl@main
  with:
    # Version of roxctl to be downloaded
    # Default: latest
    version: ""
```

# Scenarios
- [Download latest version](#download-latest-version)
- [Download specific version](#download-specific-version)

## Download latest version
```yaml
- uses: github.com/rprakashg-redhat/setup-roxctl@main
  with:
    version: "latest"
```

## Download specific version
```yaml
- uses: github.com/rprakashg-redhat/setup-roxctl@main
  with:
    version: "4.3.4"
```

## Example 
```yaml
name: example
on:
  workflow_dispatch:
    inputs:
      version:
        description: Version of roxctl to setup
        type: string
        default: "latest"
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: setup roxctl
        id: setup-roxctl
        uses: ./
        with:
          version: ${{ inputs.version }}
      - name: verify
        run: |
          ./roxctl version
          ./roxctl help
```

