#!/bin/bash
# This script aims to simplyfy the automatic build of CSS files from SCCS ones.


## User variables, edit to your needs.
# Your current working directory (.) will be the root directory of the project.

# Path to node-sass script.
NODE_SASS="./node_modules/node-sass/bin/node-sass"

# Source (SCCS) and target (CSS) folders.
SOURCE="./public/stylesheets"
TARGET=$SOURCE


## Logic, do not edit unless you know what you are doing.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPTDIR/..

if [[ ! -x /usr/bin/inotifywait ]]; then
	echo "inotify tools not present. exiting."
	exit 1
else
	echo "+---------->"
	echo "| Project's directory is $(pwd)."
	echo "| Recompiling on changes to SCSS files in $SOURCE."
	echo "| Writing compiled CSS files to $TARGET."
	echo "| Press 'CTRL + C' to exit."
	echo "+---------------------------------------------------------------------->"
fi

while [[ 1 ]]; do
	FILE=$(inotifywait $SOURCE/*.scss | cut -d " " -f 1)
	echo "The file '$FILE' changed, executing "
	echo "'$NODE_SASS $FILE $TARGET/$(echo $FILE | awk -F "/" '{print $NF}' | cut -f 1 -d ".").css'."
	$NODE_SASS $FILE $TARGET/$(echo $FILE | awk -F "/" '{print $NF}' | cut -f 1 -d ".").css
done
