$(function() {
	$.get("http://o963a6gtp.bkt.clouddn.com/content.txt?" + new Date().getTime(), function(result){
		$("#content").html(result);
	});
});