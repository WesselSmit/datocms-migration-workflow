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

Migrations are very powerful and can help you in many ways, but they are not without their downsides; without auto-generation is requires a lot of manual work and in order to use auto-generation you need to use the datocms-cli which exposes multiple commands you'll need to remember and understand.
That's why this library aims to simplify the auto-generation of datocms migrations for you.

## Setup
### Folder structure
Create a `migrations/.gitkeep` file in the root of your project to make sure there is a place for the migrations to be stored.

The migrations files should be included in your version control system, do not gitignore them!
The `.gitkeep` is used to ensure the directory is included in version control system even if there are no migration files yet.

### CMS structure
This library makes a few assumptions about the structure of you datocms instance, it is recommended to follow the following steps:
1. Create a new blank datocms instance.
2. Create a model (you can enter any model name you like) with `schema_migration` as the `Field ID`.
3. Add a field named "Migrations file name" with the type `Single-line string` and make it required under "Validations".

### API token
This library requires access to both the content delivery and management api.
You can either create a new api token with those permissions or use the standard "Full-access API Token" token.

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
# package.json
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

## Roadmap
Things I would like to add in the future:
- Currently the dev is responsible for making sure there is a `migrations/.gitkeep` directory, this should be taken care of automatically in either a post-install script or a check before the npm/bin scripts are executed.
- Currently the migrations directory and the migration modelApiKey are hardcoded in the codebase, devs should be able to create a `datocms.config.json` file in the root of their project and the migrations directory and the migration modelApiKey in that file should be used instead. You can than also use the datocms cma api to create a schema_migration model (or use any other name as specigied specified in the `datocms.config.json`) so the dev does not have to do this manually.
- ErrorLog's currently are red, normal log's should be blue and YesNo prompts should be green.
