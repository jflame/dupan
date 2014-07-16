(function() {
  var a = document.createElement("a");
  a.className = "btn share-btn";
  a.style.display = "inline-block";
  a.id = "personalTrans";
  a.innerHTML = '<span class="ico"></span><span class="btn-val">私密分享</span>'
  document.querySelector('.module-list-toolbar').querySelector('.bar').appendChild(a);

  a.addEventListener("click", function() {
    var data = require("common:widget/data-center/data-center.js"),
        items = data.get("tmpl-selected-list")();

    if(items.length != 1) {
      return alert("一次只能分享一个文件");
    }
    if(items[0].isdir) {
      return alert("不能分享文件夹");
    }
    if(items[0].size < 256*1024) {
      return alert("文件必须大于256kb");
    }
    if(items[0].md5 && items[0].size && items[0].server_filename) {
      return window.postMessage({file: items[0]}, "*");
    }
    return alert("文件出问题了！");
  }, false);
}())