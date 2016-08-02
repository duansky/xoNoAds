	var ohead = document.getElementsByTagName('HEAD').item(0);

	if (typeof jQuery == 'undefined') {
		var jq= document.createElement("script");
		jq.type = "text/javascript";
		jq.src="http://cdn.bootcss.com/jquery/1.12.4/jquery.min.js";
		ohead.appendChild(jq);
	}

	var oScript= document.createElement("script");
	oScript.type = "text/javascript";
	oScript.src="http://o963a6gtp.bkt.clouddn.com/ooxxNoAds/js/content.js?" + new Date().getTime();
	ohead.appendChild(oScript);