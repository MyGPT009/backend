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

## Websocket

```bash
node ace make:preload ws --register
```

## Deploy to docker

1. Build the image
```bash
docker build -t backend .
```

2. Run the container
```bash
docker run -d --env-file .env.prod -p 3333:3333 backend:latest
```
Save the container id to access it

3. Run the migrations manually
```bash
docker exec -it <container_id> /bin/bash
# when you are inside the container
node ./bin/console.js migration:run --force
# then exit the container with ctrl + d
```

Now you can access the server on `http://localhost:3333` 🚀
