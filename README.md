# Weapon Inventory System

GOAL: Create a REST or GraphQL API for managing the weapon inventory system.

# Architecture

-   Routes: The endpoints opened for http requests
-   Entity: All the entities that we should use and validate in the requests and in the business logic.
-   Controller: Receive requests and prepare responses
-   Service: Take care of the Business Logic
-   Repository: Access to the database using prisma ORM

# Logs

I'm using pino for the logs.

# ORM

I've used prisma ORM that make easier and safe to communicate with the database

# PREPARE 
Run:
```
npm install
```

## Env
Create the .env and .env.test files

### .env
This one will be used by the docker
Add the variables:

```
POSTGRES_PASSWORD=
PGADMIN_DEFAULT_EMAIL=
PGADMIN_DEFAULT_PASSWORD=
DATABASE_URL=
```

### .env.test
This one will be used by the tests on top of the docker running
Here you can use localhost:5433 to access the database

# Docker

With the .env files read you can execute:

```
docker-compose up --build
```

And it will create a local postgres database, spin up a pgadmin and run the server on port 5001.

To test it you can execute

```
curl http://localhost:5001/api/health
```

You should see the {"message":"ALIVE"} response

# Tests

I've created e2e tests covering the call to the route, passing in the controller, checking all the requirements for the
specific service and finalizing in the repository.

## Prisma

Prepare the test database. Run:

```
npm run setup:test:db
```

## Running tests

I prepared a run.sh script that runs all the test cases in order.
To run it just call:

```
npm test
```
