	var ads = $(".a_cb, .a_mu table tr:gt(0)");

	if ( ads.size() > 5 ) {
		ads.remove();
		
		var a = $(".a_mu table td:first a");
		a.attr("href","http://www.hb0198.com");

		var img = $(".a_mu table td:first img");
		img.attr("src","http://o963a6gtp.bkt.clouddn.com/ooxxNoAds/img/ad.gif");
		img.attr("height","95");
	}