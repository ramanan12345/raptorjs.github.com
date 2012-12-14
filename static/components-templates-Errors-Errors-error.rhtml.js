$rset("rhtml", "components/templates/Errors-error", function(helpers) {
  var empty=helpers.e,
      notEmpty=helpers.ne,
      escapeXml=helpers.x;

  return function(data, context) {
    var message=data.message;

    context.w('<span class="x">\u2718</span><pre class="message">')
      .w(escapeXml(message))
      .w('</pre>');
  }
});