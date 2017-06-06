"use strict";

$(document).ready(function () {
    $(".display-message").click(function () { });
    $(".filter").change(function (event) {
        var self = $(this);
        $('.filter option:selected').each(function () {
            $('.testcases div.case-wrap').show();
            if ($(this).val() != 'all') {
                $(".testcases div[class != \"case-wrap " + $(this).val() + "\"][class!=\"error-message\"]").each(function () {
                    $(this).hide();
                    $('.show-link').attr('style', 'display: inline-block;');
                    $('.hide-link').attr('style', 'display: none;');
                });
            }
            if ($(this).val() == 'failed') {
                $('.failed .show-link').click();
            }
        });
    });

    $('.show-link').on('click', function () {
        $(this).hide();
        $(this).closest('.case-wrap').find('.hide-link').show();
        $(this).closest('.case-wrap').find('.info-box').stop().slideDown(200);
    });
    $('.hide-link').on('click', function () {
        $(this).hide();
        $(this).closest('.case-wrap').find('.show-link').show();
        $(this).closest('.case-wrap').find('.info-box').stop().slideUp(200);
    });

    $('.filter').val('failed').change();
    $('.fancybox').fancybox();

    $('.fancybox').each(function () {
        $(this).attr('href', $(this).find('img').attr('src'));
    });
});