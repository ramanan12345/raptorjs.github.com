(function() {
    $('body').scrollspy({
        offset: 40
    });

    var $win = $(window);
    
    $(".toc LI > A").click(function() {
        setTimeout(function () {  $win.scrollTop($win.scrollTop() - 39) }, 10)
    });
}())
