/**
 * 全局提示信息显示
 * @param type 提示类型success，info，warning，danger
 * @param message 提示信息
 * @param time 多长时间关闭提示
 */
function showYxAlert(type, message, time) {
    message = message ? message : 'Network exception, please try again later！';
    time = time ? time : 2000;
    var alertDom = '';
    switch(type) {
        case 'success':
            alertDom = $('<div class="alert alert-success alert-dismissible fade in yx-alert" role="alert">\n' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '  <strong>Success!</strong> ' + message +
                '</div>');
            break;
        case 'info':
            alertDom = $('<div class="alert alert-info alert-dismissible yx-alert" role="alert">\n' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '  <strong>Info:</strong> ' + message +
                '</div>');
            break;
        case 'warning':
            alertDom = $('<div class="alert alert-warning alert-dismissible yx-alert" role="alert">\n' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '  <strong>Warning:</strong> ' + message +
                '</div>');
            break;
        case 'danger':
            alertDom = $('<div class="alert alert-danger alert-dismissible yx-alert" role="alert">\n' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '  <strong>Error:</strong> ' + message +
                '</div>');
            break;
        default:
            alertDom = $('<div class="alert alert-success alert-dismissible yx-alert" role="alert">\n' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '  <strong>Info:</strong> ' + message +
                '</div>');
            break;
    }

    $('body').append(alertDom);

    setTimeout(function() {
        $('.alert').alert('close');
    }, time)
}