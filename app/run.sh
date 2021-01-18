#!/bin/bash

name=cg

yarn install

echo "REACT_APP_UPDATED=$(date)" > .env
npm run build
docker stop $name || true
docker rm $name || true

docker build -t $name .

docker run -d --name $name -p 5000:80 $name