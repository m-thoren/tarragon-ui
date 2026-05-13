# Monorepo for Tarragon-UI

## Development

### Start the web app

```sh
pnpm --filter web dev
```

### Build all packages

```sh
pnpm -r build
```

### Test all packages

```sh
pnpm -r test
```

### Lint all packages

```sh
pnpm -r lint
```

## Publish a new version

    git tag v1.4.0
    git push origin --tags
