$(document).ready(function () {
    var forms = $('form.ajax-form')

    forms.on('submit', function (event) {
        event.preventDefault()

        var form = $(event.target)

        $.ajax({
            url: form.attr('action'),
            crossDomain: true,
            data: form.serialize(),
            method: form.attr('method'),
            cache: false,
            success: function (response) {
                form[0].reset()
                var alert = $('.tellus-alert.alert-success')
                alert.fadeIn()

                setTimeout(function () { alert.fadeOut() }, 5000)

                $(".modal").removeClass("modal-open");

            },
            error: function (response) {
                var alert = $('.tellus-alert.alert-danger')
                alert.fadeIn()

                setTimeout(function () { alert.fadeOut() }, 5000)
            }
        })
    })

});

function selectedImg(e) {
    this.img = [];
    //获取到图片对象
    const event = e.target.files || e.dataTransfer.files, len = event.length;
    //判断图片格式
    for (let i = 0; i < len; i++) {
        // console.log(event[i].type);
        if (event[i].type != 'image/jpeg' && event[i].type != 'image/png' && event[i].type != 'image/jpg') {
            alert('选择的图片格式不正确，请选择“jpg，png，jpeg”格式');
            return;
        }
    }
    //图片格式转换
    for (let i = 0; i < len; i++) {
        const reader = new FileReader();
        reader.readAsDataURL(event[i]);
        //加载函数时将64位格式的图片输入到img里面
        reader.onload = (evt) => {
            // console.log(evt.target.result)
            this.img.push(evt.target.result);
        }
    }
}