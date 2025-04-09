# Basic OAT authentification example with AdonisJS v6

## Description
This is a basic example of how to implement OAT authentification with AdonisJS v6. It includes a simple user model and a basic authentification controller.

## Features
- Register a new user
- Login a user
- Logout the current user
- Get user details

## Required
- node ```v22.0.0```
- Install Python using the Microsoft Store
- Run command : ```python --version```
- Install node-gyp : ```npm i -g node-gyp@latest```
- install Visual Studio ```Desktop development with C++```

## Installation

1. Make sure to install dependencies:

```bash
npm install
```

2. Create a new .env file
```bash
cp .env.example .env
```

3. Create a tmp directory if you use SQLite
```bash
mkdir tmp
```

4. run the migration
```bash
node ace migration:run
```

5. generate Vapid keys
```bash
npx web-push generate-vapid-keys
```

## Development server

Start Command

```bash
ng serve
```

## Production server

Start Command

```bash
node build/bin/server.js
```

Pre/Post Deployment Commands

```bash
node build/ace migration:run --force
```

## Migration

Create new migration

```bash
node ace make:migration NomDeTaTable
```

Run the migrations

```bash
node ace migration:run
```

## Tests

Create new test

```bash
node ace make:test NomDuTest
```

Run the tests

```bash
node ace test
```

Now you can access the server on `http://localhost:3333` 🚀
