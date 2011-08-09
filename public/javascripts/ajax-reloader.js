function get_head_items(){
	var links = []
	Ext.select('script').each(function(item,all,index){
		var origin_link = item.dom.src;
			links.push({html : {
							tag  : 'a',
							id   : origin_link,
							cls  : 'ajax_reload',
							html : origin_link
			}});
	},this);
	
	return links;
}
function reload_items(link){
	Ext.select('script').each(function(item,all,index){
		var origin_link = item.dom.src;
		
		if((origin_link == link) || (/application.js/.test(origin_link))){
			item.remove();
			delete item;
			var el = document.createElement('script');
				el.type = 'text/javascript';
				el.src  = origin_link.substring(0,origin_link.indexOf('.js'))+'.js?'+Math.random();
			Ext.select('head').appendChild(el);
		}
	},this);
}
Ext.onReady(function(){
	
});