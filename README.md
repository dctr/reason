REaSoN
======

This branch persists the node.js version of the program. It is currently orphaned but still contains some data that might be relevant for the new client-only version.

Hosting the app
===============

Everything within the app runs client-side, so you could virtually just open the index.html. But as the app uses XML HTTP requests, which prohibit file:// URLs, a webserver is needed.

The app comes bundled with mongoose, a small, easy to use, and plattform-independant webserver. To use it, simply run

    ./tools/run.sh

As an alternative, you can host the app on any webserver. If you do so, consider using the HTML5 offline cache option for all files, so the client can cache all files.


Setup
=====

Host the HTML directory throug any webserver. No special options required.
