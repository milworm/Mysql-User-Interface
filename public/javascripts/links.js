Dbms.Actions = {
	database : {
		index  	 : '/database/index',
		create 	 : '/database/create',
		drop     : '/database/drop',
		charlist : '/database/charlist',
		entry    : '/database/entry',
		upload   : '/database/upload'
	},
	table : {
		content	  : '/table/content',
		index  	  : '/table/index',
		create 	  : '/table/create',
		drop   	  : '/table/drop',
		modify 	  : '/table/modify',
		filter    : '/table/filter',
		structure : '/table/structure'
	},
	procedure : {
		content   : '/procedure/content',
		index  	  : '/procedure/index',
		create 	  : '/procedure/create',
		drop   	  : '/procedure/drop',
		modify 	  : '/procedure/modify',
		structure : '/procedure/structure'
	},
	func : {
		content   : '/function/content',
		index  	  : '/function/index',
		create 	  : '/function/create',
		drop   	  : '/function/drop',
		modify 	  : '/function/modify',
		structure : '/function/structure'
	},
	trigger : {
		content   : '/trigger/content',
		index     : '/trigger/index',
		create    : '/trigger/create',
		drop      : '/trigger/drop',
		modify    : '/trigger/modify',
		structure : '/trigger/structure'
	},
	view : {
		index     : '/view/index',
		content   : '/view/content',
		structure : '/view/structure',
		drop      : '/view/drop'
	},
	system : {
		index     : '/system/index',
		cpuUsage  : '/system/cpu_usage',
		memUsage  : '/system/mem_usage',
		variables : '/system/variables',
		dir       : '/system/path'
	},
	autocomplete : {
		keywords : '/autocomplete/index',
		full     : '/autocomplete/full/{database_name}'
	},
	help : {
		index   : '/help/index',
		search  : '/help/search',
		content : '/help/content'
	},
	sql : {
		execute : '/sql/execute/'
	},
}