#!/usr/bin/env node
http = require('http');
EE = require('events').EventEmitter;
fs = require('fs');
sc = require('./schat');
var srvev = new EE();
var index = '';
var us = new Object();
var ud = 0;
var tarr = [];
fs.readFile('page.html', 'utf8', function(err, data) {
        index = data;
        });
srvev.on('connect', function(nick, id, res)
        {
            if (id == '')
            {
                schat = new sc.Chatter('localhost', 8124);
                schat.Connect();
                ud++;
                schat.sChat.on('connect', function(id) {
                    console.log(id);
                    schat.Send(nick + ' ');
                    tarr[ud] = id;
                    us[id] = schat;
                    us[id].msgq = "";
                    });
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write("ATT@D@" + ud);
                res.end();
            }
            else
            {
                res.end();
            }
        });
srvev.on('disconnect', function(id, res)
        {
            res.writeHead(200, {"Content-Type": "text/plain"});
            if (typeof(us[id]) != "undefined") 
            {
                us[id].Disconnect();
                res.write("DIS@D@");
            }
            res.end();
        });
srvev.on('heartbeat', function(id, res)
        {
            res.writeHead(200, {"Content-Type": "text/plain"});
            if (typeof(us[id]) != "undefined") 
            {
                res.write("HB@D@" + us[id].msgq);
                if (us[id].msgq != "")
                {
                    console.log(us[id].msgq);
                    us[id].msgq = "";
                }
            }
            res.end();
        });
srvev.on('attbeat', function(uder, res)
        {
            console.log('uder = '+uder);
            res.writeHead(200, {"Content-Type": "text/plain"});
            if (typeof(tarr[uder]) != 'undefined') 
            {
                console.log('CONNECTED!!!' + tarr[ud]);
                res.write("CON@D@" + tarr[ud]);
                us[tarr[uder]].msgq = "";
                us[tarr[uder]].sChat.on('data', function(data) {
                    us[tarr[uder]].msgq += data + '\n';
                    console.log(data);
                    });
            }
            res.end();
        });
srvev.on('sendmsg', function(id, msg, res)
        {
            console.log('sending message id:%s msg:%s', id, msg);
            res.writeHead(200, {"Content-Type": "text/html"});
            if (typeof(us[id]) != "undefined") 
            {
                us[id].Send(msg + ' ');
                us[id].msgq += msg + '\n';
            }
            res.end();
        });
Server = http.createServer(function(req, res) {
    if (req.method == 'GET')
    {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(index);
    }
    else if (req.method == 'POST')
    {
        base = req.url.split("@D@")[0]; 
        id = req.url.split("@D@")[1];
        switch(base)
        {
            case('/connect'):
                console.log("connect");
                nick = req.url.split("@D@")[2];
                srvev.emit('connect', nick, id, res);
                break;
/*            case('/disconnect'):
                srvev.emit('disconnect', id, res);
                break;*/
            case('/sendmsg'):
                msg = unescape(req.url.split('@D@')[2]);
                srvev.emit('sendmsg', id, msg, res);
                break;
            case('/heartbeat'):
                srvev.emit('heartbeat', id, res); 
                break;
            case('/attbeat'):
                console.log('ATT');
                srvev.emit('attbeat', id, res);
                break;
        }
    };
    });
Server.listen(8100);
