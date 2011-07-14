#!/usr/bin/env node

var net = require('net');
var socks = {};
var nicks = {};
var id = 0;

var connectionListener = function (sock)
{
    var dataListener = function (data)
    {
        if (data == 'WANNAID:001')
        {
            id++;
            sock.write('GNICK:'+id, 'utf8');
            
            socks[id+''] = sock;
            nicks[id+''] = '';
        }
        else
        {
            mess = data.split(":DELIMITER:");
            console.log(mess);
            if (!nicks[mess[0]])
            {
                nicks[mess[0]] = mess[1];
            }
            else
            {
                for (var i in socks)
                {
                    if(i != mess[0])
                        socks[i].write(nicks[mess[0]].slice(0,-1) + ":" + mess[1].slice(0,-1), 'utf8');
                }
            }
        }
    }
    sock.setEncoding('utf8');
    sock.addListener('data', dataListener);
    sock.addListener('close', function(){
            for (var i in socks)
            {
                if (socks[i] == sock)
                {
                    console.log(nicks[i]+" disconnected");
                    delete socks[i];
                    delete nicks[i];
                }
            }
            });
};

var server = net.createServer(connectionListener);
server.listen(8124, 'localhost');
