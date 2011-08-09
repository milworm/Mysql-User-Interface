Ext.ns('Dbms.Core');
/**
 * Application MessageBus
*/
Dbms.Core.MessageBus = Ext.extend(Ext.util.Observable,{
	constructor : function(){
		Dbms.Core.MessageBus.superclass.constructor.call(this);
		this.on('AjaxError', function(o) {
			new Ext.Window({
				modal  : true,
				layout : 'fit',
				title  : 'Ooops',
				items  : [{
					html : o.msg
				}],
				width   : 400,
				height  : 300,
				buttons : [{
					text    : "Ok",
					handler : function(){
						this.ownerCt.ownerCt.close();
					}
				}]
			}).show();
		});
	}
});