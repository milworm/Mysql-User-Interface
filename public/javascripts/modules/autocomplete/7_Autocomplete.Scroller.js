/*
 * @class Dbms.Autocomplete.Scroller
 * perfroms scrolling the textarea, when required,
 * now it is used when you press enter, or keys up, down, left,right
 */
Dbms.Autocomplete.Scroller = Ext.extend(function(){},{
	/*
	 * @param config {Object}
	 */
	constructor : function(config){
		Ext.apply(this, config);
	},
	/*
	 * @returns current content element
	 */
	getContentElement : function() {
		return this.getController().getContentElement();
	},
	/*
	 * @returns the root-dom element
	 * 			means parent of all paragraphs
	 **/
	getRootElement : function(){
		return this.getController().getRootElement();
	},
	/*
	 * simple getter for Autocomplete.Controller
	 * @returns Dbms.Autocomplete.Controller
	 */
	getController : function() {
		return this.controller;
	},
	/*
	 * function performs scrolling the rootElement
	 * to valid height
	 * @returns {void}
	 */
	scroll : function() {
		var contentEl = Ext.get(this.getContentElement());
		
		if(contentEl.getAttribute('class') != 'ppp'){
			var contentEl = contentEl.parent();
		}
		
		var parent = Ext.get(contentEl.parent().parent()); // el width scroll
			parent.scrollChildIntoView(contentEl, false);
			
		return;
	}
});