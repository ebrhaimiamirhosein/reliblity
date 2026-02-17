/**
 * 渲染分享插件
 */
$(document).ready(function () {
    // 将分享按钮渲染到页面；
    var shareHtml = '<div class="yuxiang-share">\n' +
        '              <div class="yx-share wechat" onclick="yxShare(\'wechat\')"></div>\n' +
        '              <div class="yx-share qq" onclick="yxShare(\'qq\')"></div>\n' +
        '              <div class="yx-share twitter" onclick="yxShare(\'twitter\')"></div>\n' +
        '              <div class="yx-share facebook" onclick="yxShare(\'facebook\')"></div>\n' +
        '              <div class="yx-share linkedin" onclick="yxShare(\'linkedin\')"></div>\n' +
        '              <div class="yx-share microblog" onclick="yxShare(\'microblog\')"></div>\n' +
        '            </div>';
    $("#yx_share").empty().html(shareHtml);
    $("#third-share").empty().html(shareHtml);
    // 将微信分享的模态渲染进页面；
    var shareModal = '<div class="modal fade cite-modal" id="shareModal" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="exampleModalLabel">\n' +
        '      <div class="modal-dialog" role="document">\n' +
        '        <div class="modal-content" style="padding: 35px;">\n' +
        '          <div class="modal-header" style="margin-right: 0;">\n' +
        '            <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '              <img aria-hidden="true" src="/assets/img/article/article-close.png"/>\n' +
        '            </button>\n' +
        '            <h4 class="modal-title">微信分享</h4>\n' +
        '          </div>\n' +
        '          <div class="modal-body">\n' +
        '              <div id="qrcode" style="margin: 30px auto;"></div>\n' +
        '              <div style="margin: 20px auto 50px;text-align: center;">手机微信扫描二维码，点击右上角···按钮<br />分享到微信朋友圈</div>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </div>\n' +
        '    </div>';
    $('body').append(shareModal);
});

/**
 * 分享
 * @param channel 渠道
 */
function yxShare(type){
    // 获得分享地址
    var url = window.location.href;
    if (type !== 'wechat') {
        if (url.indexOf("?") > -1) {
            url = encodeURIComponent(url + "&channel=" + type);
        } else {
            url = encodeURIComponent(url + "?channel=" + type);
        }
    } else {
        if (url.indexOf("?") > -1) {
            url = url + "&channel=" + type;
        } else {
            url = url + "?channel=" + type;
        }
    }
    console.log(url);
    // 跳转分享地址
    switch (type) {
        case 'wechat':
            shareWithWechat(url);
            break;
        case 'qq':
            window.open('http://connect.qq.com/widget/shareqq/index.html?title=&source=&desc=&pics=&summary=&url=' + url);
            break;
        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=&via=&url=' + url);
            break;
        case 'facebook':
            window.open('https://www.facebook.com/sharer.php?u=' + url);
            break;
        case 'linkedin':
            window.open('https://www.linkedin.com/sharing/share-offsite/?title=&url=' + url);
            break;
        case 'microblog':
            window.open('https://service.weibo.com/share/share.php?title=&pic=&appkey=&url=' + url);
            break;
        default:
            break;
    }
}

/**
 * 分享到微信
 */
function shareWithWechat(url){
    $("#shareModal").modal();
    $("#qrcode").empty();
    var qrcode = new QRCode(document.getElementById("qrcode"), {width: 240, height: 240});
    qrcode.makeCode(url);

}