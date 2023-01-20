# Decisions

Important decisions made in this project are documented here.

## Forking datocms environments

When forking a datocms environment you have 2 approaches:

**Implicit**
```sh
$ npx datocms migrations:run --destination="newEnv"
```

**Explicit**
```sh
$ npx datocms environments:fork targetEnv newEnv
$ npx datocms migrations:run --source="newEnv" --in-place
```

In this project we use the explicit approach because it makes it easier to understand what is happening.
