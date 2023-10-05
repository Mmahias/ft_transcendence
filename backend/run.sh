#! /bin/sh

sleep 2

npx prisma migrate dev --name init

npm run start:dev
