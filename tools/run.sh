#!/bin/sh

# Define vars
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

# Run app
./tools/vendor/mongoose -a "/dev/stdout" -e "/dev/stderr" -r "$DIR/htdocs"
xdg-open "http://localhost:8080/"