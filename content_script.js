	var ohead = document.getElementsByTagName('HEAD').item(0);
	var jq= document.createElement("script");
	jq.type = "text/javascript";
	jq.src=chrome.runtime.getURL("sprint.min.js");
	ohead.appendChild(jq);
