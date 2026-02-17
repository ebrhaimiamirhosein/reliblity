var folderId = '';
var refreshFlag = false;
var collectionId = '';
var folderList = [];
// trim
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

$(document).ready(function () {
  $('.close-modal').click(function () {
    if (refreshFlag) {
      window.location.reload();
    } else {
      $('#myModal').modal('hide');
    }
  });

  $('.opt_area').on('click', function (e) {
    $('.group_button').hide();
    $('.add_group').show();
  });
  $('.del_area').on('click', function (e) {
    $('.group_button').hide();
    $('.remove-icon').show();
    $('.group_li input').hide();
    $('.group_li label').addClass('no-click');
    $('.group_box').append(
      $('<div>', { class: 'cancel_group' }).append(
        $('<button>', {
          text: 'Cancel',
          class: 'btn btn-primary save-modal',
          style: 'padding: 3px 6px',
        }).click(function () {
          $('.group_button').show();
          $('.remove-icon').hide();
          $('.cancel_group').hide();
          $('.group_li input').show();
          $('.group_li label').removeClass('no-click');
        })
      )
    );
  });
  $('.save_area').click(function () {
    saveData(folderId);
  });
});

function openCheck(id) {
  collectionId = id;
  $('#myModal').modal({ backdrop: 'static' });
  $('.folder-box').show();
  $('.group_button').show();
  $('.add_group').hide();
  getFolderList(collectionId, this, '');
}

// 保存到收藏夹
function saveData(gids) {
  $.ajax({
    url: contextPath + '/user/collection/update_collection_bookmark',
    type: 'post',
    dataType: 'json',
    data: JSON.stringify({ collectionId: collectionId, bookmarkId: gids }),
    contentType: 'application/json',
    success: function (data) {
      if (data.status) {
        if ($('#collection_' + collectionId)) {
          $('#collection_' + collectionId).removeClass('display-none');
          $('#collection_not_' + collectionId).addClass('display-none');
          $('#myModal').modal('hide');

          for (var k = 0; k < folderList.length; k++) {
            if (gids === folderList[k]['id']) {
              $('#collect_' + collectionId).html(folderList[k]['name']);
            }
          }
          showYxAlert('success', data.message);
        } else {
          window.location.reload();
        }
      } else {
        showYxAlert('warning', err.message);
      }
    },
    error: function (err) {
      showYxAlert('danger', err.responseJSON['message'], 2000);
      if (err.status == 401) {
        location.href = contextPath + '/user/user/login_forward';
      }
    },
  });
}

/**
 * 获取文件夹列表,如果是新增完之后刷新列表，接受新增的文件夹名称，为了能默认选中
 */
function getFolderList(id, dom, newDirName) {
  if (user == null) {
    var code = window.location.pathname;
    var param = window.location.search;
    $('#myModal').modal('hide');
    location.href = '/user/user/login_forward?tag=5&code=' + encodeURIComponent(code + param);
    return;
  }
  $.ajax({
    url: contextPath + '/user/collection/bookmarks?collectionId=' + id,
    type: 'get',
    contentType: 'application/json',
    success: function (folderData) {
      console.log(folderData);
      folderList = folderData.items;
      // 如果是新增文件夹后选中新增的文件夹
      if (newDirName) {
        for (var i = 0; i < folderData.items.length; i++) {
          if (folderData.items[i].name === newDirName) {
            folderData.items[i].checked = 1;
          } else {
            folderData.items[i].checked = 0;
          }
        }
      }
      if (folderData.status) {
        appendFolderList(collectionId, folderData.items, dom);
        $('.add_group').remove();
        $('.cancel_group').remove();
        $('.group_box').append(
          $('<div class="add_group">')
            .append(
              $('<input>', {
                id: 'group-name',
                class: 'form-control',
                autocomplete: 'off',
                placeholder: 'Please input folder name',
                maxlength: 200,
              })
            )
            .append(
              $('<button>', {
                text: 'Create',
                class: 'btn btn-primary save-modal',
                type: 'button',
                style: 'margin-top: 10px;',
              }).click(function () {
                var groupName = $('#group-name').val();
                if (!groupName.trim()) {
                  showYxAlert('info', 'Please input folder name');
                  return;
                }
                var dirName = $('#group-name').val();
                $.ajax({
                  url: contextPath + '/user/collection/add_bookmarks',
                  type: 'post',
                  dataType: 'json',
                  contentType: 'application/json',
                  data: JSON.stringify({ dirName: dirName }),
                  success: function (data) {
                    if (data.errCode == 0) {
                      // 新增完之后，传入新增的文件夹名称，为了选中新增的文件夹；
                      getFolderList(collectionId, dom, dirName);
                      $('#group-name').val('');
                      $('.group_button').show();
                      $('.add_group').hide();
                    } else {
                      showYxAlert('danger', data.message);
                    }
                  },
                  error: function (err) {},
                });
              })
            )
            .append(
              $('<button>', {
                text: 'Cancel',
                type: 'button',
                class: 'btn btn-primary save-modal',
                style: 'margin-top: 10px;margin-left: 10px;',
              }).click(function () {
                $('#group-name').val('');
                $('.group_button').show();
                $('.add_group').hide();
              })
            )
        );
      }
    },
    error: function (err) {
      showYxAlert('danger', err.message);
    },
  });
}

/**
 * 初始化文件夹列表
 * @param uid
 * @param folderData
 * @param dom
 */
// foreach兼容IE8
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function forEach(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

function appendFolderList(uid, folderData, dom) {
  $('.group_list').html('');
  if (folderData.length > 0) {
    $('.del_area').show();
    folderData.forEach(function (v, i) {
      $('.group_list').append(
        $('<li class="group_li">').append(
          v.checked === 1
            ? $('<label>', { style: 'cursor: pointer' })
                .append(
                  $('<input>', {
                    type: 'radio',
                    id: 'id_' + v.id,
                    checked: true,
                    name: 'folderId',
                  }),
                  $('<span>', { text: v.name })
                )
                .on('change', function (e) {
                  setGroup(folderData, uid, v.id, 1);
                })
            : $('<label>', { style: 'cursor: pointer' })
                .append(
                  $('<input>', {
                    type: 'radio',
                    id: 'id_' + v.id,
                    name: 'folderId',
                  }),
                  $('<span>', { text: v.name })
                )
                .on('change', function (e) {
                  setGroup(folderData, uid, v.id, 1);
                }),
          $('<i>', { class: 'glyphicon glyphicon-remove remove-icon' }).click(function () {
            deleteGroup(v.id, dom);
          })
        )
      );
    });
  } else {
    $('.del_area').hide();
  }
  setGroup(folderData, uid, 0, 0);
}

/**
 * 单条数据勾选文件夹
 */
function setGroup(data, uid, gid, flag) {
  console.log(data);
  console.log(gid);
  folderId = '';
  if (flag) {
    for (var i = 0; i < data.length; i++) {
      data[i].checked = 0;
      if (gid === data[i].id) {
        if (data[i].checked === 0) {
          data[i].checked = 1;
        }
      }
    }
  }
  for (var j = 0; j < data.length; j++) {
    if (data[j].checked === 1) {
      folderId = data[j].id;
    }
  }
  console.log(folderId);
  return folderId;
}

/**
 * 删除文件夹
 * @param gid
 * @param dom
 */
function deleteGroup(gid, dom) {
  $.ajax({
    url: contextPath + '/user/collection/delete_bookmarks?id=' + gid,
    type: 'get',
    contentType: 'application/json',
    success: function (data) {
      if (data.status) {
        getFolderList(collectionId, dom, '');
        $('.group_button').show();
        $('.cancel_group').hide();
        return (refreshFlag = true);
      } else {
        showYxAlert('warning', data.message);
      }
    },
    error: function (err) {
      showYxAlert('danger', err.statusText);
    },
  });
}
