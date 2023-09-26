!#/bin/sh

sleep 2

npx prisma migrate dev

npm run start:dev
