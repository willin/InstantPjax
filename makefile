all:
	@head -1 instantpjax.js > min.head.js
	@curl --silent --data "output_info=compiled_code" --data-urlencode "js_code@instantpjax.js" "http://closure-compiler.appspot.com/compile" -o min.code.js
	@cat min.head.js min.code.js > instantpjax.min.js
	@rm min.head.js min.code.js
	@gzip instantpjax.min.js
	@du -k instantpjax.js instantpjax.min.js.gz
	@gunzip instantpjax.min.js.gz
	@rm -rf dist
	@mkdir dist
	@mv instantpjax.min.js dist/instantpjax.min.js
	@cp instantpjax.js dist/instantpjax.js
	@cd dist && git init && git add . && git commit -m 'Willin Auto publisher' && git push --force --quiet "git@github.com:willin/InstantPjax.git" master:dist
clean:
	@rm -rf dist