#!/bin/sh

# Define vars
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

# Run app
echo ">>> Welcome to REaSoN! Starting up..."
./tools/vendor/mongoose -a "/dev/stdout" -e "/dev/stderr" -r "$DIR/htdocs" &
xdg-open "http://localhost:8080/"
echo ">>> ... app up and running. Press any key to exit."
read
killall mongoose
sleep 1
echo ">>> Bye!"