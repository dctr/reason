#!/bin/sh
#
# Just a small script that hosts the project on a small local webserver
# and watches the main.scss files for changes to recompile on the fly.

## Define vars
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."
cd DIR

## Run app
echo ">>> Welcome to REaSoN! Starting up..."

# Start mongoose webserver
./tools/vendor/mongoose -a "/dev/stdout" -e "/dev/stderr" -r "$DIR" &

# Recompile SCSS files on change
while [[ 1 ]]; do
	inotifywait styles/src/main.scss
	sass styles/src/main.scss styles/main.css
done &

echo ">>> ... app up and running. Press any key to exit."
read
echo ">>> Bye!"

killall mongoose
killall inotifywait
killall run.sh
