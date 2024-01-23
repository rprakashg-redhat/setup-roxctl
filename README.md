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


