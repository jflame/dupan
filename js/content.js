/*inject js*/
(function() {
  var script = document.createElement("script");
  script.src = chrome.extension.getURL('/js/inject.js');
  document.body.appendChild(script);
}());

var div = document.createElement("div");
div.className = "centerbox";
document.body.appendChild(div);
div.addEventListener("click", function(e) {
  if(e.target.className == "close") {
    e.target.parentNode.parentNode.remove();
  }
}, true); 
/*******/
window.addEventListener("message", function(event) {
  if (event.source != window) return;
  if (!event.data.file) return;
  var file = event.data.file;
  md5(file);
}, false); 
/*check the file's md5*/
function md5(file) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', file.dlink, true);
  xhr.onload = function(e) { 
    var md5 = this.getResponseHeader("Content-MD5");
    if(!md5) {
      return alert("文件信息错误，请重新上传该文件");
    }
    dialog1();
    file.md5 = md5;
    smd5(file);
  }
  xhr.send();
}
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
      file.smd5 = spark.end();
      upload(file);
    };  
    fileReader.readAsBinaryString(this.response);
  };
  xhr.send();
}   
/*upload the hash to cloud*/
function upload(file) { 
  var data = {};
  data.smd5 = file.smd5;
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
    //alert("分享地址: " + "\n" + "http://dutrans.duapp.com/share/" + json.objectId);
    dialog2(json.objectId);
  };
  xhr.send(JSON.stringify(data));
}   

function dialog1() {
  div.innerHTML = ' \
  <div class="appMsg" style="z-index: 10000;"> \
    <div class="appCont"> \
      <a href="javascript:void(0)" title="关闭" class="close">×</a> \
    </div> \
    <p>正在获取文件信息...</p> \
  </div>';
}

function dialog2(path) {
  div.innerHTML = ' \
  <div class="appMsg" style="z-index: 10000;"> \
    <div class="appCont"> \
      <a href="javascript:void(0)" title="关闭" class="close">×</a> \
    </div> \
    <p>分享地址: http://dutrans.duapp.com/share/'+ path +'</p> \
  </div>';
}