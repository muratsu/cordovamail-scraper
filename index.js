var fs = require('fs');
var path = require('path');
var request = require('request');
var parser = require('xml2json');
var Q = require('q');

for (var i = 1; i < 13; i++) {    
    downloadMonth(i);
};

function downloadMonth(month, year) {
    year = year || 2014;
    var url = 'http://mail-archives.apache.org/mod_mbox/cordova-dev/2014' + (month < 10?"0"+month:month) + '.mbox/ajax/date?0';
    
    requestURL(url).then(function(html) {
        return Q.promise(function(resolve, reject) {
            var json = JSON.parse(parser.toJson(html));
            try {
                if (!fs.existsSync(path.join(process.cwd(), "data"))) 
                    fs.mkdirSync(path.join(process.cwd(), "data"));
                if (!fs.existsSync(path.join(process.cwd(), "data", year + ""))) 
                    fs.mkdirSync(path.join(process.cwd(),"data", year + ""));
                fs.writeFileSync(path.join(process.cwd(), "data", year + "", month + ".json"), JSON.stringify(json));
                resolve(json);
            } catch (error) {
                console.log(error);
                reject(new Error("ERR: " + error));
            }
        })
    }).then(function(json){
        for (var i = 0; i < json.index.message.length; i++) {
            downloadMessages(year, month, json.index.message[i].id, Date.parse(json.index.message[i].date));
        };
    })
}

function downloadMessages(year, month, id, date) {
    var subUrl = 'http://mail-archives.apache.org/mod_mbox/cordova-dev/2014' + (month < 10?"0"+month:month) + '.mbox/raw/'

    request(subUrl + id, function(error, response, html){
        fs.writeFileSync(path.join(process.cwd(), "data", year + "", date + ".dat"), html);
    })
}

function requestURL(url) {
    return Q.promise(function(resolve, reject) {
        request(url, function(error, response, html) {
            if(!error) {
                resolve(html);
            } else {
                console.log(error);
                reject(new Error("ERR: " + error));
            }
        })
    })
}