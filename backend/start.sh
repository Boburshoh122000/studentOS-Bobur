#!/bin/sh
# Railway startup script - runs migrations then starts server

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting server..."
node dist/index.js
