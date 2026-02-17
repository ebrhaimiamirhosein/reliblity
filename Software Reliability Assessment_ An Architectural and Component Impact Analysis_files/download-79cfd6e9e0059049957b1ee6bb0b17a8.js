// pdf在线查看内容
function previewActivityPdf(id, doi, activityId, type, ifPreview) {
    if (type === 1) {
        // if (isNotMobile()) {
            if (activityId!=null&&activityId.length>0) {
                window.open(contextPath + '/article/pdf/' + doi +".pdf?activityId=" +activityId + '&ifPreview=' + ifPreview);
            }else {
                window.open(contextPath + '/article/pdf/' + doi +'.pdf');
            }
        // } else {
        //     downloadPDF(id, activityId,ifPreview);
        // }
    } else if (type === 2) {
        // toBuy(id);
        $.ajax({
            url: contextPath + '/article/third_party_stat?id=' + id,
            type: 'get',
            dataType: 'json',
            contentType: 'application/json',
            success: function(result) {
            },
            error: function(err) {
                console.log(err.statusText);
            }
        });
        window.open('https://doi.org/' + doi)
    }


}
// pdf在线查看内容
function previewPdf(id,doi) {
    $.ajax({
        url: contextPath + '/article/get_if_oa?id=' + id,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            if (result.errCode === 0) {
                if (isNotMobile()) {
                    window.open(contextPath + '/article/pdf/'+ doi+'.pdf');
                } else {
                    downloadPDF(id, "",0);
                }
            } else if (result.errCode === 3) {
                // toBuy(id);
                window.open('https://doi.org/' + doi)
            } else {
                showYxAlert('warning', result.message);
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

function toBuy(id) {
    if (user != null) {
        location.href = contextPath + '/order/to_article_info?id=' + id;
    } else {
        showYxAlert('warning', 'You are not currently logged in, please log in and operate!');
        var code = window.location.pathname;
        var param = window.location.search;
        location.href = '/user/user/login_forward?tag=5&code=' + encodeURIComponent(code + param);
    }
}


/**
 *  pdf下载
 * @param id 文章的id
 */
function downloadPDF(id, activityId,ifPreview) {
    $.ajax({
        url: contextPath + '/article/download_pdf?id=' + id+"&activityId="+activityId+"&ifPreview="+ifPreview,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            if (result.errCode === 0) {
                if (isNotMobile()) {
                    location.href = result.object;
                } else {
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', result.object);
                    a.setAttribute('download', name);
                    a.click();
                    document.body.removeChild(a);
                }
            } else if (result.errCode === 3) {
                window.open('https://doi.org/' + result.object);
            } else {
                showYxAlert('warning', result.message);
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

// 后台预览前台页面的时候pdf在线预览
function previewStagePdf(doi, stage,status) {
    $.ajax({
        url: contextPath + '/article/get_if_oa?doi=' + doi + '&stage=' + stage+'&status='+status,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            if (result.errCode === 0) {
                if (isNotMobile()) {
                    window.open(contextPath + '/article/pdf/' + doi + '.pdf?stage=' + stage);
                } else {
                    downloadPreviewPDF(doi, stage)
                }
            }
            else if (result.errCode === 3) {
                window.open('https://doi.org/' + result.object)
                // location.href = '/order/to_preview_article_info?doi=' + doi + '&stage=' + stage;
            } else {
                showYxAlert('warning', result.message);
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

// 后台预览前台页面的时候pdf下载
function downloadPreviewPDF(doi, stage) {
    $.ajax({
        url: contextPath + '/article/download_preview_pdf?doi=' + doi + "&stage=" + stage,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            if (result.errCode === 0) {
                location.href = result.object
            } else if (result.errCode === 3) {
                window.open('https://doi.org/' + result.object);
            } else {
                showYxAlert('warning', result.message);
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

/**
 * 增强资源下载
 * @param id 资源id
 */
function enhanceDownload(id) {
    $.ajax({
        url: contextPath + '/journal/join_journal/enhance_download?id=' + id,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (data.errCode === 0) {
                if (isNotMobile()) {
                    if (data.object.type == 'pdf') {
                        window.open('/article/enhance_pdf_preview?id=' + data.object.id);
                    } else {
                        location.href = data.object.url;
                    }
                } else {
                    $.ajax({
                        type: "get",
                        contentType: "application/json",
                        url: "/article/get_enhance_download_url?id=" + id,
                        success: function (result) {
                            var a = document.createElement('a');
                            document.body.appendChild(a);
                            a.setAttribute('style', 'display:none');
                            a.setAttribute('href', result.object);
                            a.setAttribute('download', name);
                            a.click();
                            document.body.removeChild(a);
                        },
                        error: function () {
                            console.log("An error occurred, please try again!")
                        }
                    })
                }
            } else {
                showYxAlert('warning', data.message);
                console.log("下载资源发生错误！")
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

/**
 * 整期下载目录 预览
 * @param path
 */
function downloadCatalogPreview(path) {
    if (path != null && path != '') {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', path);
        a.setAttribute('download', name);
        a.click();
        document.body.removeChild(a);
    }
}

/**
 * 整期展示 下载目录
 * @param id
 */
function downloadCatalog(id, catalogId, type) {
    if (isNotMobile()) {
        window.open(contextPath + '/journal/join_journal/download_catalog?id=' + id + '&type=' + type)
    } else {
        $.ajax({
            type: "get",
            contentType: "application/json",
            url: "/journal/download_pdf_catalog?id=" + catalogId,
            success: function (result) {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display:none');
                a.setAttribute('href', result.object);
                a.setAttribute('download', name);
                a.click();
                document.body.removeChild(a);
            },
            error: function () {
                console.log("An error occurred, please try again!")
            }
        })
    }
}


/**
 * 整期下载封面
 * @param id 期号id
 */
function downloadCover(event) {
    window.location.href = contextPath + '/journal/join_journal/download_cover?id=' + encodeURIComponent($(event).attr('data-issue-id') )+ '&coverId=' + $(event).attr('data-id') + '&type=' + $(event).attr('data-type');
}


function downloadRis(id) {
    $.ajax({
        url: contextPath + '/article/download_ris?id=' + id,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

/**
 * 期刊栏目附件资源下载
 * @param obj
 */
function downloadResourcePdf(obj) {
    if (isNotMobile()) {
        if (obj.format != 'pdf') {
            location.href = obj.resourceId;
        } else {
            window.open("/home/get_resource_pdf_url?id=" + obj.id);
        }
    } else {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', obj.resourceId);
        a.setAttribute('download', name);
        a.click();
        document.body.removeChild(a);
    }
}

/**
 * 期刊栏目附件资源下载
 * @param obj
 */
function baseResourcePdf(obj) {
    if (isNotMobile()) {
        if (obj.format != 'pdf') {
            location.href = obj.resourceId;
        } else {
            window.open("/home/get_resource_pdf_url?isHome=1&id=" + obj.id);
        }
    } else {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', obj.resourceId);
        a.setAttribute('download', name);
        a.click();
        document.body.removeChild(a);
    }
}
/**
 * 期刊栏目预览附件资源下载
 * @param obj
 */
function basePreviewResourcePdf(obj){
    if (isNotMobile()) {
        if (obj.format != 'pdf') {
            location.href = obj.resourceId;
        } else {
            window.open("/home/get_resource_pdf_url?isHome=2&id=" + obj.id);
        }
    } else {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', obj.resourceId);
        a.setAttribute('download', name);
        a.click();
        document.body.removeChild(a);
    }
}

// 是否是移动端
function isNotMobile() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/android/i) == "android") {
        return false;
    }
    if (ua.match(/iphone/i) == "iphone") {
        return false;
    }
    if (ua.match(/ipad/i) == "ipad") {
        return false;
    }
    return true;
}


/**
 * 评审报告相关pdf下载
 * pdfType： 1、审稿评议pdf  2、审稿回复pdf  3、公众评议pdf
 * doi：当type值1或2，传审稿评议doi ；  当type值为3时，传文章doi ；
 * ifPreview：1、未发布-预览页面2、发布-前台访问 3、发布-后台访问
 */

function reviewReportPdfDownload(type, doi, ifPreview) {
    $.ajax({
        url: contextPath + '/hyd_article/review/pdf_download?pdfType=' + type +"&param=" + doi + "&ifPreview=" + ifPreview,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            if (result.status) {
                if (isNotMobile()) {
                    location.href = result.object;
                } else {
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', result.object);
                    a.setAttribute('download', name);
                    a.click();
                    document.body.removeChild(a);
                }
            } else {
                showYxAlert('warning', result.message);
            }
        },
        error: function (err) {
            showYxAlert('danger', err.statusText);
            console.log(err.statusText);
        }
    });
}

