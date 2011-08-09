Ext.ns('Dbms.Autocplete');


Dbms.Autocomplete.Range = function(){
	this.windowRange = document.createRange();
}

Dbms.Autocomplete.Range.prototype = {
	get : function(){
		return this.windowRange;
	},
	/*
	 *
	 * @param node {DOM-element} The node, whitch you want to select
	 * @param startIdx {Number} set the begining of range-selection 
	 * @param endIdx {Number} set the ending of range-selection 
	 * NOTICE: params startIdx, endIdx can be only 0 or 1
	 * 		  0 - move range-selection to the start of the word
	 *        1 - move range-selection to the end of the word
	 */
	attach : function(node, startIdx, endIdx){
		this.windowRange.selectNode(node);
		this.windowRange.setStart(node, startIdx);
		this.windowRange.setEnd(node, endIdx);
	},
	attachToContents : function(node, startIdx, endIdx){
		this.windowRange.selectNodeContents(node);
		this.windowRange.setStart(node.firstChild, startIdx);
		this.windowRange.setEnd(node.firstChild, endIdx);
	} 
}