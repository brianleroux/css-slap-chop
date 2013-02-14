var should = require('should')
,   panda  = require('./../css-slap-chop')
,   path   = require('path')
,   css    = path.join(__dirname, 'test.css')
,   html   = path.join(__dirname, 'test.html')
,   ignore = path.join(__dirname, 'ignore.json')
,   ref    = path.join(__dirname, 'used.css')
,   fs     = require('fs')

describe('panda', function(){
    
    describe('used()', function() {
        it('should return all used rules', function(done){
            panda.used({css:css, html:html}, function(err, used) {
                used.length.should.eql(6)
                done()
            })
        })
        it('should return all used rules with ignore rules', function(done){
            panda.used({css:css, html:html, ignore:ignore}, function(err, used) {
                used.length.should.eql(8)
                done()
            })
        })
    })
    
    describe('unused()', function() {
        it('should return all used rules', function(done){
            panda.unused({css:css, html:html}, function(err, unused) {
                unused.length.should.eql(3)
                done()
            })
        })
    })
    
    describe('tidy()', function() {
        it('should return a document with only used css rules', function(done){
            panda.tidy({css:css, html:html}, function(err, tidy) {
                var reference = fs.readFileSync(ref).toString('utf-8')
                tidy.should.eql(reference)
                done()
            })
        })
    }) 
})

