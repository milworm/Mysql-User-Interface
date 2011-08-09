Dbms.Database.Importer.BottomToolbar = Ext.extend(Ext.Toolbar, {
	constructor : function(config) {
		Dbms.Database.Importer.BottomToolbar.superclass.constructor.call(this, Ext.applyIf({
			style  : 'padding:14px',
			items  : ['->', {
					xtype  	   : 'form',
					layout     : 'hbox',
					ref        : 'formPanel',
					width      : 360,
					fileUpload : true,
					frame  	   : true,
                    border 	   : true,
                    defaults   : {
                        frame  : true,
                        border : true
                    },
					items  : [{
						xtype      : 'fileuploadfield',
						name       : "filename",
						frame      : false,
						border     : false,
						width      : 300,
						emptyText  : 'Select SQL-file',
						buttonText : 'Choose'
					}, {
						
						xtype   : 'button',
						text    : "Upload",
						handler : this.upload,
						scope   : this
					}, {
						xtype     : 'textfield',
						inputType : 'hidden',
						name      : 'databaseName',
						value     : config.database
					}]
				}]
		}, config));
	},
	/*
	 * performs request to upload file
	 */
	upload : function() {
		this.formPanel.form.submit({
			url     : Dbms.Actions.database.upload,
            waitMsg : 'Uploading... Please Wait...',
            success : this.onUploadSuccess,
			failure : this.onUploadFailure
		});
	},
	onUploadFailure : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
		    msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
		});
	},
	onUploadSuccess : function(form, response) {
		var result = response.result;
		
		if(!result.success) {
			Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError', {
				msg : result.msg
			});
			
			return ;
		}
		
		Ext.MessageBox.alert("Success", "You have successfully inserted sql-statmenets");
	}
});

Ext.reg('database.importer.bbar', Dbms.Database.Importer.BottomToolbar);