$(document).ready(function() {
  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });
  // getList('');

  // enter搜索
  $('#search').keypress(function(even) {
    if (even.which == 13) {
      getList($('#search').val().trim());
    }
  });

  // 初始化subject的more；
  initSubjectMore();

});

// 获取cite的内容
function getCiteContent(id) {
  $('#citeModal').modal({ backdrop: 'static' });
  $.ajax({
    url: contextPath + '/journal/get_cite_content?id=' + id,
    type: 'get',
    success: function(data) {
      console.log(data);
      var citeTemp = document.getElementById('cite-modal-list');
      var boxLeft = '<div class="body-left">' +
        '        <div class="item-boxs">' +
        '            <div class="cite-item-box cite-tab-1" onclick="changeCiteNav(1)">GB/T 7714-2015</div>' +
        '            <div class="cite-item-box cite-tab-2" onclick="changeCiteNav(2)">EndNote(RIS)</div>' +
        '            <div class="cite-item-box cite-tab-3" onclick="changeCiteNav(3)">BibTeX</div>' +
        '            <div class="cite-item-box cite-tab-4" onclick="changeCiteNav(4)">NoteExpress</div>' +
        '            <div class="cite-item-box cite-tab-5" onclick="changeCiteNav(5)">Refworks</div>' +
        '        </div>' +
        '    </div>';
      var boxRight = '<div class="body-right">' +
        '        <div class="item-contents">' +
        '            <div class="cite-item-content cite_1">' +
        '                  <textarea  rows="20" id="cite_1">' + data.gbt + '</textarea>' +
        '            </div>' +
        '            <div class="cite-item-content cite_2">' +
        '                <textarea rows="20" id="cite_2">' + data.ris + '</textarea>' +
        '            </div>' +
        '            <div class="cite-item-content cite_3">' +
        '                <textarea rows="20" id="cite_3">' + data.bib + '</textarea>' +
        '            </div>' +
        '            <div class="cite-item-content cite_4">' +
        '                <textarea rows="20" id="cite_4">' + data.note + '</textarea>' +
        '            </div>' +
        '            <div class="cite-item-content cite_5">' +
        '                <textarea rows="20" id="cite_5">' + data.ref + '</textarea>' +
        '            </div>' +
        '        </div>' +
        '        <div class="item-bottom">' +
        '            <div class="bottom-buttons cite_1">' +
        '                <div class="button-paste" onclick="citeCopy(1)">' +
        '                    <img src="/assets/img/article/article-paste.png" />' +
        '                    <span>Paste</span>' +
        '                </div>' +
        '                <div class="button-download">' +
        '                    <a target="_blank"' + 'href=/article/download_ris?tag=1&id=' + id + '>' +
        '                        <img src="/assets/img/article/article-download2.png" />' +
        '                        <span>Download</span>' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '            <div class="bottom-buttons cite_2">' +
        '                <div class="button-paste" onclick="citeCopy(2)">' +
        '                    <img src="/assets/img/article/article-paste.png" />' +
        '                    Paste' +
        '                </div>' +
        '                <div class="button-download">' +
        '                    <a target="_blank"' + 'href=/article/download_ris?tag=2&id=' + id + '>' +
        '                        <img src="/assets/img/article/article-download2.png" />' +
        '                        Download' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '            <div class="bottom-buttons cite_3">' +
        '                <div class="button-paste" onclick="citeCopy(3)">' +
        '                    <img src="/assets/img/article/article-paste.png" />' +
        '                    <span>Paste</span>' +
        '                </div>' +
        '                <div class="button-download">' +
        '                    <a target="_blank"' + 'href=/article/download_ris?tag=3&id=' + id + '>' +
        '                        <img src="/assets/img/article/article-download2.png" />' +
        '                        <span>Download</span>' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '            <div class="bottom-buttons cite_4">' +
        '                <div class="button-paste" onclick="citeCopy(4)">' +
        '                    <img src="/assets/img/article/article-paste.png" />' +
        '                    <span>Paste</span>' +
        '                </div>' +
        '                <div class="button-download">' +
        '                    <a target="_blank"' + 'href=/article/download_ris?tag=4&id=' + id + '>' +
        '                        <img src="/assets/img/article/article-download2.png" />' +
        '                        <span>Download</span>' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '            <div class="bottom-buttons cite_5">' +
        '                <div class="button-paste" onclick="citeCopy(5)">' +
        '                    <img src="/assets/img/article/article-paste.png" />' +
        '                    <span>Paste</span>' +
        '                </div>' +
        '                <div class="button-download">' +
        '                    <a target="_blank"' + 'href=/article/download_ris?tag=5&id=' + id + '>' +
        '                        <img src="/assets/img/article/article-download2.png" />' +
        '                        <span>Download</span>' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>';
      citeTemp.innerHTML = boxLeft + boxRight;
      for (var i = 1; i < 6; i++) {
        tinymce.remove('#cite_' + i);
        tinymce.init({
          selector: '#cite_' + i,
          branding: false,
          statusbar: false,
          elementpath: false,
          menubar: false,
          toolbar: false,
          // language: 'zh_CN',
          height: 300,
          width: '100%',
          readonly: true,
        });
      }
      changeCiteNav(1);
    },
    error: function(err) {
      alert(err.toString());
      console.log(err.statusText);
    },
  });
}

// cite this article 模态切换选项卡
function changeCiteNav(flag) {
  $('.cite-item-box').removeClass('cite-item-on');
  $('.cite-item-content').css('display', 'none');
  $('.cite-tab-' + flag).addClass('cite-item-on');
  $('.bottom-buttons').css('display', 'none');
  $('.cite_' + flag).css('display', 'block');
}

// 复制内容
function citeCopy(flag) {
  var cnt = tinyMCE.editors['cite_' + flag].getContent({ format: 'text' });
  console.log(cnt);
  clipboard.writeText(cnt);
  showYxAlert('success', 'Copied!');
}

// 删除
function deleteItem(id) {
  console.log(id);
  $.ajax({
    url: contextPath + '/user/collection/cancel?id=' + id,
    type: 'put',
    data: '',
    dataType: 'json',
    contentType: 'application/json',
    success: function(data) {
      window.location.reload();
      alert(data.message);
      console.log(data);
      // getList();
    },
    error: function(err) {
      showYxAlert('danger', err.responseJSON['message'], 2000);
      if (err.status == 401){
        location.href = contextPath +'/user/user/login_forward';
      }
    },
  });
}

//查看更多作者
function showAuthor(flag, id) {
  if (flag === 1) {
    $('#author_more_' + id).css('display', 'none');
    $('#authors_' + id).css('display', 'initial');
    $('#author_less_' + id).css('display', 'initial');
  } else {
    $('#author_more_' + id).css('display', 'initial');
    $('#authors_' + id).css('display', 'none');
    $('#author_less_' + id).css('display', 'none');
  }
}

// 收藏/取消收藏
function collection(flag, id) {
  if (id !== 'collect_0') {
    if (user == null) {
      showYxAlert('warning', 'You are not currently logged in, please log in and operate!');
      var code = window.location.pathname;
      var param = window.location.search;
      $('#myModal').modal('hide');
      location.href = '/user/user/login_forward?tag=5&code=' + encodeURIComponent(code + param);
      return;
    }
    $.ajax({
      url: contextPath + '/user/user/collection',
      type: 'post',
      data: JSON.stringify({ id: id, flag: flag }),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        if (data.errCode === 2) {
          showYxAlert('warning', data.message);
          $('#myModal').modal('hide');
          location.href = contextPath + '/user/user/login_forward';
        } else if (data.errCode === 0) {
          if (flag === 1) {
            $('#collection_' + id).removeClass('display-none');
            $('#collection_not_' + id).addClass('display-none');
            showYxAlert('success', data.message);
          } else if (flag === 2) {
            $('#collection_' + id).addClass('display-none');
            $('#collection_not_' + id).removeClass('display-none');
            showYxAlert('success', data.message);
          }
        } else if (data.errCode === 1) {
          showYxAlert('warning', data.message);
        }
      },
      error: function(err) {
        showYxAlert('danger', err.responseJSON['message'], 4000);
        if (err.status == 401) {
          location.href = contextPath + '/user/user/login_forward';
        }
      },
    });
  } else {
    if (flag === 1) {
      $('#collection_' + id).removeClass('display-none');
      $('#collection_not_' + id).addClass('display-none');
    } else if (flag === 2) {
      $('#collection_' + id).addClass('display-none');
      $('#collection_not_' + id).removeClass('display-none');
    }
  }

}


function deleteCollection(flag, id) {
  if (user == null) {
    showYxAlert('warning', 'You are not currently logged in, please log in and operate!');
    var code = window.location.pathname;
    var param = window.location.search;
    location.href = '/user/user/login_forward?tag=5&code=' + encodeURIComponent(code + param);
    return;
  }
  $('.delete-icon').addClass('no-click');
  $.ajax({
    url: contextPath + '/user/user/collection',
    type: 'post',
    data: JSON.stringify({ id: id, flag: flag }),
    dataType: 'json',
    contentType: 'application/json',
    success: function(data) {
      $('.delete-icon').removeClass('no-click');
      if (data.errCode == 2) {
        showYxAlert('warning', data.message);
        location.href = contextPath + '/user/user/login_forward';
      } else if (data.errCode == 0) {
        location.href = contextPath + '/user/collection/collection';
      } else if (data.errCode == 1) {
        alert(data.message);
      }
    },
    error: function(err) {
      showYxAlert('danger', err.responseJSON['message'], 2000);
      if (err.status == 401){
        location.href = contextPath +'/user/user/login_forward';
      }
    },
  });
}


// // current issue 点击封面大图显示
// $('#coverModal').on('show.bs.modal', function(event) {
//   if ($(event.relatedTarget).data('whatever') === 'cover') {
//     $('.cover').css('display', 'inline-block');
//     $('.back-cover').css('display', 'none');
//   } else {
//     $('.cover').css('display', 'none');
//     $('.back-cover').css('display', 'inline-block');
//   }
// });

/**
 * follow this author
 */
function followAuthor(id, flag) {
  if (user == null) {
    showYxAlert('warning', 'You are not currently logged in, please log in and operate!');
    var code = window.location.pathname;
    var param = window.location.search;
    location.href = '/user/user/login_forward?tag=5&code=' + encodeURIComponent(code + param);
    return;
  }
  $.ajax({
    url: contextPath + '/user/author/follow',
    type: 'post',
    data: JSON.stringify({ authorIds: [id], flag: flag + 1 }),
    dataType: 'json',
    contentType: 'application/json',
    success: function(data) {
      if (data.status) {
        window.location.reload();
      } else {
        showYxAlert('warning', data.message);
      }
    },
    error: function(err) {
      showYxAlert('danger', err.responseJSON['message']);
      if (err.status == 401) {
        location.href = contextPath + '/user/user/login_forward';
      }
    },
  });
}

// subject more是否显示
function initSubjectMore() {
  const subjectArr = $('.subject-level-content');
  for (var i = 0; i < subjectArr.length; i++) {
    console.log($(subjectArr[i]).height());
    if ($(subjectArr[i]).height() > 24) {
      subjectShowMore($(subjectArr[i]).next(),1)
    }
  }
}

// subject的more和less切换
function subjectShowMore(event, flag) {
  var subjectDom = $(event);
  if (flag === 1) {
    console.log('height:', $(subjectDom.parent().children()[1]).height());
    subjectDom.parent().parent().css('height', $(subjectDom.parent().children()[1]).height());
    subjectDom.css('display', 'none');
    $(event).next().css('display', 'block');
  } else {
    subjectDom.parent().parent().css('height', '24px');
    subjectDom.css('display', 'none');
    subjectDom.prev().css('display', 'block');
  }
}

// 选中学科
function selectSubject(event, flag) {
  var subjectDom = $(event);
  if (!subjectDom.hasClass('subject-active')) {
    subjectDom.parent().children().removeClass('subject-active');
    subjectDom.addClass('subject-active');
  }
  if (flag === 1) {
    loadSubject(subjectDom.attr('data-id'));
  } else if (flag === 2) {
    loadSubject(subjectDom.attr('data-id'));
  } else if (flag === 3) {
    loadSubject(subjectDom.attr('data-id'));
  }
}

// 加载学科
function loadSubject(id) {
  initSubjectMore();
  location.href = '/journal/of_classify?id=' + id;

}

