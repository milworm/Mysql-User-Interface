Ext.ns('Dbms.Database.Tree');
Dbms.Database.Tree.BottomToolbar = Ext.extend(Ext.Toolbar,{
	constructor : function(){
		Dbms.Database.Tree.BottomToolbar.superclass.constructor.call(this,{
			border : false,
			xtype : 'toolbar',
			hideBorders : true,
			hideParent : true,
			hidden : true,
			items : [{
				xtype 			: 'textfield',
				ref   			: 'queryField',
				enableKeyEvents : true
			}, '->', {
				xtype : 'button',
				text  : 'reset',
				ref   : 'resetBtn'
			}]
		});
		
		Dbms.Core.MessageBus.on('Dbms.TreePanel.Database.keypress', this.onTreePanelKeyPress, this);
		Dbms.Core.MessageBus.on('Dbms.TreePanel.BottomToolbar.hide', this.hideToolbar, this);
		Dbms.Core.MessageBus.on('Dbms.TreePanel.Database.backspace', this.onTreePanelBackspace, this);
		this.queryField.on('keyup', this.queryFieldChanged, this);
		this.resetBtn.on('click', this.onResetBtnClick, this);
	},
	onResetBtnClick : function(){
		this.hideToolbar();
		this.queryFieldChanged();
	},
	hideToolbar : function() {
		this.hide();
		this.queryField.setValue('');
		Dbms.Core.Viewport.west.doLayout();
	},
	onTreePanelBackspace : function(){
		this.show();
		var newValue = this.queryField.getValue();
			newValue = newValue.substring(0, newValue.length-1);
			
		this.queryField.setValue(newValue);
		this.queryFieldChanged();
	},
	onTreePanelKeyPress : function(config) {
		this.show();
		var charCode = config.charCode;
		this.databaseName = config.databaseName;
		this.node = config.node;
		
		var ch = String.fromCharCode(charCode);
		this.queryField.setValue(this.queryField.getValue() + ch);
		Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.Filter', {
			databaseName : this.databaseName,
			query        : this.queryField.getValue(),
			node         : this.node
		});
	},
	queryFieldChanged : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.Filter', {
			databaseName : this.databaseName,
			query        : this.queryField.getValue(),
			node         : this.node
		});
	}
});

Ext.reg('Dbms.Database.Tree.BottomToolbar', Dbms.Database.Tree.BottomToolbar);