//. app.js

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    client = require( 'cheerio-httpcli' ),
    fs = require( 'fs' ),
    app = express();

var appEnv = cfenv.getAppEnv();

client.set( 'browser', 'chrome' );
client.set( 'referer', false );


app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.get( '/categories', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var url = 'https://www.irasutoya.com/';
  client.fetch( url, {}, 'UTF-8', function( err, $, res0, body ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( err ) );
      res.end();
    }else{
      var categories = [];
      $('#Label1 .list-label-widget-content ul li a').each( function(){
        var category = { name: $(this).text(), url: $(this).attr( 'href' ) };
        categories.push( category );
      });

      res.write( JSON.stringify( categories ) );
      res.end();
    }
  });
});

app.get( '/category_list', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var url = encodeURI( req.query.url );
  var start = req.query.start;
  if( start ){
    url = url.split( '+' ).join( '%2B' );
    url += '&max-results=20&start=' + start + '&by-date=false';
  }
  //console.log( 'GET /category_list : url = ' + url );

  client.fetch( url, {}, 'UTF-8', function( err, $, res0, body ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( err ) );
      res.end();
    }else{
      //. navi
      var prev_page_url = '';
      var next_page_url = '';


      $('#blog-pager-newer-link a').each( function(){
        prev_page_url = $(this).attr( 'href' );
      });
      $('#blog-pager-older-link a').each( function(){
        next_page_url = $(this).attr( 'href' );
      });

      var list = [];
      $( '#Blog1 .date-outer .box .boxim a script' ).each( function(){
        var script_text = $(this).text();
        var tmp = script_text.split( '"' );
        var img_src = tmp[1];

        img_src = img_src.split( 's72-c' ).join( 's180-c' );

        var name = tmp[3];
        var href = $(this).parent().attr( 'href' );
        
        var item = { img_src: img_src, href: href, name: name };

        list.push( item );
      });

      res.write( JSON.stringify( { list: list, next: next_page_url } ) );
      res.end();
    }
  });
});


app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );
