#!/bin/bash

# Exit script if any command fails
set -e

echo "Setting up test database..."

npm run prisma:generate:test
npm run prisma:migrate:test

echo "Test database setup complete."