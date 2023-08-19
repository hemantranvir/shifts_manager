#!/usr/bin/env bash

rm -rf logs
mkdir logs

# starting workers
for i in {1..16}
do
    locust --worker &
done

# starting the master
locust --master





