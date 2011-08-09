Ext.onReady(function() {
    var form = Ext.create('Ext.form.FormPanel', {
        bodyBorder: 0,
        fieldDefaults: {
            labelWidth: 55
        },
        url: 'save-form.php',
        defaultType: 'textfield',

        items: [{
            fieldLabel: 'Send To',
            name: 'to',
            anchor:'100%'  // anchor width by percentage
        },{
            fieldLabel: 'Subject',
            name: 'subject',
            anchor: '100%'  // anchor width by percentage
        }, {
            xtype: 'textarea',
            hideLabel: true,
            name: 'msg',
            anchor: '100% -47'  // anchor width by percentage and height by raw adjustment
        }]
    });

    var win = Ext.create('Ext.Window', {
        title: 'Resize Me',
        width: 500,
        height:300,
        minWidth: 300,
        minHeight: 200,
        layout: 'fit',
        plain: true,
        bodyPadding: 5,
        items: form,

        buttons: [{
            text: 'Send'
        },{
            text: 'Cancel'
        }]
    });

    win.show();
});