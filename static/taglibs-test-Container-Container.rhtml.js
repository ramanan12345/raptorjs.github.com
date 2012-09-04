$rset("rhtml", "taglibs/test/Container", function(helpers) {
  var empty=helpers.e,
      notEmpty=helpers.ne,
      escapeXml=helpers.x;

  return function(data, context) {
    var widget=data.widget,
        title=data.title;

    context.w('<div><h1>')
      .w(escapeXml(title))
      .w('</h1><div class="bd">');

    data.invokeBody();


    context.w('</div></div>');
  }
});