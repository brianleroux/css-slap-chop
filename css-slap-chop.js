var fs    = require('fs')
,   cssom = require('cssom')
,   jsdom = require('jsdom')
,   async = require('async')
,   _     = require('underscore')

//
// private helpers
//
function readFile(path, cb) {
    fs.readFile(path, function(err, data) {
        if (err) cb(err)
        else cb(null, data.toString('utf8'))
    })
}

//
// the public api
//
module.exports = {
    // USAGE
    //
    // panda.parse({html:path_to_html, css:path_to_css}, function(err, data) {
    //     console.log(data.used)
    //     console.log(data.unused)
    // })
    parse: function(options, cb) {

        var ignore = options.ignore ? require(options.ignore).selectors : []

        function readCSS(cb) {
            readFile(options.css, cb)
        }

        function readHTML(cb) {
            readFile(options.html, cb)
        }

        function css(cb) {
            readCSS(function(err, css){
                if (err) cb(err)
                parseCSS(css, cb)
            })
        }

        function html(cb) {
            readHTML(function(err, html){
                if (err) cb(err)
                parseHTML(html, cb)
            })
        }

        function parseCSS(str, cb) {
            var rules  = cssom.parse(str).cssRules.map(function(r) {
                return r.selectorText
            })
            cb(null, rules)
        }

        function parseHTML(str, cb) {
            var window = jsdom.jsdom(str).createWindow()
            jsdom.jQueryify(window, 'jquery.js', function(window, $) {
                cb(null, $)
            })
        }

        // read in the css rules and html at the same time
        async.parallel([css, html], function(err, results){

            if (err) cb(err)

            var rules = results[0]
            ,   $     = results[1]
            ,   r     = { used:ignore, unused:[] }

            // then loop thru the css selectors using jquery to test for their existance in the html doc
            for (var i = 0, l = rules.length; i < l; i++) {

                var rule = rules[i]
                ,   query = rule.replace(/:[\w]*/g,'')
                ,   found = !!($(query).length >= 1)

                if (found) {
                    r.used.push(rule)
                }
                else {
                    r.unused.push(rule)
                }
            }

            cb(null, r)
        })
    }
    ,
    //
    // returns used selectors as array
    //
    used: function(options, callback) {
        this.parse(options, function(err, result) {
            callback(err, result.used)
        })
    }
    ,
    //
    // returns unused selectors as array
    //
    unused: function(options, callback) {
        this.parse(options, function(err, result) {
            callback(err, result.unused)
        })
    }
    ,
    //
    // returns tidy css with unused selectors removed
    //
    tidy: function(options, callback) {
        this.used(options, function(err, selectors) {
            readFile(options.css, function(err, str) {

                var rules     = cssom.parse(str).cssRules
                ,   usedRules = []
                ,   css       = ''

                rules.forEach(function(rule) {
                    var hasSelector = _.indexOf(selectors, rule.selectorText)
                    if (hasSelector >= 0) usedRules.push(rule)
                })

                usedRules.forEach(function(rule) {
                    css += rule.selectorText + " {\n"

                    var allkeys = _.keys(rule.style)
                    ,   offset  = rule.style.length
                    ,   len     = allkeys.length
                    ,   rest    = len - offset
                    ,   keys    = _.rest(allkeys, rest)

                    _.each(keys, function(k, i) {
                        css += "    " + k + ":" + rule.style[k] + ";\n"
                    })

                    css += "}\n\n"
                })
                callback(null, css)
            })
        })
    }
    ,
    cli: function() {
        var program = require('commander')

        program
          .version('0.1.0')
          .description('Reads a CSS file and an HTML file and returns a CSS file with unused selectors removed.')
          .option('-h, --html <path>', 'REQUIRED! The markup to analyze for selectors.')
          .option('-c, --css <path>', 'REQUIRED! The css file to analyze.')
          .option('-i, --ignore <path>', 'Optional JSON file of selectors to ignore.')
          .parse(process.argv)

        if (process.argv.length === 2) {
            console.log('Try running --help for all the options.')
        }
        else {
            var opts = { html:program.html, css:program.css }

            if (program.ignore) opts.ignore = program.ignore

            this.tidy(opts, function(err, css) {
                if (err) console.error(err)
                console.log(css)
            })
        }
    }
    // end of exports
}
