Ext.ns('Dbms.Database.Creator');
Dbms.Database.Creator.Controller = Ext.extend(function(){}, {
	constructor : function() {
		this.win = new Dbms.Database.Creator.Window();
		
		Dbms.Core.MessageBus.on('Dbms.Tree.Database.Creator.Window.open', this.openWindow, this);
	},
	openWindow : function() {
		if (Dbms.Database.Creator.CharacterSetStore.data.length == 0)
			Dbms.Database.Creator.CharacterSetStore.load();
		
		this.win.show();
	}
});