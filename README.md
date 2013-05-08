Reporting Errors using A Social Network
=======================================

This software is curently under development and does not provide any working version.

Come back later!

Hosting the app
===============

Everything within the app runs client-side, so you could virtually just open the index.html. But as the app uses XML HTTP requests, which prohibit file:// URLs, a webserver is needed.

The app comes bundled with mongoose, a small, easy to use, and plattform-independant webserver. To use it, simply run

    ./tools/run.sh

As an alternative, you can host the app on any webserver. In fact, the current HEAD of the gh-pages branch is available via github.io.