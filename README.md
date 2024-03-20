# Weapon Inventory System

GOAL: Create a REST or GraphQL API for managing the weapon inventory system.

# Architecture

Routes: The endpoints opened for http requests
Entity: All the entities that we should use and validate in the requests and in the business logic.
Controller: Receive requests and prepare responses
Service: Take care of the Business Logic
Repository: Access to the database using prisma ORM

# Logs

I'm using pino for the logs.

# ORM

I've used prisma ORM that make easier and safe to communicate with the database

# Tests

I've created e2e tests covering the call to the route, passing in the controller, checking all the requirements for the
specific service and finalizing in the repository.

## Running tests

I prepared a run.sh script that runs all the test cases in order
To run it just call:

```
npm test
```
