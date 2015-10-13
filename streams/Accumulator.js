/* Copyright © 2015 David Valdman */

define(function(require, exports, module){
    var Stream = require('samsara/streams/Stream');

    /**
     * Accumulator is a Stream that accumulates a value given by a
     *  number or array of numbers.
     *
     *  It emits `start`, `update` and `end` events.
     *
     *  @example
     *
     *      // this gives the total displacement of mouse input
     *      accumulator.subscribe(mouseInput.pluck('delta'));
     *
     *
     * @class Accumulator
     * @extends Streams.Stream
     * @namespace Streams
     * @constructor
     * @param [sum] {Number|Array}    Initial value
     */
    function Accumulator(sum){
        // TODO: is this state necessary?
        this.sum = sum || undefined;

        Stream.call(this, {
            start : function(){ return this.sum || 0; }.bind(this),
            update : function(){ return this.sum; }.bind(this),
            end : function(){ return this.sum || 0; }.bind(this)
        });

        this._eventInput.on('start', function(value){
            if (this.sum === undefined) {
                value = value || 0;
                if (value instanceof Array){
                    this.sum = [];
                    for (var i = 0; i < value.length; i++)
                        this.sum[i] = value[i];
                }
                else this.sum = value;
            }
        }.bind(this));

        this._eventInput.on('update', function(value){
            if (value instanceof Array){
                if (!this.sum) this.sum = [];
                for (var i = 0; i < value.length; i++)
                    this.sum[i] += value[i];
            }
            else this.sum += value;
        }.bind(this));
    }

    Accumulator.prototype = Object.create(Stream.prototype);
    Accumulator.prototype.constructor = Accumulator;

    /**
     * Returns current accumulated value.
     *
     * @method get
     * @return {Number}
     */
    Accumulator.prototype.get = function(){
        return this.sum;
    };

    module.exports = Accumulator;
});