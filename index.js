'use strict';
var cheerio = require('cheerio');

// http://stackoverflow.com/questions/14480345/how-to-get-the-nth-occurrence-in-a-string
function getPosition(str, m, i) {
  return str.split(m, i).join(m).length;
}

var version = String(hexo.version).split('.');
hexo.extend.filter.register('after_post_render', function(data){
	var config = hexo.config;
	if(config.post_asset_folder){
		var link = data.permalink;
		// for github
		var beginPos = getPosition(link, '/', 3) + 1;
		var endPos = link.lastIndexOf('/') + 1;
		link = link.substring(beginPos, endPos);

    	var toprocess = ['excerpt', 'more', 'content'];
		for(var i = 0; i < toprocess.length; i++){
		  var key = toprocess[i];

		  var $ = cheerio.load(data[key], {
			ignoreWhitespace: false,
			xmlMode: false,
			lowerCaseTags: false,
			decodeEntities: false
		  });

		  $('img').each(function(){
			if ($(this).attr('src')){
				// For windows style path, we replace '\' to '/'.
				var src = $(this).attr('src').replace('\\', '/');
				if(!/http[s]*.*|\/\/.*/.test(src) &&
					!/\/\d{4}\/\d{2}\/\d{2}.*/.test(src)) {
					// when meet src like {% asset_img *.png %} do nothing
					// For "about" page, the first part of "src" can't be removed.
				    // In addition, to support multi-level local directory.
				    var linkArray = link.split('/').filter(function(elem){
						return elem != '';
				    });
				    var srcArray = src.split('/').filter(function(elem){
						return elem != '' && elem != '.';
				    });
				    if(srcArray.length > 1) 
						srcArray.shift();
				    src = srcArray.join('/');
				    $(this).attr('src', '/' + link + src);
				    console.info&&console.info("update link as:-->"+ '/' + link + src);
				}
			}else{
				console.info&&console.info("no src attr, skipped...");
				console.info&&console.info($(this));
			}
		  });
		  data[key] = $.html();
		}
  	}
});
