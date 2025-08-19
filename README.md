# Super Notes Project

The Super Notes project (formally : Échalote) is a collaborative note taking application using the Markdown format.
This repository (formally : Racine) is the Backend part of the project it's an API serving informations to the Frontend.


## Features 

The API as multiples features :

- CRUD for users
- CRUD for groups
- CRUD for group members
- CRUD for pages
- all routes are defended with an authentification guard

## Technologies  

- Nest.js
- Prisma (ORM)
- Jest
- PostgreSQL (Database)
- Docker (Database)

## How to run

After cloning the projet and installing the dependancies with `npm i` you can run the project using the following commands : 

First, run the database with this command : 

```bash 
$ docker compose up
```

After each modification of the prisma schema or after setup you will need to launch the folowing commands to generate the prisma client :

```bash
$ npx prisma generate
$ npx prisma migrate dev
``` 

Then, you can launch the project : 

```bash
$ npm run dev
```

For the project to work, you will need to set the following .env variables :

- DATABASE_URL : the URL to the database
- POSTGRES_DB : the name that will be used in the docker compose file for the database
- POSTGRES_USER : the name that will be used in the docker compose file for the admin user
- POSTGRES_PASSWORD : the password that will be used in the docker compose file for the admin
- FRONT_URL : the URL to the frontend to allow CORS
- JWT_SECRET_KEY : the key you will use to hash passwords


## Run tests and Linter

You can check the project comformity by launching tests or the Linter using the following commands :

Run tests :

```bash
$ npm run test
```

Run Linter :

```bash
$ npm run lint
```

## Author 

Developped by Louis Brochard, in the context of a school project.


