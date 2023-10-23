#! /bin/sh

sleep 2

npx prisma migrate dev --name init

npx prisma db seed

npm run start:dev
