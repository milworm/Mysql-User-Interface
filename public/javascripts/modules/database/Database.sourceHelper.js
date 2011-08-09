//Database.SourceHelper = Ext.extend(Ext.Window,{
//	constructor : function(){
//		var c = {
//			title     : 'Create Database Dump',
//			renderTo  : Dbms.Core.Viewport.center.body,
//			constrain : true,
//			width     : 500,
//			height    : 400,
//			items     : [{
//				xtype  : 'container',
//				layout : 'column',
//				style  : 'padding:10px;',
//				items  : [{
//					xtype      : 'container',
//					layout     : 'form',
//					labelWidth : 280,
//					items      : [{
//						xtype 	   : 'checkbox',
//						fieldLabel : 'Dump all databases'
//					},{
//						xtype 	   : 'checkbox',
//						fieldLabel : 'Add a "DROP DATABASE" before each create'
//					},{
//						xtype 	   : 'checkbox',
//						fieldLabel : 'Add a "DROP TABLE" before each create'
//					},{
//						xtype 	   : 'checkbox',
//						fieldLabel : 'Add locks around insert statements'
//					}]
//				},{
//					xtype  : 'container',
//					layout : 'form',
//					items  : [{
//						text : 'text'	
//					}]
//				}]
//			}]
//		}
//		Server.SourceHelper.superclass.constructor.call(this,c);
//		Dbms.Core.MessageBus.addListener('Server.CreateDump',this.openWindow,this);
//	},
//	openWindow : function(){
//		this.show();
//	}
//});