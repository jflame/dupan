(function() {
  var a = document.createElement("a");
  a.className="bbtn";
  a.style.outline="none";
  a.href="javascript:;";
  a.id="personalTrans";
  a.innerHTML = '<em class="icon-share"></em><b>私密分享</b>'
  document.querySelector('#file_action_buttons').appendChild(a);

  a.addEventListener("click", function() {
    var items = FileUtils.getListViewCheckedItems();
    if(items.length != 1) {
      return alert("一次只能分享一个文件");
    }
    if(items[0].isdir) {
      return alert("不能分享文件夹");
    }
    if(items[0].size < 256*1024) {
      return alert("文件必须大于256kb");
    }
    if(items[0].md5 && items[0].dlink && items[0].size && items[0].server_filename) {
      window.postMessage({file: items[0]}, "*");
    }
  }, false);
}())