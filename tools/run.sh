#!/bin/sh

## Define vars
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."
cd DIR

## Run app
echo ">>> Welcome to REaSoN! Starting up..."

#subl --project reason.sublime-project

# Start mongoose webserver
./tools/vendor/mongoose -a "/dev/stdout" -e "/dev/stderr" -r "$DIR" &

# Recompile SCSS files on change
while [[ 1 ]]; do
	inotifywait styles/src/main.scss
	sass styles/src/main.scss styles/main.css
done &


# Open webpage in default browser
xdg-open "http://localhost:8080/"

echo ">>> ... app up and running. Press any key to exit."
read
echo ">>> Bye!"
killall mongoose
killall inotifywait
killall run.sh
