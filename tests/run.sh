#!/bin/bash

# Exit script if any command fails
set -e

echo "Starting test sequence..."

# Run your Vitest tests sequentially
npx vitest --run ./e2e/test01.equipCharacter.test.ts
npx vitest --run ./e2e/test02.transferItems.test.ts

echo "Test sequence completed."