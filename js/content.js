/*inject js*/
var script = document.createElement("script");
script.src = chrome.extension.getURL('/js/inject.js');
document.body.appendChild(script);

/*******/
window.addEventListener("message", function(event) {
  if (event.source != window) return;
  if (!event.data.file) return;
  var file = event.data.file;
  smd5(file);
}, false); 

/*compute the smd5*/
function smd5(file) { 
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file.dlink, true);
  xhr.setRequestHeader("Range", "bytes=0-262143");
  xhr.responseType = 'blob';
  xhr.onload = function(e) {
    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var spark = new SparkMD5();
      spark.appendBinary(e.target.result); 
      var smd5 = spark.end();
      upload(smd5, file);
    };  
    fileReader.readAsBinaryString(this.response);
  };
  xhr.send();
}   
/*upload the hash to cloud*/
function upload(smd5, file) { 
  var data = {};
  data.smd5 = smd5;
  data.md5 = file.md5;
  data.size = file.size;
  data.server_filename = file.server_filename;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "https://cn.avoscloud.com/1/classes/TransFile", true);
  xhr.setRequestHeader("X-AVOSCloud-Application-Id", "6b6vd1z0egkkta3dh3yfjcogiuzvtung8pog91ox0etun4tx");
  xhr.setRequestHeader("X-AVOSCloud-Application-Key", "qmb1keudcoj07wy5p2x0axyr01h13n01lfnxu14atf7nx8rq");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function(e) {
    var json = JSON.parse(this.responseText);
    alert("分享地址: " + "\n" + json.objectId);
  };
  xhr.send(JSON.stringify(data));
}   