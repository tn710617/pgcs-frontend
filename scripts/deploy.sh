#!/bin/bash
echo "start build..." &&
  rm -rf /Users/ray/code/side-projects/pokemon-go-sharing-coordinate-frontend/build &&
  cd /Users/ray/code/side-projects/pokemon-go-sharing-coordinate-frontend &&
  yarn run build-production &&
  echo "build success" &&
  echo "start tar..." &&
  tar -czf build.tar.gz ./build &&
  echo "tar success" &&
  echo "start scp..." &&
  scp /Users/ray/code/side-projects/pokemon-go-sharing-coordinate-frontend/build.tar.gz linode-blog:/var/www/html/PGCS-frontend &&
  echo "scp success" &&
  echo "start deploy..." &&
  ssh linode-blog "mkdir -p /var/www/html/PGCS-frontend/build_temp" &&
  ssh linode-blog "tar -xzf /var/www/html/PGCS-frontend/build.tar.gz -C /var/www/html/PGCS-frontend/build_temp" &&
  ssh linode-blog "rm -rf /var/www/html/PGCS-frontend/build && mv /var/www/html/PGCS-frontend/build_temp/build /var/www/html/PGCS-frontend/" &&
  echo "deploy success" &&
  echo "clean..." &&
  ssh linode-blog "rm -rf /var/www/html/PGCS-frontend/build.tar.gz && rm -rf /var/www/html/PGCS-frontend/build_temp" &&
  rm -rf /Users/ray/code/side-projects/pokemon-go-sharing-coordinate-frontend/build.tar.gz &&
  echo "clean success"
