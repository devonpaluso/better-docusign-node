#!/bin/bash
set -e

yarn install

cd core
yarn build
cd ..

cd client
yarn build
cd ..

cd api
yarn build
cd ..

cd cli
yarn build
cd ..

cd create
yarn build
cd ..

cd react
yarn build
cd ..


#--------------------------------------------


cd api
pnpm publish
cd ..

cd cli
pnpm publish
cd ..

cd client
pnpm publish
cd ..

cd core
pnpm publish
cd ..

cd create
pnpm publish
cd ..

cd react
pnpm publish
cd ..
