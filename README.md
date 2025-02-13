
## Description

Racine is the backend for Echalote.
It's a simple API made with :
- Nest.js
- Prisma (ORM)
- PostgreSQL


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```


## Database management with prisma 

To generate the prisma client :

```bash
$ npx prisma generate
``` 

To apply migrations :

```bash
$ npx prisma migrate dev
``` 

If in need to reset the database :

```bash
$ npx prisma reset
``` 


## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

