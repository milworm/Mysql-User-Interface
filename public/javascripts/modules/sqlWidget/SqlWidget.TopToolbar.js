Dbms.SqlWidget.TopToolbar = Ext.extend(Ext.Toolbar, {
	constructor : function(config) {
		Dbms.SqlWidget.TopToolbar.superclass.constructor.call(this, Ext.applyIf(config, {
            xtype : "toolbar",
            items : ["->", {
                text  : "Tab Width",
                ref   : "tabWidthChangeButton",
                xtype : 'button',
                menu  : [{
                    text : "2"
                }, {
                    text : "4"
                }, {
                    text : "8"
                }]
            }]
        }));
        
        this.tabWidthChangeButton.menu.on('click', this.changeTabWidth, this);
	},
    changeTabWidth : function(menu, button) {
        var newTabWidth = button.text - 0;
		var newTabString = '';
		
		for(var i=0;i<newTabWidth;i++){
			newTabString += ' ';
		}
		
		var textarea = Ext.get(this.uniqueId);
        Ext.each(Ext.query('.tabElement', textarea.dom), function(node) {
            node.innerHTML = newTabString;
        },this);
        
        Dbms.Core.MessageBus.fireEvent('Dbms.SqlWidget.TabWidthChange_'+this.uniqueId, newTabWidth);
    }
});