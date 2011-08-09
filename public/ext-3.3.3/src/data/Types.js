/*!
 * Ext JS Library 3.3.3
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/**
 * @class Ext.data.Types
 * <p>This is s static class containing the system-supplied data types which may be given to a {@link Ext.data.Field Field}.<p/>
 * <p>The properties in this class are used as type indicators in the {@link Ext.data.Field Field} class, so to
 * test whether a Field is of a certain type, compare the {@link Ext.data.Field#type type} property against properties
 * of this class.</p>
 * <p>Developers may add their own application-specific data types to this class. Definition names must be UPPERCASE.
 * each type definition must contain three properties:</p>
 * <div class="mdetail-params"><ul>
 * <li><code>convert</code> : <i>Function</i><div class="sub-desc">A function to convert raw data values from a data block into the data
 * to be stored in the Field. The function is passed the collowing parameters:
 * <div class="mdetail-params"><ul>
 * <li><b>v</b> : Mixed<div class="sub-desc">The data value as read by the Reader, if undefined will use
 * the configured <tt>{@link Ext.data.Field#defaultValue defaultValue}</tt>.</div></li>
 * <li><b>rec</b> : Mixed<div class="sub-desc">The data object containing the row as read by the Reader.
 * Depending on the Reader type, this could be an Array ({@link Ext.data.ArrayReader ArrayReader}), an object
 * ({@link Ext.data.JsonReader JsonReader}), or an XML element ({@link Ext.data.XMLReader XMLReader}).</div></li>
 * </ul></div></div></li>
 * <li><code>sortType</code> : <i>Function</i> <div class="sub-desc">A function to convert the stored data into comparable form, as defined by {@link Ext.data.SortTypes}.</div></li>
 * <li><code>type</code> : <i>String</i> <div class="sub-desc">A textual data type name.</div></li>
 * </ul></div>
 * <p>For example, to create a VELatLong field (See the Microsoft Bing Mapping API) containing the latitude/longitude value of a datapoint on a map from a JsonReader data block
 * which contained the properties <code>lat</code> and <code>long</code>, you would define a new data type like this:</p>
 *<pre><code>
// Add a new Field data type which stores a VELatLong object in the Record.
Ext.data.Types.VELATLONG = {
    convert: function(v, data) {
        return new VELatLong(data.lat, data.long);
    },
    sortType: function(v) {
        return v.Latitude;  // When sorting, order by latitude
    },
    type: 'VELatLong'
};
</code></pre>
 * <p>Then, when declaring a Record, use <pre><code>
var types = Ext.data.Types; // allow shorthand type access
UnitRecord = Ext.data.Record.create([
    { name: 'unitName', mapping: 'UnitName' },
    { name: 'curSpeed', mapping: 'CurSpeed', type: types.INT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'position', type: types.VELATLONG }
]);
</code></pre>
 * @singleton
 */
Ext.data.Types = new function(){
    var st = Ext.data.SortTypes;
    Ext.apply(this, {
        /**
         * @type Regexp
         * @property stripRe
         * A regular expression for stripping non-numeric characters from a numeric value. Defaults to <tt>/[\$,%]/g</tt>.
         * This should be overridden for localization.
         */
        stripRe: /[\$,%]/g,
        
        /**
         * @type Object.
         * @property AUTO
         * This data type means that no conversion is applied to the raw data before it is placed into a Record.
         */
        AUTO: {
            convert: function(v){ return v; },
            sortType: st.none,
            type: 'auto'
        },

        /**
         * @type Object.
         * @property STRING
         * This data type means that the raw data is converted into a String before it is placed into a Record.
         */
        STRING: {
            convert: function(v){ return (v === undefined || v === null) ? '' : String(v); },
            sortType: st.asUCString,
            type: 'string'
        },

        /**
         * @type Object.
         * @property INT
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INTEGER</code> is equivalent.</p>
         */
        INT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
            },
            sortType: st.none,
            type: 'int'
        },
        
        /**
         * @type Object.
         * @property FLOAT
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>NUMBER</code> is equivalent.</p>
         */
        FLOAT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
            },
            sortType: st.none,
            type: 'float'
        },
        
        /**
         * @type Object.
         * @property BOOL
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOLEAN</code> is equivalent.</p>
         */
        BOOL: {
            convert: function(v){ return v === true || v === 'true' || v == 1; },
            sortType: st.none,
            type: 'bool'
        },
        
        /**
         * @type Object.
         * @property DATE
         * This data type means that the raw data is converted into a Date before it is placed into a Record.
         * The date format is specified in the constructor of the {@link Ext.data.Field} to which this type is
         * being applied.
         */
        DATE: {
            convert: function(v){
                var df = this.dateFormat;
                if(!v){
                    return null;
                }
                if(Ext.isDate(v)){
                    return v;
                }
                if(df){
                    if(df == 'timestamp'){
                        return new Date(v*1000);
                    }
                    if(df == 'time'){
                        return new Date(parseInt(v, 10));
                    }
                    return Date.parseDate(v, df);
                }
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: st.asDate,
            type: 'date'
        }
    });
    
    Ext.apply(this, {
        /**
         * @type Object.
         * @property BOOLEAN
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOL</code> is equivalent.</p>
         */
        BOOLEAN: this.BOOL,
        /**
         * @type Object.
         * @property INTEGER
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INT</code> is equivalent.</p>
         */
        INTEGER: this.INT,
        /**
         * @type Object.
         * @property NUMBER
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>FLOAT</code> is equivalent.</p>
         */
        NUMBER: this.FLOAT    
    });
};