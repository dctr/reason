#!/bin/sh

git pull
sublime_text --project reason.sublime-project &
./tools/autoupdate-stylesheet.sh &
node app.js