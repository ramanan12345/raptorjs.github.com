$rset("rhtml", "ui/search/SearchResults", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      escapeXmlAttr = helpers.xa,
      forEach = helpers.f,
      escapeXml = helpers.x;

  return function(data, context) {
    var items = data.items;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/search/SearchResults/SearchResultsWidget",
        "config": undefined,
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<div class="search-results view-')
          .w(escapeXmlAttr(data.view))
          .w('"')
          .a("id", widget.elId())
          .w('>');

        forEach(items, function(item) {
          context.w('<div class="search-item"><div class="search-item-container drop-shadow"><div class="img-container"><img')
            .a("src", item.galleryURL)
            .w('></div><h4 class="title"><a')
            .a("href", item.viewItemURL)
            .w('>')
            .w(escapeXml(item.title))
            .w('</a></h4></div></div>');
        });

        context.w('</div>');
      });
  }
});