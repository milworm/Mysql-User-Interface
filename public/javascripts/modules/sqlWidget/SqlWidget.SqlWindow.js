Dbms.SqlWidget.SqlWindow = Ext.extend(Dbms.Taskbar.Window, {
	constructor : function(config){
		Dbms.SqlWidget.SqlWindow.superclass.constructor.call(this, Ext.applyIf({
            isDefault : true,
            layout    : 'fit',
            //tools     : [{
            //	id 		: 'gear',
            //	handler : function(e) {
            //		alert('Hm... :)');
            //	}
            //}],
            closeAction : 'close',
            height      : 450,
            width       : 800,
            maximizable : true,
            minimizable : true,
            constrain   : true,
            renderTo    : Dbms.Core.Viewport.center.getEl(),
            scope       : this,
			listeners   : {
				beforeshow : this.onBeforeShow,
				scope        : this
			}
		}, config));
		
		this.view.wnd = this;
		this.show();
	},
	onBeforeShow : function() {
		this.setTitle("Excecute SQL-Statement "+this.dbName+' '+this.uniqueId);
		this.add(this.view);
		Dbms.Core.MessageBus.on('Dbms.SqlWidget.UpdateWindowContent_'+this.uniqueId, this.reRenderContent, this);
	},
	reRenderContent : function(config) {
		this.ctr.removeAll(true);
        this.ctr.add(config.grid);
        this.ctr.doLayout();
	}
});