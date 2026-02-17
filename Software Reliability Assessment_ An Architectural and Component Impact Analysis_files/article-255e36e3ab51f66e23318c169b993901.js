// 显示作者结构信息
function showAuthUnit(flag) {
  var dom = $('.art-authors-unit-inner1');
  var height = dom.height();
  var dom2 = $('.art-authors-unit-inner2');
  var height2 = dom2.height();
  if (flag === 1) {
    $('.art-authors-more1').css('display', 'none');
    $('.art-authors-less1').css('display', 'inline-block');
    $('.art-authors-unit1').css('height', height + 15);
    dom.css('margin-bottom', '20px');
  } else if (flag === 2) {
    $('.art-authors-more1').css('display', 'inline-block');
    $('.art-authors-less1').css('display', 'none');
    $('.art-authors-unit1').css('height', 0);
    dom.css('margin-bottom', 0);
  } else if (flag === 3) {
    $('.art-authors-more2').css('display', 'none');
    $('.art-authors-less2').css('display', 'inline-block');
    $('.art-authors-unit2').css('height', height2 + 15);
    dom.css('margin-bottom', '20px');
  } else if (flag === 4) {
    $('.art-authors-more2').css('display', 'inline-block');
    $('.art-authors-less2').css('display', 'none');
    $('.art-authors-unit2').css('height', 0);
    dom.css('margin-bottom', 0);
  }
}

$(document).ready(function () {
  var audios = document.getElementsByName('audio-inner');
  // 给play事件绑定播放函数
  [].forEach.call(audios, function (i, index) {
    i.addEventListener('play', pauseAll.bind(i, index, 1));
  });
  var videos = document.getElementsByName('video-inner');
  // 给play事件绑定播放函数
  [].forEach.call(videos, function (i, index) {
    i.addEventListener('play', pauseAll.bind(i, index, 2));
  });
  $('#v4_art_main_left').css('max-height', $(window).height() - 85 + 'px');
});
setTimeout(function () {
  document.body.scrollTop !== 0 ? (document.body.scrollTop = 0) : null;
}, 0);
// 暂停函数
function pauseAll(ind, type) {
  var audios = document.getElementsByTagName('audio');
  var videos = document.getElementsByTagName('video');
  var self = this;
  var doms = type === 1 ? audios : videos;
  [].forEach.call(doms, function (i, index) {
    // 将audios中其他的audio全部暂停
    i !== self && i.pause();
    if (ind === index) {
      addPlayNum(self.dataset.id, self.dataset.journalId, type);
    }
  });
}
// 播放统计
function addPlayNum(id, journalId, type) {
  $.ajax({
    url: '/article/enhance_stat_add?id=' + id + '&journalId=' + journalId + '&type=' + type,
    type: 'get',
    data: '',
    success: function (result) {
      if (result.errCode == 0) {
      } else {
        showYxAlert('warning', 'Operation encountered an error, please try again!');
      }
    },
    error: function (err) {
      showYxAlert('danger', err.statusText);
    },
  });
}

// 点击节点将节点对应内容滚动到可视范围
function turnCurrentNode(event) {
  var id = event.toString().replace('content_', '');
  var dom = $('#' + id);
  if (dom[0].nodeName === 'TABLE') {
    $(window).scrollTop($(dom[0].parentNode).offset().top - 150);
  } else {
    $(window).scrollTop(dom.offset().top - 150);
  }
  dom.css('backgroundColor', '#eee');
  setTimeout(function () {
    dom.css('backgroundColor', 'initial');
  }, 1000);
}

// 正文references点击定位下面references
function findReferencesById(event) {
  $('.article-html-table-modal').css('margin-left', '-100%');
  event = event || window.event;
  event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
  var id = 'r_' + $(event.target).attr('rid');
  var dom = $('#' + id);
  $(window).scrollTop(dom.offset().top - 100);
  dom.parent().css('backgroundColor', '#eee');
  setTimeout(function () {
    dom.parent().css('backgroundColor', 'initial');
  }, 1000);
  $('html,body').animate({ scrollLeft: 0 }, 100);
}

// 下面references点击定位正文references
function findReferencesInContentById(event) {
  var id = $(event).attr('id').replace('r_', '');
  var dom = $('.' + id);
  $(window).scrollTop($(dom[0]).offset().top - 100);
  for (var i = 0; i < dom.length; i++) {
    $(dom[i]).css('color', 'orange');
  }
  setTimeout(function () {
    for (var i = 0; i < dom.length; i++) {
      $(dom[i]).css('color', '#337ab7');
    }
  }, 1000);
}

//正文脚注点击定位下面的脚注
function findFnById(event) {
  event = event || window.event;
  event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
  var id = 'f_' + $(event.target).attr('rid');
  var dom = $('#' + id);
  $(window).scrollTop(dom.offset().top - 100);
  dom.parent().css('backgroundColor', '#eee');
  setTimeout(function () {
    dom.parent().css('backgroundColor', 'initial');
  }, 1000);
  $('html,body').animate({ scrollLeft: 0 }, 100);
}

// 下面脚注点击定位正文脚注
function findFnInContentById(event) {
  var id = $(event).attr('id').replace('f_', '');
  var dom = $('xref[rid=' + id + ']');
  $(window).scrollTop($(dom[0]).offset().top - 100);
  for (var i = 0; i < dom.length; i++) {
    $(dom[i]).css('color', 'orange');
  }
  setTimeout(function () {
    for (var i = 0; i < dom.length; i++) {
      $(dom[i]).css('color', '#337ab7');
    }
  }, 1000);
}

function jumpKeyword(keyword) {
  const params = {
    keywordDTO: [{ type: 'keywords', key: keyword.replace(/<[^>]*>/g, ''), key2: '', tag: 1 }],
    pageNo: 1,
    pageSize: 25,
    orderBy: 0,
    keyword: '',
    startTime: '',
    endTime: '',
  };
  let param = { ...params, showType: 'article', typeArrMap: {} };
  $.ajax({
    url: '/search/put_search_param',
    type: 'post',
    data: JSON.stringify({ param: JSON.stringify(param) }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      if (data.errCode == 0) {
        const token = data.object;
        let queryParams = param;
        queryParams = $.param({ ...queryParams, q: token });
        if (document.documentElement.clientWidth < 768) {
          window.location.href = '/search/to_search_page?' + queryParams;
        } else {
          window.open('/search/to_search_page?' + queryParams);
        }
      } else {
        showYxAlert('warning', 'Operation encountered an error, please try again!');
      }
    },
    error: function (err) {
      showYxAlert('danger', err.statusText);
    },
  });
}

// 头部按钮和左侧菜单滚动条滚动固定
window.addEventListener('scroll', function () {
  // 底部进入可视范围后，重新计算左侧导航的高度
  $('#v4_art_main_left').css('max-height', $(window).height() - 85 + 'px');
  // 头部按钮和左侧菜单滚动条滚动固定
  if (document.getElementById('v4_art_top').getBoundingClientRect().top < 0) {
    $('#v4_art_top_main').css({ position: 'fixed', 'background-color': '#f5f7fa' });
    // if (document.getElementById('footer').getBoundingClientRect().top < $(window).height()) {
    //   var top = 48 - ($(window).height() - document.getElementById('footer').getBoundingClientRect().top);
    //   $('#v4_art_main_left').css({position: 'fixed','top': top + 'px'});
    // } else {
    //   $('#v4_art_main_left').css({ position: 'fixed', top: '48px' });
    // }
  } else {
    $('#v4_art_top_main').css({ position: 'relative', 'background-color': 'transparent' });
    // $('#v4_art_main_left').css({ position: 'relative', top: '0' });
  }
});
