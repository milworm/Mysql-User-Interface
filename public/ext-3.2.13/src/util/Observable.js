/**
 * @class Ext.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(this, config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */

Ext.define('Ext.util.Observable', {

    /* Begin Definitions */

    requires: ['Ext.util.Event'],

    statics: {
        /**
         * Removes <b>all</b> added captures from the Observable.
         * @param {Observable} o The Observable to release
         * @static
         */
        releaseCapture: function(o) {
            o.fireEvent = this.prototype.fireEvent;
        },

        /**
         * Starts capture on the specified Observable. All events will be passed
         * to the supplied function with the event name + standard signature of the event
         * <b>before</b> the event is fired. If the supplied function returns false,
         * the event will not fire.
         * @param {Observable} o The Observable to capture events from.
         * @param {Function} fn The function to call when an event is fired.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Observable firing the event.
         * @static
         */
        capture: function(o, fn, scope) {
            o.fireEvent = Ext.Function.createInterceptor(o.fireEvent, fn, scope);
        },

        /**
Sets observability on the passed class constructor.

This makes any event fired on any instance of the passed class also fire a single event through
the __class__ allowing for central handling of events on many instances at once.

Usage:

    Ext.util.Observable.observe(Ext.data.Connection);
    Ext.data.Connection.on('beforerequest', function(con, options) {
        console.log('Ajax request made to ' + options.url);
    });

         * @param {Function} c The class constructor to make observable.
         * @param {Object} listeners An object containing a series of listeners to add. See {@link #addListener}.
         * @static
         * @markdown
         */
        observe: function(cls, listeners) {
            if (cls) {
                if (!cls.isObservable) {
                    Ext.applyIf(cls, new this());
                    this.capture(cls.prototype, cls.fireEvent, cls);
                }
                if (Ext.isObject(listeners)) {
                    cls.on(listeners);
                }
                return cls;
            }
        }
    },

    /* End Definitions */

    /**
    * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
    * object during initialization.  This should be a valid listeners config object as specified in the
    * {@link #addListener} example for attaching multiple handlers at once.</p>
    * <br><p><b><u>DOM events from ExtJs {@link Ext.Component Components}</u></b></p>
    * <br><p>While <i>some</i> ExtJs Component classes export selected DOM events (e.g. "click", "mouseover" etc), this
    * is usually only done when extra value can be added. For example the {@link Ext.DataView DataView}'s
    * <b><code>{@link Ext.DataView#click click}</code></b> event passing the node clicked on. To access DOM
    * events directly from a child element of a Component, we need to specify the <code>element</code> option to
    * identify the Component property to add a DOM listener to:
    * <pre><code>
new Ext.Panel({
    width: 400,
    height: 200,
    dockedItems: [{
        xtype: 'toolbar'
    }],
    listeners: {
        click: {
            element: 'el', //bind to the underlying el property on the panel
            fn: function(){ console.log('click el'); }
        },
        dblclick: {
            element: 'body', //bind to the underlying body property on the panel
            fn: function(){ console.log('dblclick body'); }
        }
    }
});
</code></pre>
    * </p>
    */
    // @private
    isObservable: true,

    constructor: function(config) {
        var me = this;

        Ext.apply(me, config);
        if (me.listeners) {
            me.on(me.listeners);
            delete me.listeners;
        }
        me.events = me.events || {};

        if (me.bubbleEvents) {
            me.enableBubble(me.bubbleEvents);
        }
    },

    // @private
    eventOptionsRe : /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|element|vertical|horizontal)$/,

    /**
     * <p>Adds listeners to any Observable object (or Element) which are automatically removed when this Component
     * is destroyed.
     * @param {Observable|Element} item The item to which to add a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     * @param {Object} opt Optional. If the <code>ename</code> parameter was an event name, this
     * is the {@link Ext.util.Observable#addListener addListener} options.
     */
    addManagedListener : function(item, ename, fn, scope, options) {
        var me = this,
            managedListeners = me.managedListeners = me.managedListeners || [],
            config;

        if (Ext.isObject(ename)) {
            options = ename;
            for (ename in options) {
                if (options.hasOwnProperty(ename)) {
                    config = options[ename];
                    if (!me.eventOptionsRe.test(ename)) {
                        me.addManagedListener(item, ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
                    }
                }
            }
        }
        else {
            managedListeners.push({
                item: item,
                ename: ename,
                fn: fn,
                scope: scope,
                options: options
            });

            item.on(ename, fn, scope, options);
        }
    },

    /**
     * Removes listeners that were added by the {@link #mon} method.
     * @param {Observable|Element} item The item from which to remove a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     */
     removeManagedListener : function(item, ename, fn, scope) {
        var me = this,
            options,
            config,
            managedListeners,
            managedListener,
            length,
            i;

        if (Ext.isObject(ename)) {
            options = ename;
            for (ename in options) {
                if (options.hasOwnProperty(ename)) {
                    config = options[ename];
                    if (!me.eventOptionsRe.test(ename)) {
                        me.removeManagedListener(item, ename, config.fn || config, config.scope || options.scope);
                    }
                }
            }
        }

        managedListeners = me.managedListeners ? me.managedListeners.slice() : [];
        length = managedListeners.length;

        for (i = 0; i < length; i++) {
            managedListener = managedListeners[i];
            if (managedListener.item === item && managedListener.ename === ename && (!fn || managedListener.fn === fn) && (!scope || managedListener.scope === scope)) {
                Ext.Array.remove(me.managedListeners, managedListener);
                item.un(managedListener.ename, managedListener.fn, managedListener.scope);
            }
        }
    },

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link Ext.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent: function() {
        var me = this,
            args = Ext.Array.toArray(arguments),
            ename = args[0].toLowerCase(),
            ret = true,
            event = me.events[ename],
            queue = me.eventQueue,
            parent;

        if (me.eventsSuspended === true) {
            if (queue) {
                queue.push(args);
            }
            return false;
        } else if (event && Ext.isObject(event) && event.bubble) {
            if (event.fire.apply(event, args.slice(1)) === false) {
                return false;
            }
            parent = me.getBubbleTarget && me.getBubbleTarget();
            if (parent && parent.isObservable) {
                if (!parent.events[ename] || !Ext.isObject(parent.events[ename]) || !parent.events[ename].bubble) {
                    parent.enableBubble(ename);
                }
                return parent.fireEvent.apply(parent, args);
            }
        } else if (event && Ext.isObject(event)) {
            args.shift();
            ret = event.fire.apply(event, args);
        }
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for. May also be an object who's property names are event names. See
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * <li><b>element</b> : String<div class="sub-desc"><b>This option is only valid for listeners bound to {@link Ext.Component Components}.</b>
     * The name of a Component property which references an element to add a listener to.
     * <p>This option is useful during Component construction to add DOM event listeners to elements of {@link Ext.Component Components} which
     * will exist only after the Component is rendered. For example, to add a click listener to a Panel's body:<pre><code>
new Ext.Panel({
    title: 'The title',
    listeners: {
        click: this.handlePanelClick,
        element: 'body'
    }
});
</code></pre></p>
     * <p>When added in this way, the options available are the options applicable to {@link Ext.core.Element#addListener}</p></div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myPanel.on('hide', this.handleClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple events. For example:<pre><code>
myGridPanel.on({
    cellClick: this.onCellClick,
    mouseover: this.onMouseOver,
    mouseout: this.onMouseOut,
    scope: this // Important. Ensure "this" is correct during handler execution
});
</code></pre>.
     * <p>
     */
    addListener: function(ename, fn, scope, options) {
        var me = this,
            config,
            event;

        if (Ext.isObject(ename)) {
            options = ename;
            for (ename in options) {
                if (options.hasOwnProperty(ename)) {
                    config = options[ename];
                    if (!me.eventOptionsRe.test(ename)) {
                        me.addListener(ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
                    }
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            me.events[ename] = me.events[ename] || true;
            event = me.events[ename] || true;
            if (Ext.isBoolean(event)) {
                me.events[ename] = event = new Ext.util.Event(me, ename);
            }
            event.addListener(fn, scope, Ext.isObject(options) ? options : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener: function(ename, fn, scope) {
        var me = this,
            config,
            event,
            options;

        if (Ext.isObject(ename)) {
            options = ename;
            for (ename in options) {
                if (options.hasOwnProperty(ename)) {
                    config = options[ename];
                    if (!me.eventOptionsRe.test(ename)) {
                        me.removeListener(ename, config.fn || config, config.scope || options.scope);
                    }
                }
            }
        } else {
            ename = ename.toLowerCase();
            event = me.events[ename];
            if (event.isEvent) {
                event.removeListener(fn, scope);
            }
        }
    },

    /**
     * Removes all listeners for this object including the managed listeners
     */
    clearListeners: function() {
        var events = this.events,
            event,
            key;

        for (key in events) {
            if (events.hasOwnProperty(key)) {
                event = events[key];
                if (event.isEvent) {
                    event.clearListeners();
                }
            }
        }

        this.clearManagedListeners();
    },

    //<debug>
    purgeListeners : function() {
        console.warn('Observable: purgeListeners has been deprecated. Please use clearListeners.');
        return this.clearListeners.apply(this, arguments);
    },
    //</debug>

    /**
     * Removes all managed listeners for this object.
     */
    clearManagedListeners : function() {
        var managedListeners = this.managedListeners || [],
            i = 0,
            len = managedListeners.length,
            managedListener;

        for (; i < len; i++) {
            managedListener = managedListeners[i];
            managedListener.item.un(managedListener.ename, managedListener.fn, managedListener.scope);
        }

        this.managedListener = [];
    },

    //<debug>
    purgeManagedListeners : function() {
        console.warn('Observable: purgeManagedListeners has been deprecated. Please use clearManagedListeners.');
        return this.clearManagedListeners.apply(this, arguments);
    },
    //</debug>

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object|String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {string} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents: function(o) {
        var me = this,
            args,
            len,
            i;
            
            me.events = me.events || {};
        if (Ext.isString(o)) {
            args = arguments;
            i = args.length;
            
            while (i--) {
                me.events[args[i]] = me.events[args[i]] || true;
            }
        } else {
            Ext.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener: function(ename) {
        var event = this.events[ename.toLowerCase()];
        return event && event.isEvent === true && event.listeners.length > 0;
    },

    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents: function(queueSuspended) {
        this.eventsSuspended = true;
        if (queueSuspended && !this.eventQueue) {
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the <code><b>queueSuspended</b></code> parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents: function() {
        var me = this,
            queued = me.eventQueue || [];

        me.eventsSuspended = false;
        delete me.eventQueue;

        Ext.each(queued,
        function(e) {
            me.fireEvent.apply(me, e);
        });
    },

    /**
     * Relays selected events from the specified Observable as if the events were fired by <code><b>this</b></code>.
     * @param {Object} origin The Observable whose events this object is to relay.
     * @param {Array} events Array of event names to relay.
     */
    relayEvents : function(origin, events, prefix) {
        prefix = prefix || '';
        var me = this,
            len = events.length,
            i = 0,
            oldName,
            newName;

        for(; i < len; i++){
            oldName = events[i].substr(prefix.length);
            newName = prefix + oldName;
            me.events[newName] = me.events[newName] || true;
            origin.on(oldName, me.createRelayer(newName));
        }
    },

    /**
     * @private
     * Creates an event handling function which refires the event from this object as the passed event name.
     * @param newName
     * @returns {Function}
     */
    createRelayer: function(newName){
        var me = this;
        return function(){
            return me.fireEvent.apply(me, [newName].concat(Array.prototype.slice.call(arguments, 0, -1)));
        };
    },

    /**
     * <p>Enables events fired by this Observable to bubble up an owner hierarchy by calling
     * <code>this.getBubbleTarget()</code> if present. There is no implementation in the Observable base class.</p>
     * <p>This is commonly used by Ext.Components to bubble events to owner Containers. See {@link Ext.Component.getBubbleTarget}. The default
     * implementation in Ext.Component returns the Component's immediate owner. But if a known target is required, this can be overridden to
     * access the required target more quickly.</p>
     * <p>Example:</p><pre><code>
Ext.override(Ext.form.Field, {
//  Add functionality to Field&#39;s initComponent to enable the change event to bubble
initComponent : Ext.Function.createSequence(Ext.form.Field.prototype.initComponent, function() {
    this.enableBubble('change');
}),

//  We know that we want Field&#39;s events to bubble directly to the FormPanel.
getBubbleTarget : function() {
    if (!this.formPanel) {
        this.formPanel = this.findParentByType('form');
    }
    return this.formPanel;
}
});

var myForm = new Ext.formPanel({
title: 'User Details',
items: [{
    ...
}],
listeners: {
    change: function() {
        // Title goes red if form has been modified.
        myForm.header.setStyle('color', 'red');
    }
}
});
</code></pre>
     * @param {String/Array} events The event name to bubble, or an Array of event names.
     */
    enableBubble: function(events) {
        var me = this;
        if (!Ext.isEmpty(events)) {
            events = Ext.isArray(events) ? events: Ext.Array.toArray(arguments);
            Ext.each(events,
            function(ename) {
                ename = ename.toLowerCase();
                var ce = me.events[ename] || true;
                if (Ext.isBoolean(ce)) {
                    ce = new Ext.util.Event(me, ename);
                    me.events[ename] = ce;
                }
                ce.bubble = true;
            });
        }
    }
}, function() {
    /**
     * Removes an event handler (shorthand for {@link #removeListener}.)
     * @param {String}   eventName     The type of event the handler was associated with.
     * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope         (optional) The scope originally specified for the handler.
     * @method un
     */

    /**
     * Appends an event handler to this object (shorthand for {@link #addListener}.)
     * @param {String}   eventName     The type of event to listen for
     * @param {Function} handler       The method the event invokes
     * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options       (optional) An object containing handler configuration.
     * @method on
     */

    this.createAlias({
        on: 'addListener',
        un: 'removeListener',
        mon: 'addManagedListener',
        mun: 'removeManagedListener'
    });

    //deprecated, will be removed in 5.0
    this.observeClass = this.observe;

    Ext.apply(Ext.util.Observable.prototype, function(){
        // this is considered experimental (along with beforeMethod, afterMethod, removeMethodListener?)
        // allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
        // private
        function getMethodEvent(method){
            var e = (this.methodEvents = this.methodEvents || {})[method],
                returnValue,
                v,
                cancel,
                obj = this;

            if (!e) {
                this.methodEvents[method] = e = {};
                e.originalFn = this[method];
                e.methodName = method;
                e.before = [];
                e.after = [];

                var makeCall = function(fn, scope, args){
                    if((v = fn.apply(scope || obj, args)) !== undefined){
                        if (typeof v == 'object') {
                            if(v.returnValue !== undefined){
                                returnValue = v.returnValue;
                            }else{
                                returnValue = v;
                            }
                            cancel = !!v.cancel;
                        }
                        else
                            if (v === false) {
                                cancel = true;
                            }
                            else {
                                returnValue = v;
                            }
                    }
                };

                this[method] = function(){
                    var args = Array.prototype.slice.call(arguments, 0),
                        b, i, len;
                    returnValue = v = undefined;
                    cancel = false;

                    for(i = 0, len = e.before.length; i < len; i++){
                        b = e.before[i];
                        makeCall(b.fn, b.scope, args);
                        if (cancel) {
                            return returnValue;
                        }
                    }

                    if((v = e.originalFn.apply(obj, args)) !== undefined){
                        returnValue = v;
                    }

                    for(i = 0, len = e.after.length; i < len; i++){
                        b = e.after[i];
                        makeCall(b.fn, b.scope, args);
                        if (cancel) {
                            return returnValue;
                        }
                    }
                    return returnValue;
                };
            }
            return e;
        }

        return {
            // these are considered experimental
            // allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
            // adds an 'interceptor' called before the original method
            beforeMethod : function(method, fn, scope){
                getMethodEvent.call(this, method).before.push({
                    fn: fn,
                    scope: scope
                });
            },

            // adds a 'sequence' called after the original method
            afterMethod : function(method, fn, scope){
                getMethodEvent.call(this, method).after.push({
                    fn: fn,
                    scope: scope
                });
            },

            removeMethodListener: function(method, fn, scope){
                var e = this.getMethodEvent(method),
                    i, len;
                for(i = 0, len = e.before.length; i < len; i++){
                    if(e.before[i].fn == fn && e.before[i].scope == scope){
                        e.before.splice(i, 1);
                        return;
                    }
                }
                for(i = 0, len = e.after.length; i < len; i++){
                    if(e.after[i].fn == fn && e.after[i].scope == scope){
                        e.after.splice(i, 1);
                        return;
                    }
                }
            },

            toggleEventLogging: function(toggle) {
                Ext.util.Observable[toggle ? 'capture' : 'releaseCapture'](this, function(en) {
                    console.log(en, arguments);
                });
            }
        };
    }());
});