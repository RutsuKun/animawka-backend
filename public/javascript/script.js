$(function() {

    $('.button-collapse').sideNav();
    $(".dropdown-button").dropdown();

    $('input[type=text]').parent().addClass('input-field');
    $('input[type=number]').parent().addClass('input-field');
    $('input[type=date]').parent().addClass('input-field');
    $('button').addClass('waves-effect waves-light btn right');
    $('select').material_select();
});
