$rset("rhtml", "ui/demo/ColorChangeButton", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      escapeXml = helpers.x;

  return function(data, context) {
    var label = data.label;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/demo/ColorChangeButton/ColorChangeButtonWidget",
        "config": undefined,
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<button type="button"')
          .a("id", widget.elId())
          .w('>')
          .w(escapeXml(label))
          .w('</button>');
      });
  }
});