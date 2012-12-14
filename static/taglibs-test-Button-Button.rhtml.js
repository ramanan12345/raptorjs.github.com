$rset("rhtml", "taglibs/test/Button", function(helpers) {
  var empty=helpers.e,
      notEmpty=helpers.ne,
      getTagHandler=helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag=getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      escapeXml=helpers.x;

  return function(data, context) {
    var widget=data.widget,
        buttonAttrs=data.buttonAttrs,
        label=data.label;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "taglibs.test.ButtonWidget",
        "config": data.widgetConfig,
        "widgetArgs": data.widgetArgs
      },
      function(widget) {
        context.w('<button')
          .a("id", widget.elId())
          .a(buttonAttrs)
          .w('>')
          .w(escapeXml(label))
          .w('</button>');
      });
  }
});