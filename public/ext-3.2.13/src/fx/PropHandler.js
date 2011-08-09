/**
 * @class Ext.fx.PropHandler
 * @ignore
 */
Ext.define('Ext.fx.PropHandler', {

    /* Begin Definitions */

    requires: ['Ext.draw.Draw'],

    statics: {
        defaultHandler: {
            unitRE: /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/,

            computeDelta: function(from, end, damper, initial) {
                damper = (typeof damper == 'number') ? damper : 1;
                var match = this.unitRE.exec(from),
                    start,
                    units;
                if (match) {
                    from = match[1];
                    units = match[2];
                }
                from = +from || 0;

                match = this.unitRE.exec(end);
                if (match) {
                    end = match[1];
                    units = match[2] || units;
                }
                end = +end || 0;
                start = (initial != null) ? initial : from;
                return {
                    from: from,
                    delta: (end - start) * damper,
                    units: units
                };
            },

            get: function(from, end, damper, initialFrom) {
                var i,
                    initial,
                    ln = from.length,
                    out = [];
                for (i = 0; i < ln; i++) {
                    if (initialFrom) {
                        initial = initialFrom[i][1].from;
                    }
                    if (Ext.isArray(from[i][1]) && Ext.isArray(end)) {
                        var res = [];
                        for (var j = 0, len = from[i][1].length; j < len; j++) {
                            res.push(this.computeDelta(from[i][1][j], end[j], damper, initial));
                        }
                        out.push([from[i][0], res]);
                    } else {
                        out.push([from[i][0], this.computeDelta(from[i][1], end, damper, initial)]);
                    }
                }
                return out;
            },

            set: function(values, easing) {
                var i,
                    ln = values.length,
                    out = [],
                    val;
                for (i = 0; i < ln; i++) {
                    val  = values[i][1];
                    if (Ext.isArray(val)) {
                        var res = [];
                        for (var j = 0, len = val.length; j < len; j++) {
                            res.push(val[j].from + (val[j].delta * easing) + (val[j].units || 0));
                        }
                        out.push([values[i][0], res]);
                    } else {
                        out.push([values[i][0], val.from + (val.delta * easing) + (val.units || 0)]);
                    }
                }
                return out;
            }
        },
        color: {
            rgbRE: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
            hexRE: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
            hex3RE: /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i,

            parseColor : function(color, damper) {
                damper = (typeof damper == 'number') ? damper : 1;
                var base,
                    out = false,
                    match;

                Ext.each([this.hexRE, this.rgbRE, this.hex3RE], function(re, idx) {
                    base = (idx % 2 == 0) ? 16 : 10;
                    match = re.exec(color);
                    if (match && match.length == 4) {
                        if (idx == 2) {
                            match[1] += match[1];
                            match[2] += match[2];
                            match[3] += match[3];
                        }
                        out = {
                            red: parseInt(match[1], base),
                            green: parseInt(match[2], base),
                            blue: parseInt(match[3], base)
                        };
                        return false;
                    }
                });
                return out || color;
            },

            computeDelta: function(from, end, damper, initial) {
                from = this.parseColor(from);
                end = this.parseColor(end, damper);
                var start = initial ? initial : from,
                    tfrom = typeof start,
                    tend = typeof end;
                //Extra check for when the color string is not recognized.
                if (tfrom == 'string' ||  tfrom == 'undefined' 
                  || tend == 'string' || tend == 'undefined') {
                    return end || start;
                }
                return {
                    from:  from,
                    delta: {
                        red: Math.round((end.red - start.red) * damper),
                        green: Math.round((end.green - start.green) * damper),
                        blue: Math.round((end.blue - start.blue) * damper)
                    }
                };
            },

            get: function(start, end, damper, initialFrom) {
                var ln = start.length,
                    out = [],
                    i, initial;
                for (i = 0; i < ln; i++) {
                    if (initialFrom) {
                        initial = initialFrom[i][1].from;
                    }
                    out.push([start[i][0], this.computeDelta(start[i][1], end, damper, initial)]);
                }
                return out;
            },

            set: function(values, easing) {
                var ln = values.length,
                    out = [],
                    i, val, parsedString, from, delta;
                for (i = 0; i < ln; i++) {
                    val = values[i][1];
                    from = val.from;
                    delta = val.delta;
                    //multiple checks to reformat the color if it can't recognized by computeDelta.
                    val = (typeof val == 'object' && 'red' in val)? 
                            'rgb(' + val.red + ', ' + val.green + ', ' + val.blue + ')' : val;
                    val = (typeof val == 'object' && val.length)? val[0] : val;
                    if (typeof val == 'undefined') {
                        return [];
                    }
                    parsedString = typeof val == 'string'? val :
                        'rgb(' + [
                              (from.red + Math.round(delta.red * easing)) % 256,
                              (from.green + Math.round(delta.green * easing)) % 256,
                              (from.blue + Math.round(delta.blue * easing)) % 256
                          ].join(',') + ')';
                    out.push([
                        values[i][0],
                        parsedString
                    ]);
                }
                return out;
            }
        },
        object: {
            interpolate: function(prop, damper) {
                damper = (typeof damper == 'number') ? damper : 1;
                var out = {};
                for(var p in prop) {
                    out[p] = parseInt(prop[p], 10) * damper;
                }
                return out;
            },

            computeDelta: function(from, end, damper, initial) {
                from = this.interpolate(from);
                end = this.interpolate(end, damper);
                var start = initial ? initial : from,
                    delta = {};

                for(var p in end) {
                    delta[p] = end[p] - start[p];
                }
                return {
                    from:  from,
                    delta: delta
                };
            },

            get: function(start, end, damper, initialFrom) {
                var i,
                    initial,
                    ln = start.length,
                    out = [];
                for (i = 0; i < ln; i++) {
                    if (initialFrom) {
                        initial = initialFrom[i][1].from;
                    }
                    out.push([start[i][0], this.computeDelta(start[i][1], end, damper, initial)]);
                }
                return out;
            },

            set: function(values, easing) {
                var i,
                    ln = values.length,
                    out = [],
                    outObject = {},
                    from, delta, val;
                for (i = 0; i < ln; i++) {
                    val  = values[i][1];
                    from = val.from;
                    delta = val.delta;
                    for(var p in from) {
                        outObject[p] = Math.round(from[p] + delta[p] * easing);
                    }
                    out.push([
                        values[i][0],
                        outObject
                    ]);
                }
                return out;
            }
        },

        path: {
            computeDelta: function(from, end, damper, initial) {
                damper = (typeof damper == 'number') ? damper : 1;
                var start;
                from = +from || 0;
                end = +end || 0;
                start = (initial != null) ? initial : from;
                return {
                    from: from,
                    delta: (end - start) * damper
                };
            },

            forcePath: function(path) {
                if (!Ext.isArray(path) && !Ext.isArray(path[0])) {
                    path = Ext.draw.Draw.parsePathString(path);
                }
                return path;
            },

            get: function(start, end, damper, initialFrom) {
                var i,
                    j,
                    k,
                    path,
                    startPath,
                    endPath = this.forcePath(end),
                    deltaPath,
                    initial,
                    out = [],
                    startLn = start.length,
                    startPathLn,
                    pointsLn;
                for (i = 0; i < startLn; i++) {
                    startPath = this.forcePath(start[i][1]);

                    deltaPath = Ext.draw.Draw.interpolatePaths(startPath, endPath);
                    startPath = deltaPath[0];
                    endPath = deltaPath[1];

                    startPathLn = startPath.length;
                    path = [];
                    for (j = 0; j < startPathLn; j++) {
                        deltaPath = [startPath[j][0]];
                        pointsLn = startPath[j].length;
                        for (k = 1; k < pointsLn; k++) {
                            initial = initialFrom && initialFrom[0][1][j][k].from;
                            deltaPath.push(this.computeDelta(startPath[j][k], endPath[j][k], damper, initial));
                        }
                        path.push(deltaPath);
                    }
                    out.push([start[i][0], path]);
                }
                return out;
            },

            set: function(values, easing) {
                var i,
                    j,
                    k,
                    newPath,
                    calcPath,
                    deltaPath,
                    deltaPathLn,
                    pointsLn,
                    ln = values.length,
                    out = [];
                for (i = 0; i < ln; i++) {
                    deltaPath = values[i][1];
                    newPath = [];
                    deltaPathLn = deltaPath.length;
                    for (j = 0; j < deltaPathLn; j++) {
                        calcPath = [deltaPath[j][0]];
                        pointsLn = deltaPath[j].length;
                        for (k = 1; k < pointsLn; k++) {
                            calcPath.push(deltaPath[j][k].from + deltaPath[j][k].delta * easing);
                        }
                        newPath.push(calcPath.join(','));
                    }
                    out.push([values[i][0], newPath.join(',')]);
                }
                return out;
            }
        }
        /* End Definitions */
    }
}, function() {
    Ext.each([
        'outlineColor',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor', 
        'borderBottomColor', 
        'borderLeftColor',
        'fill',
        'stroke'
    ], function(prop) {
        this[prop] = this.color;
    }, this);
});