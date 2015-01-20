#!/bin/bash

NODE=/usr/bin/node
SERVER_JS_FILE=/home/debian/Desktop/haworth/cam.js
USER=root
OUT=/home/debian/Desktop/nodejs.log

case "$1" in

start)
    echo "starting node: $NODE $SERVER_JS_FILE"
    sudo -u $USER $NODE $SERVER_JS_FILE > $OUT 2>$OUT &
    ;;

stop)
    killall $NODE
    ;;

*)
    echo "usage: $0 (start|stop)"
esac

exit 0