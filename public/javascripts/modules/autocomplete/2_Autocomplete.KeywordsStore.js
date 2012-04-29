Ext.ns('Dbms.Autocomplete');
/*
 * @class Dbms.Autocomplete.KeywordsStore
 * This is a storage for all keywords, you will see
 * in the typeahead
 **/
Dbms.Autocomplete.KeywordsStore = Ext.extend(Ext.data.JsonStore, {
    /*
     * @constructor
     * starts ajax to get keywords list
     */
    constructor: function(databaseName) {
        Dbms.Autocomplete.KeywordsStore.superclass.constructor.call(this, {
            storeId: 'Autocomplete.KeywordsStore',
            dbName: databaseName,
            root: 'rows',
            fields: ['name', 'weight', 'help_category_id'],
            proxy: new Ext.data.HttpProxy({
                url: Dbms.Actions.autocomplete.full.replace('{database_name}', databaseName),
                method: "POST"
            }),
            autoLoad: true
        });

        this.on('load', this.prepareData, this);
    },
    /*
     * function fires after keywords were fetched from the server
     * performs sorting all items in required order
     *
     * @returns {void}
     */
    prepareData: function() {
        this.singleSort('weight', 'DESC');
        Dbms.Core.MessageBus.fireEvent('Dbms.Autocomplete.refresh' + this.dbName);
    },
    /*
     * returns all keywords in a form of list
     * @returns {Array} list of keywords
     */
    list: function() {
        var list = []

        Ext.each(this.data.items, function(item, idx) {
            list.push(item.data);
        }, this);

        return list;
    }
});