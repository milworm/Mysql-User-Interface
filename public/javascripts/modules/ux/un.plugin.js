Ext.namespace("Ext.ux.grid.filter");
Ext.ux.grid.filter.Filter = function(config){
	Ext.apply(this, config);
		
	this.events = {
		/**
		 * @event activate
		 * Fires when a inactive filter becomes active
		 * @param {Ext.ux.grid.filter.Filter} this
		 */
		'activate': true,
		/**
		 * @event deactivate
		 * Fires when a active filter becomes inactive
		 * @param {Ext.ux.grid.filter.Filter} this
		 */
		'deactivate': true,
		/**
		 * @event update
		 * Fires when a filter configuration has changed
		 * @param {Ext.ux.grid.filter.Filter} this
		 */
		'update': true,
		/**
		 * @event serialize
		 * Fires after the serialization process. Use this to apply additional parameters to the serialized data.
		 * @param {Array/Object} data A map or collection of maps representing the current filter configuration.
		 * @param {Ext.ux.grid.filter.Filter} filter The filter being serialized.
		 **/
		'serialize': true
	};
	Ext.ux.grid.filter.Filter.superclass.constructor.call(this);
	
	this.menu = new Ext.menu.Menu();
	this.init();
	
	if(config && config.value){
		this.setValue(config.value);
		this.setActive(config.active !== false, true);
		delete config.value;
	}
};
Ext.extend(Ext.ux.grid.filter.Filter, Ext.util.Observable, {
	/**
	 * @cfg {Boolean} active
	 * Indicates the default status of the filter (defaults to false).
	 */
    /**
     * True if this filter is active. Read-only.
     * @type Boolean
     * @property
     */
	active: false,
	/**
	 * @cfg {String} dataIndex 
	 * The {@link Ext.data.Store} data index of the field this filter represents. The dataIndex does not actually
	 * have to exist in the store.
	 */
	dataIndex: null,
	/**
	 * The filter configuration menu that will be installed into the filter submenu of a column menu.
	 * @type Ext.menu.Menu
	 * @property
	 */
	menu: null,
	
	/**
	 * Initialize the filter and install required menu items.
	 */
	init: Ext.emptyFn,
	
	fireUpdate: function(){
		this.value = this.item.getValue();
		
		if(this.active)
			this.fireEvent("update", this);
			
		this.setActive(this.value.length > 0);
	},
	
	/**
	 * Returns true if the filter has enough configuration information to be activated.
	 * 
	 * @return {Boolean}
	 */
	isActivatable: function(){
		return true;
	},
	
	/**
	 * Sets the status of the filter and fires that appropriate events.
	 * 
	 * @param {Boolean} active        The new filter state.
	 * @param {Boolean} suppressEvent True to prevent events from being fired.
	 */
	setActive: function(active, suppressEvent){
		if(this.active != active){
			this.active = active;
			if(suppressEvent !== true)
				this.fireEvent(active ? 'activate' : 'deactivate', this);
		}
	},
	
	/**
	 * Get the value of the filter
	 * 
	 * @return {Object} The 'serialized' form of this filter
	 */
	getValue: Ext.emptyFn,
	
	/**
	 * Set the value of the filter.
	 * 
	 * @param {Object} data The value of the filter
	 */	
	setValue: Ext.emptyFn,
	
	/**
	 * Serialize the filter data for transmission to the server.
	 * 
	 * @return {Object/Array} An object or collection of objects containing key value pairs representing
	 * 	the current configuration of the filter.
	 */
	serialize: Ext.emptyFn,
	
	/**
	 * Validates the provided Ext.data.Record against the filters configuration.
	 * 
	 * @param {Ext.data.Record} record The record to validate
	 * 
	 * @return {Boolean} True if the record is valid with in the bounds of the filter, false otherwise.
	 */
	 validateRecord: function(){return true;}
});

/**
 * Ext.ux.grid.GridFilters v0.2.7
 **/

Ext.namespace("Ext.ux.grid");
Ext.ux.grid.GridFilters = function(config){		
	this.filters = new Ext.util.MixedCollection();
	this.filters.getKey = function(o){return o ? o.dataIndex : null};
	
	for(var i=0, len=config.filters.length; i<len; i++)
		this.addFilter(config.filters[i]);
	
	this.deferredUpdate = new Ext.util.DelayedTask(this.reload, this);
	
	delete config.filters;
	Ext.apply(this, config);
};
Ext.extend(Ext.ux.grid.GridFilters, Ext.util.Observable, {
	/**
	 * @cfg {Integer} updateBuffer
	 * Number of milisecond to defer store updates since the last filter change.
	 */
	updateBuffer: 500,
	/**
	 * @cfg {String} paramPrefix
	 * The url parameter prefix for the filters.
	 */
	paramPrefix: 'filter',
	/**
	 * @cfg {String} fitlerCls
	 * The css class to be applied to column headers that active filters. Defaults to 'ux-filterd-column'
	 */
	filterCls: 'ux-filtered-column',
	/**
	 * @cfg {Boolean} local
	 * True to use Ext.data.Store filter functions instead of server side filtering.
	 */
	local: false,
	/**
	 * @cfg {Boolean} autoReload
	 * True to automagicly reload the datasource when a filter change happens.
	 */
	autoReload: true,
	/**
	 * @cfg {String} stateId
	 * Name of the Ext.data.Store value to be used to store state information.
	 */
	stateId: undefined,
	/**
	 * @cfg {Boolean} showMenu
	 * True to show the filter menus
	 */
	showMenu: true,

	menuFilterText: 'Filters',

	init: function(grid){
		if(grid instanceof Ext.grid.GridPanel){
			this.grid  = grid;
		  
			//this.store = this.grid.getStore();
			//if(this.local){
			//	this.store.on('load', function(store){
			//		store.filterBy(this.getRecordFilter());
			//	}, this);
			//} else {
			// //this.store.on('beforeload', this.onBeforeLoad, this);
			//}
			  
			this.grid.filters = this;
			 
			this.grid.addEvents({"filterupdate": true});
			  
			grid.on("render", this.onRender, this);
			  
			grid.on("beforestaterestore", this.applyState, this);
			grid.on("beforestatesave", this.saveState, this);
					  
		} else if(grid instanceof Ext.PagingToolbar){
		  this.toolbar = grid;
		}
	},
		
	/** private **/
	applyState: function(grid, state){
		this.suspendStateStore = true;
		this.clearFilters();
		if(state.filters)
			for(var key in state.filters){
				var filter = this.filters.get(key);
				if(filter){
					filter.setValue(state.filters[key]);
					filter.setActive(true);
				}
			}
			
		this.deferredUpdate.cancel();
		if(this.local)
			this.reload();
			
		this.suspendStateStore = false;
	},
	
	/** private **/
	saveState: function(grid, state){
		var filters = {};
		this.filters.each(function(filter){
			if(filter.active)
				filters[filter.dataIndex] = filter.getValue();
		});
		return state.filters = filters;
	},
	
	/** private **/
	onRender: function(){
		var hmenu;
		
		if(this.showMenu){
			hmenu = this.grid.getView().hmenu;
			
			this.sep  = hmenu.addSeparator();
			this.menu = hmenu.add(new Ext.menu.CheckItem({
					text: this.menuFilterText,
					menu: new Ext.menu.Menu()
				}));
			this.menu.on('checkchange', this.onCheckChange, this);
			this.menu.on('beforecheckchange', this.onBeforeCheck, this);
				
			hmenu.on('beforeshow', this.onMenu, this);
		}
		
		this.grid.getView().on("refresh", this.onRefresh, this);
		this.updateColumnHeadings(this.grid.getView());
	},
	
	/** private **/
	onMenu: function(filterMenu){
		var filter = this.getMenuFilter();
		if(filter){
			this.menu.menu = filter.menu;
			this.menu.setChecked(filter.active, false);
		}
		
		this.menu.setVisible(filter !== undefined);
		this.sep.setVisible(filter !== undefined);
	},
	
	/** private **/
	onCheckChange: function(item, value){
		this.getMenuFilter().setActive(value);
	},
	
	/** private **/
	onBeforeCheck: function(check, value){
		return !value || this.getMenuFilter().isActivatable();
	},
	
	/** private **/
	onStateChange: function(event, filter){
    if(event == "serialize") return;
    
		if(filter == this.getMenuFilter())
			this.menu.setChecked(filter.active, false);
			
		if(this.autoReload || this.local)
			this.deferredUpdate.delay(this.updateBuffer);
		
		var view = this.grid.getView();
		this.updateColumnHeadings(view);
			
		this.grid.saveState();
			
		this.grid.fireEvent('filterupdate', this, filter);
	},
	
	/** private **/
	onBeforeLoad: function(store, options){
    options.params = options.params || {};
		this.cleanParams(options.params);		
		var params = this.buildQuery(this.getFilterData());
		Ext.apply(options.params, params);
	},
	
	/** private **/
	onRefresh: function(view){
		this.updateColumnHeadings(view);
	},
	
	/** private **/
	getMenuFilter: function(){
		var view = this.grid.getView();
		if(!view || view.hdCtxIndex === undefined)
			return null;
		
		return this.filters.get(
			view.cm.config[view.hdCtxIndex].dataIndex);
	},
	
	/** private **/
	updateColumnHeadings: function(view){
		if(!view || !view.mainHd) return;
		
		var hds = view.mainHd.select('td').removeClass(this.filterCls);
		for(var i=0, len=view.cm.config.length; i<len; i++){
			var filter = this.getFilter(view.cm.config[i].dataIndex);
			if(filter && filter.active)
				hds.item(i).addClass(this.filterCls);
		}
	},
	
	/** private **/
	reload: function(){
		//if(this.local){
		//	this.grid.store.clearFilter(true);
		//	this.grid.store.filterBy(this.getRecordFilter());
		//} else {
		//	this.deferredUpdate.cancel();
		//	var store = this.grid.store;
		//	if(this.toolbar){
		//		var start = this.toolbar.paramNames.start;
		//		if(store.lastOptions && store.lastOptions.params && store.lastOptions.params[start])
		//			store.lastOptions.params[start] = 0;
		//	}
		//	store.reload();
		//}
	},
	
	/**
	 * Method factory that generates a record validator for the filters active at the time
	 * of invokation.
	 * 
	 * @private
	 */
	getRecordFilter: function(){
		var f = [];
		this.filters.each(function(filter){
			if(filter.active) f.push(filter);
		});
		
		var len = f.length;
		return function(record){
			for(var i=0; i<len; i++)
				if(!f[i].validateRecord(record))
					return false;
				
			return true;
		};
	},
	
	/**
	 * Adds a filter to the collection.
	 * 
	 * @param {Object/Ext.ux.grid.filter.Filter} config A filter configuration or a filter object.
	 * 
	 * @return {Ext.ux.grid.filter.Filter} The existing or newly created filter object.
	 */
	addFilter: function(config){
		var filter = config.menu ? config : 
				new (this.getFilterClass(config.type))(config);
		this.filters.add(filter);
		
		Ext.util.Observable.capture(filter, this.onStateChange, this);
		return filter;
	},
	
	/**
	 * Returns a filter for the given dataIndex, if on exists.
	 * 
	 * @param {String} dataIndex The dataIndex of the desired filter object.
	 * 
	 * @return {Ext.ux.grid.filter.Filter}
	 */
	getFilter: function(dataIndex){
		return this.filters.get(dataIndex);
	},

	/**
	 * Turns all filters off. This does not clear the configuration information.
	 */
	clearFilters: function(){
		this.filters.each(function(filter){
			filter.setActive(false);
		});
	},

	/** private **/
	getFilterData: function(){
		var filters = [],
			fields  = this.grid.getStore().fields;
		
		this.filters.each(function(f){
			if(f.active){
				var d = [].concat(f.serialize());
				for(var i=0, len=d.length; i<len; i++)
					filters.push({
						field: f.dataIndex,
						data: d[i]
					});
			}
		});
		
		return filters;
	},
	
	/**
	 * Function to take structured filter data and 'flatten' it into query parameteres. The default function
	 * will produce a query string of the form:
	 * 		filters[0][field]=dataIndex&filters[0][data][param1]=param&filters[0][data][param2]=param...
	 * 
	 * @param {Array} filters A collection of objects representing active filters and their configuration.
	 * 	  Each element will take the form of {field: dataIndex, data: filterConf}. dataIndex is not assured
	 *    to be unique as any one filter may be a composite of more basic filters for the same dataIndex.
	 * 
	 * @return {Object} Query keys and values
	 */
	buildQuery: function(filters){
		var p = {};
		for(var i=0, len=filters.length; i<len; i++){
			var f    = filters[i];
			var root = [this.paramPrefix, '[', i, ']'].join('');
			p[root + '[field]'] = f.field;
			
			var dataPrefix = root + '[data]';
			for(var key in f.data)
				p[[dataPrefix, '[', key, ']'].join('')] = f.data[key];
		}
		
		return p;
	},
	
	/**
	 * Removes filter related query parameters from the provided object.
	 * 
	 * @param {Object} p Query parameters that may contain filter related fields.
	 */
	cleanParams: function(p){
		var regex = new RegExp("^" + this.paramPrefix + "\[[0-9]+\]");
		for(var key in p)
			if(regex.test(key))
				delete p[key];
	},
	
	/**
	 * Function for locating filter classes, overwrite this with your favorite
	 * loader to provide dynamic filter loading.
	 * 
	 * @param {String} type The type of filter to load.
	 * 
	 * @return {Class}
	 */
	getFilterClass: function(type){
		return Ext.ux.grid.filter[type.substr(0, 1).toUpperCase() + type.substr(1) + 'Filter'];
	}
});
Ext.namespace("Ext.ux.grid");

/**
 * @class Ext.ux.grid.GridHeaderFilters
 * @extends Ext.util.Observable
 *
 * Plugin that enables filters in columns headers.
 *
 * To add a grid header filter, put the "filter" attribute in column configuration of the grid column model.
 * This attribute is the configuration of the Ext.form.Field to use as filter in the header:<br>
 *
 * The filter configuration object can include some attributes to manage filter configuration:
 * "filterName": to specify the name of the filter and the corresponding HTTP parameter used to send filter value to server.
 * 					If not specified column "dataIndex" attribute will be used.
 * "value": to specify default value for filter. If no value is provided for filter, this value will be used as default filter value
 * "filterEncoder": a function used to convert filter value returned by filter field "getValue" method to a string. Useful if the filter field getValue() method
 * 						returns an object that is not a string
 * "filterDecoder": a function used to convert a string to a valid filter field value. Useful if the filter field setValue(obj) method
 * 						needs an object that is not a string
 *
 * The GridHeaderFilter constructor accept a configuration object with these properties:
 * "stateful": Switch GridHeaderFilter plugin to attempt to save and restore filters values with the configured Ext.state.Provider. Default true.
 * "height": Height of filters header area. Default 24.
 * "padding": Padding of header filters cells. Default 4.
 * "highlightOnFilter": Enabled grid header highlight if at least one filter is set. Default true.
 * "highlightColor": Color to use when highlight header (see "highlightOnFilter"). Default "orange".
 * "applyMode": Sets how filters are applied. If equals to "auto" or "change" (default) the filter is applyed when filter field value changes (change, select, ENTER).
 * 				If set to "enter" the filters are applied only when user push "ENTER" on filter field.
 * "filters": Initial values for grid filters. These values always override grid status saved filters.
 *
 * This plugin fires "render" event when the filters are rendered after grid rendering:
 * render(GridHeaderFiltersPlugin)
 *
 * This plugin enables "filterupdate" event for the grid:
 * filterupdate(filtername, filtervalue, field)
 *
 * This plugin enables some new grid methods:
 * getHeaderFilter(name)
 * getHeaderFilterField(name)
 * setHeaderFilter(name, value)
 * setHeaderFilters(object, [bReset], [bReload])
 * resetHeaderFilters([bReload])
 * applyHeaderFilters([bReload])
 *
 * The "name" is the dataIndex of the corresponding column or to the filterName (if specified in filter cfg)
 *
 * @constructor Create a new GridHeaderFilters plugin
 * @param cfg Plugin configuration.
 * @author Damiano Zucconi - http://www.isipc.it
 * @version 1.0.9 - 29/10/2009
 */
Ext.ux.grid.GridHeaderFilters = function(cfg){
	if(cfg) Ext.apply(this, cfg);
};

Ext.extend(Ext.ux.grid.GridHeaderFilters, Ext.util.Observable,
{
	/**
	 * @cfg {Number} height
	 * Height of filter area in grid header. Default: 32px
	 */
	height: 26,

	/**
	 * @cfg {Number} padding
	 * Padding for filter header cells. Default: 4px
	 */
	padding: 4,

	/**
	 * @cfg {Boolean} highlightOnFilter
	 * Enable grid header highlight if active filters
	 */
	highlightOnFilter: true,

	/**
	 * @cfg {String} highlightColor
	 * Color for highlighted grid header
	 */
	highlightColor: 'orange',

	/**
	 * @cfg {Boolean} stateful
	 * Enable or disable filters save and restore through enabled Ext.state.Provider
	 */
	stateful: true,

	/**
	 * @cfg {String} applyMode
	 * Sets how filters are applied. If equals to "auto" (default) the filter is applyed when filter field value changes (change, select, ENTER).
	 * If set to "button" an apply button is rendered near each filter. When user push this button all filters are applied at the same time. This
	 * could be useful if you want to set more than one filter before reload the store.
	 * @since Ext.ux.grid.GridHeaderFilters 1.0.6
	 */
	applyMode: "auto",

	/**
	 * @cfg {Object} filters
	 * Initial values for filters. Overrides values loaded from grid status.
	 * @since Ext.ux.grid.GridHeaderFilters 1.0.9
	 */
	filters: null,

	applyFiltersText: "Apply filters",

	init:function(grid)
	{
		this.grid = grid;
		this.gridView = null;
		this.panels = [];
		//I TD corrispondenti ai vari headers
		this.headerCells = null;
		this.grid.on("render", this.onRender, this);
		this.grid.on("columnmove", this.renderFilters.createDelegate(this, [false]), this);
		this.grid.on("columnresize", this.onColResize, this);
		this.grid.on("bodyresize", this.onBodyResize, this);
		if(this.stateful)
		{
			this.grid.on("beforestatesave", this.saveFilters, this);
			this.grid.on("beforestaterestore", this.loadFilters, this);
		}

		this.grid.getColumnModel().on("hiddenchange", this.onColHidden, this);

		this.grid.addEvents({
			"filterupdate": true
		});
		this.addEvents({
			'render': true
		});
		Ext.ux.grid.GridHeaderFilters.superclass.constructor.call(this);

		this.grid.stateEvents[this.grid.stateEvents.length] = "filterupdate";

		this.grid.headerFilters = this;

		this.grid.getHeaderFilter = function(sName){
			if(!this.headerFilters)
				return null;
			if(this.headerFilters.filterFields[sName])
				return this.headerFilters.getFieldValue(this.headerFilters.filterFields[sName]);
			else
				return null;
		};

		this.grid.setHeaderFilter = function(sName, sValue){
			if(!this.headerFilters)
				return;
			var fd = {};
			fd[sName] = sValue;
			this.setHeaderFilters(fd);
		};

		this.grid.setHeaderFilters = function(obj, bReset, bReload)
		{
			if(!this.headerFilters)
				return;
			if(bReset)
				this.resetHeaderFilters(false);
			if(arguments.length < 3)
				var bReload = true;
			var bOne = false;
			for(var fn in obj)
			{
				if(this.headerFilters.filterFields[fn])
				{
					var el = this.headerFilters.filterFields[fn];
					this.headerFilters.setFieldValue(el,obj[fn]);
					this.headerFilters.applyFilter(el, false);
					bOne = true;
				}
			}
			if(bOne && bReload)
				this.headerFilters.storeReload();
		};

		this.grid.getHeaderFilterField = function(sFn)
		{
			if(!this.headerFilters)
				return;
			if(this.headerFilters.filterFields[fn])
				return this.headerFilters.filterFields[fn];
			else
				return null;
		};

		this.grid.resetHeaderFilters = function(bReload)
		{
			if(!this.headerFilters)
				return;
			if(arguments.length == 0)
				var bReload = true;
			for(var fn in this.headerFilters.filterFields)
			{
				var el = this.headerFilters.filterFields[fn];
				this.headerFilters.setFieldValue(el, "");
				this.headerFilters.applyFilter(el, false);
			}
			if(bReload)
				this.headerFilters.storeReload();
		};

		this.grid.applyHeaderFilters = function(bReload)
		{
			if(arguments.length == 0)
				var bReload = true;
			this.headerFilters.applyFilters(bReload);
		};
	},

	renderFilters: function(bReload)
	{
		//Eliminazione Fields di filtro esistenti
		this.filterFields = {};

		//Elimino pannelli esistenti
		for(var pId in this.panels)
		{
			if((this.panels[pId] != null) && (Ext.type(this.panels[pId].destroy) == "function"))
				this.panels[pId].destroy();
		}
		this.panels = [];

		this.cm = this.grid.getColumnModel();
		this.gridView = this.grid.view;
		this.headTr = Ext.DomQuery.selectNode("tr",this.gridView.mainHd.dom);
		this.headerCells = Ext.query("td",this.headTr);

		var cols = this.cm.getColumnsBy(function(){
			return true;
		});
		for ( var i = 0; i < cols.length; i++)
		{
			var co = cols[i];
			this.panels[co.dataIndex] = this.createFilterPanel(co, this.grid);
		}
		//Cleaning this.filters

		//Check if some filter is already active
		if(this.isFiltered())
		{
			//Apply filters
			if(bReload)
				this.storeReload();
			//Highlight header
			this.highlightFilters(true);
		}
	},

	onRender: function()
	{
		if(!this.filters)
			this.filters = {};
		this.renderFilters(true);
		this.fireEvent("render", this);
	},

	onRefresh: function(){
		this.renderFilters(false);
	},

	onBodyResize: function(p, width, height){
		setTimeout(function(){
			var colWidth;
			var colCount = this.cm.getColumnCount();
			for(var i=0; i<colCount; i++) {
				colWidth = this.cm.getColumnWidth(i);
				this.onColResize(i, colWidth);
			}
		}.createDelegate(this)
		, 100);
	},

	onColResize: function(index, iWidth){
		var colId = this.cm.getDataIndex(index);
		var panel = this.panels[colId];
		if(panel && (panel != null))
		{
			if(isNaN(iWidth))
				iWidth = 0;
			var filterW = (iWidth < 2) ? 0 : (iWidth - 2);
			panel.setWidth(filterW);
			panel.doLayout();
		}
	},

	onColHidden: function(cm, index, bHidden){
		if(bHidden)
			return;
		var colId = cm.getDataIndex(index);
		var panel = this.panels[colId];
		if(panel && (panel != null))
		{
			var iWidth = cm.getColumnWidth(index);
			var filterW = (iWidth < 2) ? 0 : (iWidth - 2);
			panel.setWidth(filterW);
			panel.doLayout();
		}
	},

	saveFilters: function(grid, status)
	{
		var vals = {};
		for(var name in this.filters)
		{
			vals[name] = this.filters[name];
		}
		status["gridHeaderFilters"] = vals;
		return true;
	},

	loadFilters: function(grid, status)
	{
		var vals = status.gridHeaderFilters;
		if(vals)
		{
			if(!this.filters)
				this.filters = {};

			Ext.applyIf(this.filters, vals);
		/*var bOne = false;
			for(var name in vals)
			{
				this.filters[name] = vals[name];
				this.grid.store.baseParams[name] = vals[name];
				bOne = true;
			}
			/*if(bOne)
				this.grid.store.reload();*/
		}

	},

	isFiltered: function()
	{
		for(var k in this.filters)
		{
			if(this.filterFields[k] && !Ext.isEmpty(this.filters[k]))
				return true;
		}
		return false;
	},

	highlightFilters: function(enable)
	{
		if(!this.highlightOnFilter)
			return;
		var color = enable ? this.highlightColor : "transparent";
		for(var fn in this.filterFields)
		{
			this.filterFields[fn].ownerCt.getEl().dom.style.backgroundColor = color;
		}
	},

	getFieldValue: function(eField)
	{
		if(Ext.type(eField.filterEncoder) == "function")
			return eField.filterEncoder.call(eField, eField.getValue());
		else
			return eField.getValue();
	},

	setFieldValue: function(eField, value)
	{
		if(Ext.type(eField.filterDecoder) == "function")
			value = eField.filterDecoder.call(eField, value);
		eField.setValue(value);
	},

	applyFilter: function(el, bLoad)
	{
		if(arguments.length < 2)
			bLoad = true;
		if(!el)
			return;

		if(!el.isValid())
			return;

		var sValue = this.getFieldValue(el);


		if(Ext.isEmpty(sValue))
		{
			delete this.grid.store.baseParams[el.filterName];
			delete this.filters[el.filterName];
		}
		else
		{
			this.grid.store.baseParams[el.filterName] = sValue;
			this.filters[el.filterName] = sValue;

			//Controllo che la colonna del filtro applicato sia visibile
			var ci = this.grid.getColumnModel().findColumnIndex(el.dataIndex);
			if((ci >= 0) && (this.grid.getColumnModel().isHidden(ci)))
				this.grid.getColumnModel().setHidden(ci, false);
		}

		//Evidenza filtri se almeno uno attivo
		this.highlightFilters(this.isFiltered());

		this.grid.fireEvent("filterupdate",el.filterName,sValue,el);

		if(bLoad)
			this.storeReload();
	},

	applyFilters: function(bLoad)
	{
		if(arguments.length < 1)
			bLoad = true;
		for(var fn in this.filterFields)
		{
			this.applyFilter(this.filterFields[fn], false);
		}
		if(bLoad)
			this.storeReload();
			
	},

	storeReload: function()
	{
		//if(!this.grid.store.lastOptions)
		//	return;
		//var slp = {
		//	start: 0
		//};
		//if(this.grid.store.lastOptions.params && this.grid.store.lastOptions.params.limit)
		//	slp.limit = this.grid.store.lastOptions.params.limit;
		//this.grid.store.load({
		//	params: slp
		//});
	},

	createFilterPanel: function(colCfg, grid)
	{
		// = this.cm.findColumnIndex(colCfg.dataIndex);
		//Thanks to dzj
		var iColIndex = this.cm.getIndexById(colCfg.id);
		//var headerTd = Ext.get(this.gridView.getHeaderCell(iColIndex));
		var headerTd = Ext.get(this.headerCells[iColIndex]);
		//Patch for field text selection on Mozilla
		if(Ext.isGecko)
			headerTd.dom.style.MozUserSelect = "text";
		var filterPanel = null;

		if(colCfg.filter)
		{
			var iColWidth = this.cm.getColumnWidth(iColIndex);
			var iPanelWidth = iColWidth - 2;

			//Pannello filtri
			var panelConfig = {
				/*id: "filter-panel-"+colCfg.id,*/
				width: iPanelWidth,
				height: this.height,
				border: false,
				bodyStyle: "background-color: transparent; padding: 2px",
				bodyBorder: false,
				layout: "fit",
				items: [],
				stateful: false
			};

			//Configurazione widget filtro
			var filterConfig = {};
			Ext.apply(filterConfig, colCfg.filter);
			Ext.apply(filterConfig, {
				dataIndex: colCfg.dataIndex,
				margins: {
					top: 2,
					right: 2,
					bottom: 2,
					left: 2
				},
				stateful: false
			});

			var filterName = filterConfig.filterName ? filterConfig.filterName : colCfg.dataIndex;
			filterConfig.filterName = filterName;
			panelConfig.items.push(filterConfig);

			//applyMode: auto o enter
			if(this.applyMode == "auto" || this.applyMode == "change" || Ext.isEmpty(this.applyMode))
			{
				filterConfig.listeners =
				{
					change: function(field){
						this.applyFilter(field);
					},
					specialkey: function(el,ev)
					{
						ev.stopPropagation();
						if(ev.getKey() == ev.ENTER)
							el.el.dom.blur();
					},
					select: function(field){
						this.applyFilter(field);
					},
					scope: this
				};
			}
			else if(this.applyMode == "enter")
			{
				filterConfig.listeners =
				{
					specialkey: function(el,ev)
					{
						ev.stopPropagation();
						if(ev.getKey() == ev.ENTER)
						{
							this.applyFilters();
						}
					},
					scope: this
				};
			}
			
			filterPanel = new Ext.Panel(panelConfig);
			filterPanel.render(headerTd);
			var filterField = filterPanel.items.first();
			this.filterFields[filterName] = filterField;
			if(!Ext.isEmpty(this.filters[filterName]))
			{
				this.setFieldValue(filterField,this.filters[filterName]);

				this.applyFilter(filterField, false);

			}
			else if(filterConfig.value)
			{
				filterField.setValue(filterConfig.value);
				this.applyFilter(filterField, false);
			}
		}

		return filterPanel;
	}
});
