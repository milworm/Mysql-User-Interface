Dbms.SqlWidget.View = Ext.extend(Ext.Panel, {
	constructor : function(config) {
		Dbms.SqlWidget.View.superclass.constructor.call(this, Ext.applyIf({
			xtype       : 'container',
			layout      : 'border',
			items       : [{
				region 	    : 'north',
				xtype  	    : 'panel',
				collapsible : true,
				ref         : 'sqlQueryPanel',
				title       : 'Perform Sql Query',
				height 	    : 150,
				layout      : "fit",
				split       : true,
				minHeight 	: 150,
                tbar        : this.getTopToolbar(config.uniqueId),
                bbar        : this.getBottomToolbar()
            }, {
                region : 'center',
                xtype  : "container",
                layout : 'fit',
                ref    : '/ctr',
                items  : [{
                    html : "No items to display"
                }]
            }],
			listeners : {
				afterrender : this.onAfterRender,
				scope       : this
			}
        }, config));
	},
	onAfterRender : function() {
		this.sqlQueryPanel.add({
			html : {
            	id    : this.uniqueId
            },
			id            : this.uniqueId + '-cmp',
            isDefaultText : true
		});
	},
	getBottomToolbar : function() {
		return {
            xtype : 'toolbar',
            items : ['->', {
                xtype : "button",
                text  : "Clear"
            }, {
				xtype   : "button",
				text    : "Execute",
				handler : this.execQuery,
				scope   : this
			}]
        };
	},
    execQuery : function(btn) {
        var query = Ext.getDom(this.uniqueId).innerText; // get sql-statements without html-tags
        Dbms.Core.MessageBus.fireEvent('Dbms.SqlWidget.ExecQuery_'+this.uniqueId, {
            query    : query,
            dbName   : this.dbName,
            uniqueId : this.uniqueId
        });
    },
    getTopToolbar : function(id) {
        return new Dbms.SqlWidget.TopToolbar({
            uniqueId : id
        });
    }
});