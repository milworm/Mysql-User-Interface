Ext.ns('Dbms.Database.Importer');

Dbms.Database.Importer.BaseImportView = Ext.extend(Ext.Panel, {
	constructor : function(config) {
		Dbms.Database.Importer.BaseImportView.superclass.constructor.call(this, Ext.applyIf({
			style      : "white-space:pre;",
			title      : "File Content",
			idf        : config.idf,
			region     : 'center',
			bodyBorder : false,
			autoScroll : true,
			autoEl     : {
				tag : 'code'
			},
			bbar      : {
				database : config.database,
				xtype    : "database.importer.bbar"
			},
			items     : [this.getTextAreaEl()]
		}, config));
		
		Dbms.Core.MessageBus.on('system.store.beforeshowfilecontent', this.showLoadMask, this);
		Dbms.Core.MessageBus.on('system.store.showfilecontent', this.updateInnerText, this);
		Dbms.Core.MessageBus.on('system.store.showfilecontenterror', this.hideLoadMask, this);
	},
	getTextAreaEl : function() {
		return {
			border : false,
			html   : '',
			ref    : 'sourceCodeEl'
		}
	},
	updateInnerText : function(config) {
		if(this.idf !== config.idf) return ;
		var text = config.text;
		
		if(config.overflow) {
			text += "...........................\n<b>TEXT IS TOO LONG TO DISPLAY</b>\n......................";
		}
		
		this.sourceCodeEl.update(text);
		this.hideLoadMask(config.idf);
	},
	showLoadMask : function(idf) {
		if(this.idf !== idf) return ;
		this.el.mask("Loading");
	},
	hideLoadMask : function(idf) {
		if(this.idf !== idf) return ;
		this.el.unmask();
	},
	onAjaxFailure : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
		    msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
		});
	}
});

Ext.reg('database.import.view', Dbms.Database.Importer.BaseImportView);