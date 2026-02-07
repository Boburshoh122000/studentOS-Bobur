#!/bin/sh
# Railway startup script - syncs schema then starts server

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🚀 Starting server..."
node dist/index.js
