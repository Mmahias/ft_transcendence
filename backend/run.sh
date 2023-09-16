!#/bin/sh

sleep 5

npx prisma migrate dev

npm run start:dev
