exports.Chatter = function (domain, port)
{
    EE = require('events').EventEmitter;
    net = require('net');
    var sock = net.Socket();
    var id = '';
    var nick = '';
    var connected = 0;
    this.sChat = new EE();
    this.stat = 0;
    var callSch = this.sChat;
    sock.setEncoding('utf8');
    this.Connect = function () {
        if (connected == 0) 
        {
            sock.connect(port, domain, function ()
            {
                sock.write("WANNAID:001", "utf8");
                connected = 1;
                this.stat = 1;
                sock.on('data', function (data)
                {
                    if (data.search("GNICK") == 0)
                    {
                        id = data.split(":")[1];
                        callSch.emit('connect', id);
                    }
                    else
                    {
                        callSch.emit('data', data);
                    }
                });
            });
            return(0);
        }
        else {
            return(-1);
        };
    };
    this.Disconnect = function () {
        if (connected != 0) {
            sock.end();
            connected = 0;
            this.stat = 0;
            callSch.emit('disconnect');
            return(0);
        }
        else {
            return(-1);
        };
    };
    this.Send = function (data) {
        if (connected != 0) {
            sock.write(id+":DELIMITER:"+data);
            return(0);
        }
        else {
            return(-1);
        };
    };
};
