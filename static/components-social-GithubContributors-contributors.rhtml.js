$rset("rhtml", "components/social/GithubContributors/contributors", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      forEach = helpers.f,
      escapeXml = helpers.x;

  return function(data, context) {
    var contributors = data.contributors;

    forEach(contributors, function(contributor) {
      context.w('<div class="contributor">');

      if (contributor.avatar_url) {
        context.w('<img')
          .a("src", contributor.avatar_url)
          .w(' class="avatar">');
      }

      context.w('<span class="login">');

      if (contributor.type === 'User') {
        context.w('<a')
          .a("href", contributor.html_url)
          .w(' target="_blank">')
          .w(escapeXml(contributor.login))
          .w('</a>');
      }
      else if (contributor.type === 'Anonymous') {
        context.w(escapeXml(contributor.name))
          .w(' (Anonymous)');
      }

      context.w('</span></div>');
    });
  }
});