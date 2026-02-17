var reviewReport = new Vue({
  el: '#review-report',
  data() {
    return {
      // 1、未发布-预览页面2、发布-前台访问 3、发布-后台访问    不传时默认是2
      ifPreview: 2,
      // 文章doi
      doi: '',
      // 版本列表
      versionList: [],
      reviewListInfo: {
        // 文章阶段： 1、Open Peer Review： Open Peer Review  2：Version of record:Review close
        articleStage: '',
        commendedNum: 0,
        revisionRequiredNum: 0,
        notCommendedNum: 0,
        // 评审报告信息列表
        reviewList: [],
        // 评审作者列表
        reviewAuthorList: [],
        // 公众评议状态：1开启 0 关闭
        allCommentsStatus: 0,
        // 公众评议列表
        allCommentsList: [],
      },
      // 大众评审模态
      commentVisible: false,
      // 评审报告doi
      reviewDoi: false,
      reviewData: {
        // 评议结论：1、Commended 2、Revision Required 3、Not Commended
        rewResult: '',
        commendedNum: 0,
        revisionRequiredNum: 0,
        notCommendedNum: 0,
        // 发布时间
        epubDate: '',
        // 文章版本号
        articleVersion: '',
        // 文章doi
        doi: '',
        // 作者序号
        num: '',
        // 名
        name: '',
        // 姓氏
        surname: '',
        // 通讯地址
        contactAddress: '',
        orcid: '',
        // 评审意见的引用
        reportCite: {
          author: '',
          title: '',
          journal: '',
          year: '',
          doi: '',
        },
        // 审稿人评审意见PDF
        reviewPdfPath: '',
        // 正文
        fullText: {
          // 正文url,  参考/article/full_text接口
          url: '',
          // 版权信息
          copyright: '',
          // 许可信息
          license: '',
          // 利益冲突
          notes: [],
          // 参考文献
          referenceList: []
        }
      },
      // 正文信息
      fullTextInfo: {
        content: [],
        images: []
      },
      // 可大图查看的图片列表
      imgShowListInfo: [],
      // cite 模态
      citeVisible: false,
    };
  },
  mounted() {
    // 未发布预览 1：https://test.home.tsinghuajournals.com/article/preview?doi=10.26599/NR.2025.9490725211&stage=4
    // 已发布 2：http://localhost:8733/article/10.26599/POM.2023.9140051
    // 已发布后台预览 3：http://localhost:8733/article/10.26599/POM.2023.9140051?ifPreview=true
    const url = window.location.href;
    this.ifPreview = url.indexOf('ifPreview=') > 0 ? 3 : url.indexOf('/article/preview?') > 0 ? 1: 2;
    if (this.ifPreview === 1) {
      this.doi = url.split('doi=')[1].split('&')[0];
    } else {
      this.doi = url.split("/article/")[1].split("?")[0].split("#")[0];
    }
    this.getVersionList();
    // 加载评审报告概述
    this.getReviewListInfo();
    // 地址栏带评审报告doi时，显示评审报告详情
    if (url.indexOf("#") > 0) {
      // 显示评审报告详情
      this.reviewDoi = url.split("#")[1];
      $("#review-gs").css('display', 'none');
      $("#review-xq").css('display', 'block');
      this.getReviewData();
    }
  },
  methods: {
    // 获取版本列表
    getVersionList() {
      axios.get(`/hyd_article/version_list?doi=${this.doi}&preview=${this.ifPreview}`).then(
        (res) => {
          if (res.data.status) {
            this.versionList = res.data.items;
            if (this.versionList.length === 0) {
              return;
            }
            let version = '<select id="version_select" onchange="changeVersion(this)" class="form-control select-operation" style="display: unset; width: unset;">';
            for (let i = 0; i < this.versionList.length; i++) {
              version = version + '<option value="' + this.versionList[i]['doi'] + '">Version ' + this.versionList[i]['version'] + '</option>';
            }
            version = version + '</select>';
            if (!$("#version")) {
              return;
            }
            $("#version").css('display', 'inline-block');
            $('#version').html(version);
            setTimeout(() => {$("#version_select").val(this.doi)}, 100);
            // 判断是否通过文章详情页切换版本进入  进入渠道： 1：通过其他页面进入；2：通过文章详情页切换版本进入
            const from = window.localStorage.getItem('article-from');
            window.localStorage.removeItem('article-from');
            if ((!from || +from !== 2) && this.doi !== this.versionList[0].doi) {
              this.$confirm('There is a newer version of this article available.', {
                confirmButtonText: 'View Latest Version',
                cancelButtonText: 'View Current Version',
                type: '',
                center: true,
                showClose: true,
                closeOnClickModal: false,
                customClass: 'review-confirm'
              }).then(() => {
                // 跳转最新版本
                window.location.href = '/article/' + this.versionList[0].doi;
              }).catch(() => {
                // 留在当前版本
              });
            }
          }
        },
        (error) => {}
      )
    },
    // 获取评议概述
    getReviewListInfo() {
      axios.get(`/hyd_article/review_list?doi=${this.doi}&preview=${this.ifPreview}`).then(
        (res) => {
          if (res.data.status) {
            this.reviewListInfo = res.data.object;
            this.reviewListInfo.reviewList.forEach(item => {
              item.hasRsp = false;
              item.reviewAuthorList.forEach(item1 => {
                if (item1.replyPdfPath) {
                  item.hasRsp = true;
                }
              })
            });
            // 文章阶段： 1、Open Peer Review： Open Peer Review  2：Version of record:Review close
            $("#rev_status").html(this.reviewListInfo.articleStage === 1 ? 'Open Peer Review' : 'Review close');
            // 评审报告数量情况
            let revStatusDet = 'Review Status: ';
            if (this.reviewListInfo.commendedNum>0) {
              revStatusDet = revStatusDet + '<span>'+ this.reviewListInfo.commendedNum + ' Commended</span>';
            }
            if (this.reviewListInfo.revisionRequiredNum>0) {
              if (this.reviewListInfo.commendedNum>0) {
                revStatusDet = revStatusDet + ', '
              }
              revStatusDet = revStatusDet + '<span>' + this.reviewListInfo.revisionRequiredNum + ' Revision Required</span>'
            }
            if (this.reviewListInfo.notCommendedNum>0) {
              if (this.reviewListInfo.revisionRequiredNum>0 || this.reviewListInfo.commendedNum>0) {
                revStatusDet = revStatusDet + ', '
              }
              revStatusDet = revStatusDet + '<span>' + this.reviewListInfo.notCommendedNum + ' Not Commended</span>'
            }
            if (this.reviewListInfo.commendedNum===0 && this.reviewListInfo.revisionRequiredNum===0 && this.reviewListInfo.notCommendedNum===0) {
              revStatusDet = revStatusDet + 'Under Peer Review';
            }
            $("#rev_status_det").html(revStatusDet);
            // 评审报告表格
            let tableHtml = '<table><thead><tr><td><div style="width: 120px;height: 28px;">&nbsp;</div></td>';
            if (this.reviewListInfo.reviewAuthorList.length === 0) {
              tableHtml = tableHtml + '<td><div style="width: 40px; margin: 0 auto;">1</div></td><td><div style="width: 40px;margin: 0 auto;">2</div></td></tr></thead><tbody>';
              this.reviewListInfo.reviewList.forEach(item => {
                if (item.doi === this.doi) {
                  tableHtml = tableHtml + '<tr class="current"><td>' + item.versionName + '<br />Review comment</td><td></td><td></td></tr>';
                } else {
                  tableHtml = tableHtml + '<tr><td>' + item.versionName + '<br />Review comment</td><td></td><td></td></tr>';
                }
              });
            } else {
              this.reviewListInfo.reviewAuthorList.forEach(item => {
                tableHtml = tableHtml + '<td>' + item.num + '</td>';
              });
              tableHtml = tableHtml + '</tr></thead><tbody>';
              this.reviewListInfo.reviewList.forEach(item => {
                if (item.hasRsp) {
                  tableHtml = tableHtml + '<tr><td>' + item.versionName + '<br />Author&nbsp;Response</td>';
                  this.reviewListInfo.reviewAuthorList.forEach(item1 => {
                    tableHtml = tableHtml + '<td>';
                    item.reviewAuthorList.forEach(rev => {
                      if (rev.num === item1.num && rev.replyPdfPath) {
                        tableHtml = tableHtml + '<a data-id="' + rev.doi + '" onclick="reviewReport.viewPdf(this, 2)">View</a>';
                      }
                    })
                    tableHtml = tableHtml + '</td>';
                  })
                  tableHtml = tableHtml + '</tr>';
                }
                tableHtml = item.doi === this.doi ? tableHtml + '<tr class="current">' : tableHtml +  '<tr>';
                tableHtml = tableHtml + '<td>' + item.versionName + '<br />Review comment</td>';
                this.reviewListInfo.reviewAuthorList.forEach(item1 => {
                  tableHtml = tableHtml + '<td>';
                  item.reviewAuthorList.forEach(rev => {
                    if (rev.num === item1.num) {
                      if (rev.rewResult === 1) {
                         tableHtml = tableHtml + '<img src="/assets/svg/right.svg" alt="">';
                      } else if (rev.rewResult === 2) {
                        tableHtml = tableHtml + '<img src="/assets/svg/question.svg" alt="">';
                      } else if (rev.rewResult === 3) {
                        tableHtml = tableHtml + '<img src="/assets/svg/wrong.svg" alt="">';
                      }
                      tableHtml = tableHtml + '<br /><a data-id="' + rev.doi + '" data-state="' + rev.hasReviewHtml + '" onclick="reviewReport.viewPdf(this, 1)">View</a>';
                    }
                  });
                  tableHtml = tableHtml + '</td>';
                });
                tableHtml = tableHtml + '</tr>';
              });
            }
            tableHtml = tableHtml + '</tbody></table>';
            $("#rev_table").html(tableHtml);
            // 评审报告作者信息
            let authorHtml = '';
            this.reviewListInfo.reviewAuthorList.forEach(item => {
              authorHtml = authorHtml +
                '<div class="review-author-item">' +
                '<div class="review-author-item-name">' + 'Reviewer ' +
                item.num + '.&nbsp;' + '<strong>' + item.name + ' ' + item.surname + '</strong>';
              if (item.orcid) {
                authorHtml = authorHtml + '&nbsp;' +
                '<a href="https://orcid.org/' + item.orcid + '" target="_blank">' +
                '<img style="width: 16px; display: inline-block" src="/assets/img/article/orcid.svg"/>' +
                '</a>'
              }
              if (item.contactAddress) {
                authorHtml = authorHtml + ', </div>' + item.contactAddress + '</div>';
              } else {
                authorHtml = authorHtml + '</div></div>'
              }
            });
            $('#rev_author').html(authorHtml);
            // 公众评审信息
            $('#all_com_num').html('All comments(' + this.reviewListInfo.allCommentsList.length + ')');
          }
        },
        (error) => {
        },
      )
    },
    // 获取评审报告详情
    getReviewData() {
      axios.get(`/hyd_article/review_detail?doi=${this.reviewDoi}&preview=${this.ifPreview}`).then(
        (res) => {
          if (res.data.status) {
            this.reviewData = res.data.object;
            this.fullTextInfo.images = this.reviewData.fullText.images;
            // 可以点击看大图的图片(排除行内图片)
            if (this.fullTextInfo.images.length > 0) {
              this.fullTextInfo.images.forEach(item => {
                if (item['html'].indexOf('class="inline-graphic"') < 0) {
                  this.imgShowListInfo.push(item);
                }
              });
            }
            let html5 = '';
            this.imgShowListInfo.forEach(item => {
              html5 = html5 + '<li><div>' + item['parentHtml'] + '</div></li>';
            });
            $("#review_img").html(html5);
            // 显示状态
            let html1 = 'Review Status: ';
            if (this.reviewListInfo.commendedNum > 0) {
              html1 = html1 + '<span>' + this.reviewListInfo.commendedNum + ' Commended</span>';
            }
            if (this.reviewListInfo.revisionRequiredNum > 0) {
              if (this.reviewListInfo.commendedNum > 0) {
                html1 = html1 + ', ';
              }
              html1 = html1 + '<span>' + this.reviewListInfo.revisionRequiredNum + ' Revision Required</span>';
            }
            if (this.reviewListInfo.notCommendedNum > 0) {
              if (this.reviewListInfo.commendedNum > 0 || this.reviewListInfo.revisionRequiredNum > 0) {
                html1 = html1 + ', ';
              }
              html1 = html1 + '<span>' + this.reviewListInfo.notCommendedNum + ' Not Commended</span>';
            }
            if (this.reviewListInfo.commendedNum === 0 && this.reviewListInfo.revisionRequiredNum === 0 && this.reviewListInfo.notCommendedNum === 0) {
              html1 = html1 + '<span>Under Peer Review</span>';
            }
            $("#review_status").html(html1);
            // 显示结论
            let html2 = '';
            if (this.reviewData.rewResult === 1) {
              html2 = '<img src="/assets/svg/right.svg" alt=""/> Commended';
            } else if (this.reviewData.rewResult === 2) {
              html2 = '<img src="/assets/svg/question.svg" alt=""/> Revision Required';
            } else {
              html2 = '<img src="/assets/svg/wrong.svg" alt=""/> Not Commended';
            }
            $('#review_result').html(html2);
            // 显示日期
            $('#review_date').html('<img src="/assets/svg/date.svg" alt=""/>' + this.reviewData.epubDate);
            let toVersionHtml = '';
            if (this.doi === this.reviewData.doi) {
              toVersionHtml = 'Version '+ this.reviewData.articleVersion;
            } else {
              toVersionHtml = '<a onclick="toVersion()">To Version '+ this.reviewData.articleVersion + '</a>';
            }
            $('#review_to_version').html(toVersionHtml);
            // 显示作者
            let html3 = '<div class="review-author-item-name">'
              + this.reviewData.num
              + '. <strong>' + this.reviewData.name + ' ' + this.reviewData.surname + '</strong>';
            if (this.reviewData.orcid) {
              html3 = html3 + '&nbsp;<a href="https://orcid.org/' + this.reviewData.orcid
                + '" target="_blank"><img style="width: 16px; display: inline-block" src="/assets/img/article/orcid.svg" /></a>'
            }
            if (this.reviewData.contactAddress) {
              html3 = html3 + ',</div>' + this.reviewData.contactAddress;
            } else {
              html3 = html3 + '</div>';
            }
            $('#review_author').html(html3);
            // 显示pdf
            let html4 = '<a data-id="' + this.reviewDoi + '" data-state="2" onclick="reviewReport.viewPdf(this, 1)"><strong>'
              + this.reviewData.reviewPdfName + '</strong></a>';
            $("#review_pdf").html(html4);
            // 正文信息 http://localhost:8733/assets/test.gif
            if (!this.reviewData.fullText.url){
              return;
            }
            axios.get(this.reviewData.fullText.url).then( res => {
              if (res.status === 200) {
                this.fullTextInfo.content = res.data;
                // 替换图片(图片有时效性)
                if (this.fullTextInfo.content['length'] > 0) {
                  for (let s = 0; s < this.fullTextInfo.content.length; s++) {
                    for (let i = 0; i < this.fullTextInfo.images['length']; i++) {
                      const regImg = new RegExp(`<img[^>]*id="${this.fullTextInfo.images[i]['key']}"[^>]*>`, 'g');
                      this.fullTextInfo.content[s]['content'] = this.fullTextInfo.content[s]['content'].replace(regImg, this.fullTextInfo.images[i]['contentHtml']);
                    }
                  }
                  // 替换点击图片的方法（跟左侧正文区分）
                  for (let i = 0; i < this.fullTextInfo.content.length; i++) {
                    const regImg1 = new RegExp(`showImage`, 'g');
                    this.fullTextInfo.content[i]['content'] = this.fullTextInfo.content[i]['content'].replace(regImg1, 'showReviewImage');
                  }
                  // 替换参考文献的点击的方法
                  for (let i = 0; i < this.fullTextInfo.content.length; i++) {
                    const regImg2 = new RegExp(`findReferencesById`, 'g');
                    this.fullTextInfo.content[i]['content'] = this.fullTextInfo.content[i]['content'].replace(regImg2,'findReviewReferencesById');
                  }
                }
                let html8 = '';
                this.fullTextInfo.content.forEach(item => {
                  html8 = html8 + '<h4>' + item['title'] + '</h4><p>' + item['content'] + '</p>';
                });
                $('#review_content_list').html(html8);
                let html9 = '';
                this.reviewData.fullText.notes.forEach(item => {
                  html9 = html9 + '<h4>' + item.title + '</h4><p>' + item.content + '</p>';
                });
                if (this.reviewData.fullText.referenceList.length > 0) {
                  html9 = html9 + '<h4>Reference List</h4><div>';
                  this.reviewData.fullText.referenceList.forEach(item => {
                    html9 = html9 + '<div style="margin-bottom: 20px;"><div class="v4-art-reference-item">';
                    if (!item.label) {
                      html9 = html9 + '<div id="rev_' + item['keyStr'] + '" class="v4-art-reference-item-index" ' +
                        'onClick="findReferencesInContentById(this)">' +
                        '<div style="height: 2px">&nbsp;</div>' +
                        '<img src="/assets/img/article/reference-link.png" style="width: 26px; margin: 0"/></div>'
                    } else {
                      html9 = html9 + '<div id="rev_' + item['keyStr'] + '" class="v4-art-reference-item-index" ' +
                        'onClick="findReferencesInReviewById(this)">' + item['label'] + '</div>'
                    }
                    html9 = html9 + '<div class="v4-art-reference-item-title">' + item['reference'] + '</div></div>';
                    if (item.doi || item.link) {
                      html9 = html9 + '<div class="v4-art-reference-item-pos">';
                      if (item.doi) {
                        html9 = html9 + '<a target="_blank" href="https://doi.org/' + item.doi + '">Crossref</a>';
                      }
                      if (item.link) {
                        html9 = html9 + '<a target="_blank" style="margin-left: 10px" href="' + item.link +'">Google Scholar</a>';
                      }
                      html9 = html9 + '</div>';
                    }
                    html9 = html9 + '</div>'
                  });
                  html9 = html9 + '</div>';
                }
                if (this.reviewData.fullText.copyright) {
                  html9 = html9 + '<h4>Copyright</h4><p>' + this.reviewData.fullText.copyright + '</p>';
                }
                if (this.reviewData.fullText.license) {
                  html9 = html9 + '<h4>Rights and Permissions</h4><p>' + this.reviewData.fullText.license + '</p>';
                }
                $("#review_content_other").html(html9)
                // 渲染好数据之后，；
                setTimeout(() => {
                  // 图片大图模态初始化
                  this.initImageShow();
                  // 处理正文内的点击定位
                  initReviewTagClickHandler();
                }, 10);
              }
            })
          }
        },
        (error) => {}
      )
    },
    //初始化图片大图查看
    initImageShow() {
      if (document.getElementById('review_img')) {
        preViewImage = new Viewer(document.getElementById('review_img'), {
          url: 'original-src',
        });
      }
    },
    // pdf 预览 flag 1: 评审报告； 2： 审稿人回复； 3： 公众评议
    viewPdf(e, flag) {
      if (flag === 1 && +$(e).attr('data-state') === 1) {
        // 显示评审报告详情
        this.reviewDoi = $(e).attr('data-id');
        $("#review-gs").css('display', 'none');
        $("#review-xq").css('display', 'block');
        this.getReviewData();
      } else {
        if (isNotMobile()) {
          if (this.ifPreview === 2) {
            window.open(`/hyd_article/review/pdf/${flag}/${$(e).attr('data-id')}`);
            return;
          }
          window.open(`/hyd_article/review/pdf/${flag}/${$(e).attr('data-id')}?ifPreview=${this.ifPreview}`);
        } else {
          reviewReportPdfDownload(flag, $(e).attr('data-id'), this.ifPreview )
        }
      }
    },
    // 查看大众评审列表
    showAllComment() {
      if (this.reviewListInfo.allCommentsList.length === 0) {
        return;
      }
      this.commentVisible = true;
    },
    // 提交大众评审
    goToComment() {
      if (this.ifPreview === 1) {
        this.$message.warning('Preview mode, cannot submit');
        return;
      }
      // 关闭大众评审
      if (this.reviewListInfo.allCommentsStatus === 0) {
        this.$confirm('The article is being revised. Please wait for the newer version.', {
          showConfirmButton: false,
          cancelButtonText: 'Stay in the old Version',
          type: '',
          center: true,
          showClose: true,
          closeOnClickModal: false,
          customClass: 'review-confirm'
        });
      } else {
        // 当前不是最新版本
        if (this.doi !== this.versionList[0].doi) {
          this.$confirm('The review of this version has ended. Please redirect to the latest version for review.', {
            confirmButtonText: 'Jump to the Latest Version',
            cancelButtonText: 'Stay in the Old Version',
            type: '',
            center: true,
            showClose: true,
            closeOnClickModal: false,
            customClass: 'review-confirm'
          }).then(() => {
            // 跳转最新版本
            window.location.href = '/article/' + this.versionList[0].doi;
          }).catch(() => {
            // 留在当前版本
          });
        } else {
          window.open('https://mc03.manuscriptcentral.com/hydrosphere');
        }
      }
    },
    // 评审详情返回评审概述
    back() {
      $("#review-gs").css('display', 'block');
      $("#review-xq").css('display', 'none');
      this.reviewData = {};
    },
    // show cite
    showCite() {
      this.citeVisible = true;
    },
  },
});
// 切换版本
function changeVersion(event) {
  if ($(event).val() !== this.doi) {
    window.localStorage.setItem('article-from', '2');
    window.location.href = '/article/' + $(event).val();
  }
}
// to version 跳转
function toVersion() {
  window.localStorage.setItem('article-from', '2');
  window.location.href = '/article/' + reviewReport.reviewData.doi;
}
// 点击图片显示大图
function showReviewImage(event, dom) {
  if ($(dom).attr('class') !== 'inline-graphic') {
    event.stopPropagation();
    const id = $(dom).attr('id');
    let index = 0;
    for (let i = 0; i < reviewReport.imgShowListInfo.length; i++) {
      if (reviewReport.imgShowListInfo[i]['key'] === id) {
        index = i;
        $($('#review_img').children()[index]).find('img').click();
      }
    }
  }
}
// 下面references点击定位正文references
function findReferencesInReviewById(event) {
  const id = $(event).attr('id').replace('rev_', '');
  const dom = $('.' + id);
  $('#review_content').scrollTop($(dom[0]).offset().top - $("#review_content").offset().top + $("#review_content").scrollTop() - 50);
  for (let i = 0; i < dom.length; i++) {
    $(dom[i]).css('color', 'orange');
  }
  setTimeout(function () {
    for (let i = 0; i < dom.length; i++) {
      $(dom[i]).css('color', '#337ab7');
    }
  }, 1000);
}
// 正文references点击定位下面references
function findReviewReferencesById(event) {
  $('.article-html-table-modal-review').css('margin-left', '-100%');
  event = event || window.event;
  event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
  const id = 'rev_' + $(event.target).attr('rid');
  const dom = $('#' + id);
  $('#review_content').scrollTop(dom.offset().top - $("#review_content").offset().top + $("#review_content").scrollTop() - 50);
  dom.parent().css('backgroundColor', '#eee');
  setTimeout(function () {
    dom.parent().css('backgroundColor', 'initial');
  }, 1000);
}
// 点击xref标签跳转
function initReviewTagClickHandler() {
  $('#review_content xref').click(function(event) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    var refType = $(this).attr('ref-type');
    var id = $(this).attr('rid');
    switch (refType) {
      // 表格
      case 'table': {
        var dom = $('#' + id).parent();
        break;
      }
      // 图片
      case 'fig':
      // 章节
      case 'sec':
      // 公式
      case 'disp-formula': {
        var dom = $('#' + id);
        break;
      }
      default: {
      }
    }
    jumpToId(dom);
  });

  $('.html-table-content label').click(function() {
    var tableDom = $(this).closest('.html-table-content');
    jumpToId(tableDom);
  });

  $('fig label').click(function() {
    var figDom = $(this).closest('fig');
    jumpToId(figDom);
  });
}
function jumpToId(dom) {
  if (!dom) {
    return;
  }
  $('#review_content').scrollTop(dom.offset().top - - $("#review_content").offset().top + $("#review_content").scrollTop() - 50);
  dom.css('backgroundColor', '#eee');
  setTimeout(function() {
    dom.css('backgroundColor', 'initial');
  }, 1000);
}
