$rset("rhtml", "taglibs/test/Tabs", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      forEach = helpers.f,
      escapeXmlAttr = helpers.xa,
      escapeXml = helpers.x;

  return function(data, context) {
    var tabs = data.tabs;

    context.w('<div class="tabs"><ul class="nav nav-tabs">');

    forEach(tabs, function(tab) {
      context.w('<li')
        .a("class", tab.liClass)
        .w('><a href="#')
        .w(escapeXmlAttr(tab.id))
        .w('" data-toggle="tab">')
        .w(escapeXml(tab.title))
        .w('</a></li>');
    });

    context.w('</ul><div class="tab-content">');

    forEach(tabs, function(tab) {
      context.w('<div')
        .a("id", tab.id)
        .a("class", tab.divClass)
        .w('>');

      tab.invokeBody();


      context.w('</div>');
    });

    context.w('</div></div>');
  }
});