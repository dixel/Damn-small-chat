#!/usr/bin/env node

var net = require('net');
var sock = net.Socket();
var id = '';
var nick = '';

sock.setEncoding('utf8');
var connected = function ()
{
    sock.write("WANNAID:001", "utf8");
    sock.addListener('data', clane);
}
var clane = function (data)
{
    if (data.search("GNICK") == 0)
    {
        id = data.split(":")[1];
        console.log('Enter your nick');
        process.stdin.resume();
    }
    else
        console.log(data);
}
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data)
        {
            sock.write(id+":DELIMITER:"+data);
        });
sock.connect(8124, 'localhost', connected);
