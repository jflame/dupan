/*inject js*/
(function() {
  var script = document.createElement("script");
  script.src = chrome.extension.getURL('/js/inject.js');
  document.body.appendChild(script);

  var div = document.createElement("div");
  div.className = "centerbox";
  div.innerHTML = ' \
    <div id="appMsg"> \
      <div id="appHead"> \
        <a title="关闭" id="appClose">×</a> \
      </div> \
      <div id="appPro"></div> \
      <div id="appBody"></div> \
    </div>';
  var parent = document.body;
  parent.insertBefore(div, parent.childNodes[0]);

  div.querySelector('#appClose').addEventListener("click", function(e) {
      div.querySelector("#appMsg").classList.remove('show');
  }, true); 
}());
/*the progress*/
var options = {
  bg: 'rgb(39, 93, 207)',
  target: document.querySelector('#appPro'),
  id: 'mynano'
};
var nanobar = new Nanobar(options);

/*******/
window.addEventListener("message", function(event) {
  if (event.source != window) 
    return;
  if (!event.data.file) 
    return;
  var file = event.data.file;
  file.dlink = "http://pcs.baidu.com/rest/2.0/pcs/file?app_id=250528&method=download&path=" + encodeURIComponent(file.path);
  dialog(1);
  md5(file);
}, false); 

/*check the file's md5*/
function md5(file) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', file.dlink, true);
  xhr.onload = function(e) { 
    var md5 = this.getResponseHeader("Content-MD5");
    if(!md5) {
      //return alert("文件信息错误，请重新上传该文件");
      return dialog(2);
    }
    file.md5 = md5;
    smd5(file);
  };
  xhr.ontimeout = xhr.onerror = function(e) {
    return dialog();
  };
  xhr.timeout = 10000;
  xhr.send();
}
/*compute the smd5*/
function smd5(file) { 
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file.dlink, true);
  xhr.setRequestHeader("Range", "bytes=0-262143");
  xhr.responseType = 'blob';
  xhr.onprogress = function(e) {
    if (e.lengthComputable) {
      nanobar.go((e.loaded / e.total) * 100);
    }
  };
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
  xhr.ontimeout = xhr.onerror = function(e) {
    return dialog();
  };
  xhr.timeout = 10000;
  xhr.send();
}   
/*upload the hash to cloud*/
function upload(file) { 
  var data = {
    smd5: file.smd5,
    md5: file.md5,
    size: file.size,
    server_filename: file.server_filename
  };
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "https://cn.avoscloud.com/1/classes/TransFile", true);
  xhr.setRequestHeader("X-AVOSCloud-Application-Id", "6b6vd1z0egkkta3dh3yfjcogiuzvtung8pog91ox0etun4tx");
  xhr.setRequestHeader("X-AVOSCloud-Application-Key", "qmb1keudcoj07wy5p2x0axyr01h13n01lfnxu14atf7nx8rq");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function(e) {
    var json = JSON.parse(this.responseText);
    //alert("分享地址: " + "\n" + "http://dutrans.duapp.com/share/" + json.objectId);
    dialog(3, json.objectId);
  };
  xhr.ontimeout = xhr.onerror = function(e) {
    return dialog();
  };
  xhr.timeout = 10000;
  xhr.send(JSON.stringify(data));
}   

function dialog(state, extra) {
  var extra = extra || "",
      msg  = document.querySelector('#appMsg'),
      body = document.querySelector('#appBody'),
      showText = function (e) {
        body.innerText = e;
      },
      close = function () {
        setTimeout(function() {
          msg.classList.remove('show');
        }, 5000);
      };

  msg.classList.add('show');
  switch(state) {
    case 1:
      showText('正在获取文件信息...');
      break;
    case 2:
      showText('文件信息错误，请重新上传该文件');
      close();
      break;
    case 3:
      showText('分享地址: \n http://dutrans.duapp.com/share/'+ extra);
      break;
    default:
      showText('网络错误，请稍后再试');
      close();
  }
}

