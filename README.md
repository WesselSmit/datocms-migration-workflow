# Datocms Migration Workflow
A wrapper library to automate and simplify the datocms migration workflow.

This package aims to simplify the datocms migration workflow, it does this by providing easy to use scripts, helpful error messages and a clear workflow.
It does so by providing a set of scripts that automate the process of creating new environments, creating new migrations and promoting environments.
It follows the [workflow recommended by datocms](https://www.datocms.com/docs/scripting-migrations/safe-iterations-using-environments#safely-merging-a-change-to-the-content-schema) themselves.

Using this wrapper helps your team in the following ways:
- efficiency; uses migration autogeneration so devs can create models with graphical interfaces without the need to manually write the migration files.
- simplicity; this library has only 3 commands instead of several datocms-cli commands and offers useful error messages, reducing the mental model.
- safety; this library implements the recommended workflow, making it harder to accidentally run the wrong commands which may result in data loss or irreversible changes.

## If you are not familiar with migrations
If you have questions about migrations or (what they're used for. if they're the right fit for you etc.)
I'd recommend reading the [official datocms explanation](https://www.datocms.com/docs/scripting-migrations/introduction) first, but I'll try to give my perspective aswell.

Migrations offer developers a way of making reproducible changes to the cms structure (think all models, fields and settings).
This is useful when you want to reproduce the cms structure for multiple environments (e.g. multi-regional websites with a cms instance per region), but also makes it possible to include structural cms changes in the review process.

Migrations are files that describe the changes made to the cms structure, with structure I mean all models, fields and settings, but not the actual content such as records and their values.
The migrations can be applied in chronological order to reproduce all changes made to the cms, guaranteeing an identical cms structure everytime.

Migrations are very powerful and can help you in many ways, but they are not without their downsides; without auto-generation it requires a lot of manual work and in order to use auto-generation you need to use the datocms-cli which exposes multiple commands you'll need to remember and understand.
That's why this library aims to simplify the auto-generation of datocms migrations for you.

**Useful tips**
- Migration files should not be gitignored.
- Migrations should be applied in chronological order (this happens automatically).
- It is recommended to never alter migration files or change the filenames manually.

## Setup

### Requirements
To make sure everything works this package requires the following configuration:
- [Base configuration](#base-configuration)
- [CMS structure](#cms-structure)
- [API token](#api-token)
- [Ignoring files](#ignoring-files)

Besides the requirered configuration seen above, this package also offers some optional configuration:
- [Migrations directory](#migrations-directory)
- [Custom configuration](#custom-configuration)

### Base configuration
This library requires a `datocms.config.json` file in the root of your project with atleast a default profile containing the following properties:

```json
{
  "profiles": {
    "default": {
      "logLevel": "BODY",
      "migrations": {
        "directory": "migrations",
        "modelApiKey": "schema_migration"
      }
    }
  }
}
```

> NOTE: `profiles[<profile>].migrations.modelApiKey` is currently not supported and should always be set to `schema_migration`.

This is necessary because this library is a wrapper and uses `@datocms/cli` under the hood, see their official documentation for more info [@datocms/cli docs](https://github.com/datocms/cli/tree/main/packages/cli) and [datocms: configuring the cli](https://www.datocms.com/docs/scripting-migrations/installing-the-cli#setting-up-a-cli-profile).

> You can also add optional configuration to the `datocms.config.json` file to change the behaviour of `datocms-migration-workflow`, see [Custom configuration](#custom-configuration).

### CMS structure
This library makes a few assumptions about the structure of you datocms instance, it is recommended to follow the following steps:
1. Create a new blank datocms instance.
2. Create a model (you can enter any model name you like) with `schema_migration` as the `Field ID`.
3. Add a field named "Name" with the type `Single-line string` and make it required under "Validations", the `Field ID` should be `name`.

### API token
This library requires access to both the content delivery and management api.
You can either create a new api token with those permissions or use the standard "Full-access API Token" token.
Add it to a `.env` file (also see the `.env.example` file) in the root of your project.

### Ignoring files
You `.gitignore` should include `datocms-mw-state.mjs` which is used to persist state this package uses to make it more convenient to use.

> the generated migration files should be included in your version control system, do not gitignore them!

### Migrations directory
You can set your own migrations directory in the `datocms.config.json` file [also see](https://www.datocms.com/docs/scripting-migrations/installing-the-cli#setting-up-a-cli-profile).

The generated migration files should be included in your version control system, do not gitignore them!

### Custom configuration
You can configure the library by adding a `datocms-mw-config` property in the `datocms.config.json` file in the root of your project.

The json below is not only an example, but also the 'standard configuration':

```json
{
  "profiles": {
    "default": {
      "logLevel": "BODY",
      "migrations": {
        "directory": "migrations",
        "modelApiKey": "schema_migration"
      }
    }
  },
  "datocms-mw-config": {
    "profile": "default",
    "typescript": true,
    "jsonLogs": true,
    "testEnvSuffix": "-test"
  }
}
```

The currently available options are:

| Argument | Description | Default value | notes |
|---|---|---|---|
| `profile` | Profile from `datocms.config.json` to use. | `default` | |
| `typescript` | Output generated migrations in typescript. | false | Requires `compilerOptions.module` to be set to `commonJS` in `tsconfig.json`.¹ |
| `jsonLogs` | Output logs (generated by `@datocms/cli`) in json. | false | |
| `testEnvSuffix` | Text to suffix datocms test environments with. | '-test' | |

_¹ [https://community.datocms.com/t/migration-error/3639/2](https://community.datocms.com/t/migration-error/3639/2)_

**How the config options to use are determined**

To ensure the package has a config file it can work with, a few safeguards are used:
1. Options in the `datocms.config.json` are used if they are present.
2. If options are missing or the specified profile is incomplete, the package will substitute the options/values with the options/values from the 'standard configuration' (also see the ['standard configuration'](#custom-configuration)).

> NOTE: `profiles[<profile>].migrations.modelApiKey` is currently not supported and should always be set to `schema_migration`.

## Workflow
You can read up on the recommended workflow, that this wrapper library implements, in the [official datocms documentation](https://www.datocms.com/docs/scripting-migrations/safe-iterations-using-environments). This library has simplified these steps into 3 commands.

Assuming you have a datocms instance that is ready to be used (also see [Setup section](#setup)), you are ready to create a new feature for your project which requires changes in the cms.

The idea is to use a separate datocms environment for each feature (just like you do in git for each feature).
In the following steps we'll use `FEATURE` to represent your feature environment, but if you make an environment for a component (let's say a hero component), we recommend naming your environment "hero".

### Commands
As mentioned the entire workflow constists of 3 commands.
You can run the commands by either:
- invoking them using `npx` (recommended)
- installing the package globally and invoking them using `datocms-migration-workflow`


This documentation operates on the assumption you'll use `npx` as recommended, so all examples will use this approach.

> Using `npx` makes it possible to add the commands as npm scripts to your package.json and allows you to namespace the commands.
E.g.


```json
// package.json
{
  "scripts": {
    "datocms:create-env": "npx create-env",
    "datocms:create-migration": "npx create-migration",
    "datocms:promote-env": "npx promote-env"
  }
}
```

This can help avoid naming conflicts if you are using migrations or environments for something else aswell (e.g. databases).

### Creating a new environment
This will create 2 new datocms environments; one called `FEATURE` and one called `FEATURE-test`.
The `FEATURE` environment is the environment you will use to make changes to the cms, the `FEATURE-test` environment is used later on to test and verify the changes you made.


```sh
$ npx create-env "ENVIRONMENT_NAME"
```

Switch to the newly created `FEATURE` environment in datocms.

You are now all set-up to make changes in the cms, when you're done making changes you can continue to ["Creating a new migration"](#creating-a-new-migration) to learn about generating migration files from your changes.

### Creating a new migration
Now that you've made changes to the cms structure, it's time to create a migration file.

```sh
$ npx create-migration "MIGRATION_NAME" "ENVIRONMENT_NAME"
```

> You can also leave out "ENVIRONMENT_NAME" and the `currentEnv` as stored in `datocms-mw-state.mjs` will be used instead.

This will create a new migration file in the migrations directory, it also deletes and recreates the `FEATURE-test` datocms environment to ensure it is up-to-date with the latest cms changes.

> If you already had a pending migration file (migration that has not yet been applied to the primary environment), it'll be deleted automatically as the migration changes will be included in the newly generated migration.

Now switch to the `FEATURE-test` environment in datocms and verify that everything is working as expected (you might need to enter some test content in newly created models and fields).

If something isn't working as desired or you realise you need to make more changes, you can switch back to the `FEATURE` environment and continue making changes. When done you can repeat the ["Creating a new migration"](#creating-a-new-migration) step again to overwrite the previously generated migration file.

If everything is working as expected and the changes are ready to be applied to the primary environment, you can continue to ["Promoting-an-environment"](#promoting-an-environment
).

### Promoting an environment
When the changes in a `FEATURE` environment are ready to be applied to the primary environment we do something called "promoting an environment" instead of merging like you are used to on git.
Promoting an environment is a safe workflow that ensures the changes are applied in the correct order and prevents data-loss.
If something goes wrong dureing the promotion you can always revert back to the previous primary environment.

```sh
$ npx promote-env
```

It basically does the following:
1. Fork the primary environment into a new environment (this new environment has the same structure and content as the primary environment).
2. Any pending migrations are applied to the new environment.

At this point the cli output will notify you about the new environment that has been created and prompt you to continue.
before continueing, it is important that you check and verify everything looks a-oke in datocms.
You can do this by switching to the new environment in datocms.

If erverything looks good you can answer the prompt with `y` to continue.
The datocms-cli will now attempt to apply all migrations and promote a new primary environment.

When done, you can simply switch to the new primary environment in datocms.

> You can now safely delete the previous primary environment & `FEATURE` environments if you want to.

Now it is time to commit everything to git and push it to your remote repository.
There you can create a pull request and leave your faith in the hands of a reviewer who now can also review the changes you made to the cms structure.

## Fetching content from correct datocms environment
When working with datocms environments you'll need to make sure you are fetching content from the correct environment.
To make this easier the package exports a `datoFetch` function that tries to make this as easy as possible.

The main features are:
- Fetching content from a specific datocms environment.
  - You can specify an environment in `options.env`.
  - The package stores your most recently used environment in a file called "datocms-mw-state.mjs", it's value will be used if no value is specified in `options.env` (enabled by default, can be disabled by setting `options.useState` to `false`).
- Fetch paginated data from a field.
- Extendable with your own variables and headers.

### Usage
```js
import datoFetch from 'datocms-migration-workflow'

const DATOCMS_API_TOKEN = *...*
const query = `query translations($skip: IntType, $locale: SiteLocale) {
  _site(locale: $locale) {
    locales
  }
  allTranslations(skip: $skip) {
    id
  }
}`
const options = {
  vars: {
    locale: 'en'
  }
  paginatedFieldName: 'allTranslations',
  headers: {
    Authorization: `Bearer ${DATOCMS_API_TOKEN}`
  }
}

try {
  const data = await datoFetch(query, options)
  console.log(data)
} catch (error) {
  console.error(error)
}
```

This shows more advanced usage, but in the most basic usage you only have to specify the query and authorization header.

> You'll need to install `datocms-migration-workflow` as dependency (instead of devDependency) to use this function.

### Details
| Argument | Description | Default value | Required | Usage notes |
|---|---|---|---|---|
| `query` | GraphQL query used to fetch data form datocms | null | true | Expects a string. |
| `options.headers` | Your custom headers to use in the fetch call. | {} | true | Only the `options.headers.Authorization` is required. |
| `options.env` | Datocms environment to fetch data from. | datocms primary env | false | If omitted, uses state from `datocms-mw-state.mjs` unless disabled with `options.useState` set to `false` |
| `options.vars` | Your custom variables to use in the fetch call. | {} | false | Uses `JSON.stringify()` to include variables. |
| `options.paginatedFieldName` | Name of field to fetch data from paginated. | "" | false | Expects a string, has a max of 1 field name at the moment. |
| `options.disableState` | Disable using `datocms-mw-state.mjs` state in fetch call. | false | false | Only uses env from state if `options.env` is not specified. |

> `datoFetch(query, options)` expects a query as string. A common approach for this is storing queries in `template literals` or reading `.graphql|.gql` files.


## TODOs/Roadmap
Things I would like to add in the future:
- [ ] give credits & thanks to De Voorhoede for making it possible to work on and develop this package.
- [ ] implement TSdoc in dato-fetch.d.mts
- [ ] "allSchemaMigrations" is hardcoded in migrations.gql + 'const { allSchemaMigrations } = await datoContentRequest(query, {' is hardcoded in lib/dato-env.mjs, these should depend on the migrationsModelApiKey as specified in datocms.config.json > "datocms-mw-config".
- [ ] the messages that inform the user which config options/state is used should be a different color to be more noticable -- everywhere where config/state is used.
- [ ] improve error handling for fetch calls (specifically those in dato-request.mjs)
- [ ] big refactor of the codebase to get everything tidy (especially config.mjs + the functions in finder.mjs could be more functional - use more helper functions functies) + see todo comments in codebase
- [ ] read through entire readme and make sure: it is up to date with the latest changes + it is easy to understand + it does not have any typos.
- [ ] release as v1.1.0 on npm.
- [ ] add a test directory where this package is loaded as a dependency and the commands can easily be tested (this should also note you cannot 'use npm' to test as some functions in finder.mjs will error --> a good solution for this is still necessary)
- [ ] rewrite entire project in typescript.
- [ ] also publish this package to github package repository.
