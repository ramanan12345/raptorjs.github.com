rm -rf static
raptor-optimizer \
    /css/global.css \
    ./pages/test-page/package.json \
    module-c \
    --name test-page \
    --source modules \
    --out static \
    --minify
node update-html.js