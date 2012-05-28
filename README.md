# CSS Slap Chop!

Findin' unused css selectors in your HTML, slappin' them around, and choppin' 'em out.

## Prerequisites

1. Love. You must love the pandas.
2. NodeJS. You must install NodeJS.

### Install

    npm install -g css-slap-chop

#### Use it

There is a command-line interface (CLI) tool. Don't be bummed! The CLI is the most powerful interface of all. 

    css-slap-chop

That was fun! No problem. Now we can go and get CSS Slap Chop to show us a more friendly CSS document.

    css-slap-chop --css ./app.css --html ./index.html

Cool! If you want to create a file just use some UNIX IO redirect magic.

    css-slap-chop --css ./app.css --html ./index.html > ./tidy.css

Gnar.

### FAQ

Oh no! It fucking removed the stuff I add dynamically with Captain AJAX! What will I do?

    Chill, bitch! CSS Slap Chop can optionally take a JSON file contiaining selectors you want it to ignore. 

### Hack it

The CSS Slap Chop can be accessed as a lib in NodeJS. 

    var csc = require('css-slap-chop')
    csc.tidy({css:path_to_css, html:path_to_html, ignore:path_to_ignore_json}, function(err, css) {
        if (err) throw err
        console.log(css)        
    })

