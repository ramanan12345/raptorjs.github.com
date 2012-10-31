rm -rf static
raptor-optimizer --name test-page \
    --source modules \
    --dependencies /css/global.css,./pages/test-page/package.json,module-c \
    --out static \
    --minify
node update-html.js