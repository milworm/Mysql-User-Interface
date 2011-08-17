Ext.ns("Dbms.Dashboard");
Dbms.Dashboard.StatView = Ext.extend(Ext.Panel,{
    constructor : function(){
		Dbms.Dashboard.StatView.superclass.constructor.call(this,{
			title  : 'Server Resources Usage',
			layout : 'hbox',
			bbar   : this.getBottomToolbar(),
			items  : [this.getCpuUsageChart(),this.getMemUsageChart(),{
				flex   : .4,
				xtype  : 'panel',
				title  : 'Server Information',
				layout : 'vbox',
				border : false,
				height : 200,
				padding : 10,
				items : [{
					border   : false,
					style    : 'font-size:12px',
					ref      : '../sysInfo',
					style    : 'visibility : hidden',
					defaults : {
						border : false,
						style  : 'font-size:13px'
					},
					items    : [{
						renderTpl  : 'Host Name : {hostname}',
						ref   : '//hostnamePl'
					}, {
						renderTpl  : 'Server Version : {serverVersion}',
						ref   : '//serverVersionPl'
					}, {
						renderTpl  : 'Protocol Version : {protocolVersion}',
						ref   : '//protocolVersionPl'
					}, {
						renderTpl  : 'Connection Character Set : {connectionCharSet}',
						ref   : '//connectionCharSetPl'
					}, {
						renderTpl  : 'Server works : {uptime}',
						ref   : '//uptimePl'
					}, {
						renderTpl : 'Processed queries : {queries}',
						ref   	  : '//queriesPl'
					}, {
						renderTpl : 'Bytes Sent : {bytesSent}',
						ref   	  : '//bytesSentPl'
					}, {
						renderTpl : 'Bytes Received : {bytesReceived}',
						ref   	  : '//bytesReceivedPl'
					}]
				}]
			}]
		});
		
		//this.initSysInfoTpl();
		Dbms.Core.MessageBus.on('Dbms.System.VariableStore.loaded', this.updateServerInfo,this);
	},
	initSysInfoTpl : function(){
		//this.sysInfoTpl = new Ext.XTemplate(
		//	'<b>Host Name : </b>{hostName}<br/>'+
		//	'<b>Server Version: </b>{version} {comment}<br/>'+
		//	'<b>Protocol Version</b> : {protocol}<br/>'+
		//	'<b>Connection Character Set : </b>{charSet}<br/>'+
		//	'<b>Uptime</b> : {uptime}<br/>'
		//);
		//
		//this.sysInfoTpl.compile();
	},
	getCpuUsageChart : function(){
		return {
				flext : .3,
				xtype : "container",
				width : 280,
				ref   : 'cpuStat',
				height: 300,
				items : [{
					store: Ext.StoreMgr.get('System.CpuStatStore'),
					xtype: 'piechart',
					dataField: 'total',
					xField: 'type',
					yField: 'total',
					series: [{
						style: {
							colors: ["#014C82", "#ddddaa", "#999a90", "#edff9f"]
			            }
					}],
					categoryField: 'type',
					extraStyle:{
					    legend:{
					        display: 'bottom',
					        padding: 5,
					        font:{
					            family: 'Tahoma',
					            size: 13
					        }
					    }
					}
				}]
			}
	},
	getMemUsageChart : function(){
		return {
				flext  : .3,
				xtype  : "container",
				width  : 280,
				height : 300,
				items  : [{
					store: Ext.StoreMgr.get('System.MemStatStore'),
					xtype: 'piechart',
					dataField: 'total',
					categoryField: 'type',
					series: [{
						style: {
							colors: ["#014C82", "#ddddaa", "#999a90", "#edff9f"]
			            }
					}],
					xField: 'type',
					yField: 'total',
					extraStyle:{
					    legend:{
					        display: 'bottom',
					        padding: 5,
					        font:{
					            family: 'Tahoma',
					            size: 13
					        }
					    }
					}
				}]
			}
	},
	getBottomToolbar : function(){
		return {xtype : 'toolbar',
				items : [{
					xtype   : "button",
					text    : 'Start monitoring',
					handler : function(e){
						if(this.getText() == 'Stop monitoring'){
							Dbms.Core.MessageBus.fireEvent('Dbms.Dashboard.StopMonitoring');
							this.setText('Start monitoring');
						} else {
							Dbms.Core.MessageBus.fireEvent('Dbms.Dashboard.StartMonitoring');
							this.setText('Stop monitoring');
						}
					}
				},{
					xtype : 'tbfill'
				},{
					xtype   : 'button',
					text    : "Refresh",
					icon    : '/images/icons/arrow_refresh.png',
					handler : function(){
						Ext.StoreMgr.get('System.CpuStatStore').load();
						Ext.StoreMgr.get('System.MemStatStore').load();
						Ext.StoreMgr.get('System.VariableStore').load();
					}
				}]
		}
	},
	updateServerInfo : function(o) {
		if(!this.rendered) {
			this.on('afterrender', this.updateServerInfo, this);
			return false;
		}
		
		this.mysqlVariableStore = Ext.StoreMgr.get('System.VariableStore');
		this.updateStatEl('hostnamePl',this.getHostName());
		this.updateStatEl('serverVersionPl',this.getVersion());
		this.updateStatEl('protocolVersionPl',this.getProtocol());
		this.updateStatEl('connectionCharSetPl',this.getConnectionCharSet());
		this.updateStatEl('queriesPl',this.getQueries());
		this.updateStatEl('bytesSentPl',this.getBytesSent());
		this.updateStatEl('bytesReceivedPl',this.getBytesReceived());
		this.updateStatEl('uptimePl',this.getUptime());
		this.startTimer();
		this.sysInfo.getEl().show();
		
		return true;
	},
	updateStatEl : function(el, val) {
		var parts = this[el].renderTpl.split(':');
		var html = '<div style="float:left;width:150px">' + parts[0] + '</div> : ';
		
		this[el].setSize(400);
		this[el].update(html + parts[1].replace('{'+el.replace('Pl','')+'}', val));
	},
	getHostName : function(){
		return this.mysqlVariableStore.getByName('hostname').get('value');
	},
	getVersion : function(){
		return this.mysqlVariableStore.getByName('version').get('value');
	},
	getQueries : function(){
		return this.mysqlVariableStore.getByName('Queries').get('value');
	},
	getBytesReceived : function(){
		return this.mysqlVariableStore.getByName('Bytes_received').get('value');
	},
	getBytesSent : function(){
		return this.mysqlVariableStore.getByName('Bytes_sent').get('value');
	},
	getVersionComment : function(){
		return this.mysqlVariableStore.getByName('version_comment').get('value');
	},
	getProtocol : function(){
		return this.mysqlVariableStore.getByName('protocol_version').get('value');
	},
	getConnectionCharSet : function(){
		return this.mysqlVariableStore.getByName('character_set_connection').get('value');
	},
	getMysqlUpTime : function() {
		return this.mysqlVariableStore.getByName('Uptime').get('value');
	},
	updateMysqlUpTime : function(newTime) {
		if('undefined' == typeof newTime){
			newTime = (this.mysqlVariableStore.getByName('Uptime').get('value')-0)+1;
		}
		
		this.mysqlVariableStore.getByName('Uptime').set('value', newTime);
		return newTime;
	},
	getUptime : function() {
		var seconds = this.getMysqlUpTime();
		
		var days  = Math.floor( seconds / 86400);
		var hours = Math.floor( (seconds - (days * 86400) ) / 3600);
		var min   = Math.floor( (seconds - ((days * 86400) + (hours * 3600)) ) / 60);
		var sec   = seconds - (days * 86400 + hours * 3600 + min * 60);
		
		return days + ' days ' + hours + ' hours ' + min + ' min ' + sec + ' sec';
	},
	startTimer : function() {
		if(this.timer != undefined) {
			return false;
		}
		
		this.timer = setInterval(function() {
			this.updateMysqlUpTime();
			this.updateStatEl('uptimePl',this.getUptime());
		}.createDelegate(this),1000);
	}
});