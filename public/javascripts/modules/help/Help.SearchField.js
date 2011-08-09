Ext.ns('Dbms.Help');

Dbms.Help.SearchField = Ext.extend(Ext.form.ComboBox, {
	constructor : function(){
		Dbms.Help.SearchField.superclass.constructor.call(this, {
			width 		   : 250,
			store          : Ext.StoreMgr.get('Help.SearchFieldStore'),
			minChars 	   : 2,
			emptyText	   : 'Just start typing ...',
			displayField   : 'name',
			valueField     : 'name',
			hideTrigger    : true,
			autoSelect     : false,
			triggerAction  : 'query',
			typeAhead	   : false,
			mode  		   : 'remote',
			maxHeight      : 200
		});
		
		this.on('select', this.resend, this);
		this.on('expand',function(){
			this.list.dom.firstChild.childNodes.length==1&&this.list.hide();
		},this);
	},
	
	resend : function() {
		this.store.isItemSelected = true;
		this.doQuery(this.getValue());
		this.store.isItemSelected = false;
	}
});

Ext.reg('Dbms.Help.SearchField', Dbms.Help.SearchField);