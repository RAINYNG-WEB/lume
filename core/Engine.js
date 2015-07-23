/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

/* Modified work copyright © 2015 David Valdman */

define(function(require, exports, module) {

    /**
     * The singleton object initiated upon process
     *   startup which manages all active Context instances, runs
     *   the render dispatch loop, and acts as a listener and dispatcher
     *   for events.  All methods are therefore static.
     *
     *   On static initialization, window.requestAnimationFrame is called with
     *     the event loop function.
     *
     *   Note: Any window in which Engine runs will prevent default
     *     scrolling behavior on the 'touchmove' event.
     *
     * @static
     * @class Engine
     */
    var Context = require('./Context');
    var EventHandler = require('./EventHandler');
    var OptionsManager = require('./OptionsManager');
    var Clock = require('famous/core/Clock');
    var ResizeStream = require('famous/streams/ResizeStream');

    var dirtyObjects = require('famous/core/dirtyObjects');
    var nextTickQueue = require('./queues/nextTickQueue');
    var dirtyQueue = require('./queues/dirtyQueue');
    var postTickQueue = require('./queues/postTickQueue');
    var State = require('famous/core/SUE');
    var tickQueue = require('./queues/tickQueue');
    var Stream = require('famous/streams/Stream');

    var Engine = {};

    var contexts = [];
    var rafId;
    var eventForwarders = {};
    var eventHandler = new EventHandler();
    var dirty = false;
    var dirtyLock = 0;
    var listenOnTick = false;
    var size = new EventHandler();

    var options = {
        containerType: 'div',
        containerClass: 'famous-context',
        appMode: true
    };
    var optionsManager = new OptionsManager(options);

    /**
     * Inside requestAnimationFrame loop, step() is called, which:
     *   calculates current FPS (throttling loop if it is over limit set in setFPSCap),
     *   emits dataless 'prerender' event on start of loop,
     *   calls in order any one-shot functions registered by nextTick on last loop,
     *   calls Context.update on all Context objects registered,
     *   and emits dataless 'postrender' event on end of loop.
     *
     * @static
     * @private
     * @method step
     */

    Engine.step = function step() {
        // browser events and their handlers happen before rendering begins
        while (nextTickQueue.length) {
            (nextTickQueue.shift())();
        }

        // tick signals base event flow coming in
        State.set(State.STATES.UPDATE);

        if (listenOnTick) eventHandler.emit('tick');
        
        for (var i = 0; i < tickQueue.length; i++) tickQueue[i]();

        // post tick is for resolving larger components from their incoming signals
        while (postTickQueue.length) (postTickQueue.shift())();

        State.set(State.STATES.END);

        for (var i = 0; i < contexts.length; i++) contexts[i].commit();

        while (dirtyQueue.length) (dirtyQueue.shift())();

        State.set(State.STATES.START);
    };

    nextTickQueue.push(function(){
        eventHandler.emit('dirty');
    });

    dirtyQueue.push(function(){
        eventHandler.emit('clean');
    });

    function start(){
        nextTickQueue.push(function start(){
            handleResize();
            for (var i = 0; i < contexts.length; i++){
                contexts[i].trigger('start');

                dirtyQueue.push(
                    function contextMountClean(i){
                        contexts[i].trigger('end');
                    }.bind(null,i)
                );
            }
        });
    }

    // engage requestAnimationFrame
    function loop() {
        //TODO: this dirty check should be unecessary
        if (dirty) {
            Engine.step();
            rafId = window.requestAnimationFrame(loop);
        }
    }
    window.requestAnimationFrame(start);
    rafId = window.requestAnimationFrame(loop);

    function handleResize() {
        var windowSize = [window.innerWidth, window.innerHeight];
        size.emit('resize', windowSize);
        eventHandler.emit('resize', windowSize);

        eventHandler.trigger('dirty');
        dirtyQueue.push(function engineResizeClean(){
            eventHandler.trigger('clean');
        });
    }
    window.addEventListener('resize', handleResize, false);
    window.addEventListener('touchmove', function(event) { event.preventDefault(); }, true);

    //TODO: add this only for app-mode
    document.body.classList.add('famous-root');

    /**
     * Bind a callback function to an event type handled by this object.
     *
     * @static
     * @method "on"
     *
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     * @return {EventHandler} this
     */
    EventHandler.setInputHandler(Engine, eventHandler);
    EventHandler.setOutputHandler(Engine, eventHandler);

    Engine.on = function engineOn(type, handler){
        if (type === 'tick') listenOnTick = true;
        if (!(type in eventForwarders)) {
            eventForwarders[type] = eventHandler.emit.bind(eventHandler, type);
            document.addEventListener(type, eventForwarders[type]);
        }
        return eventHandler.on(type, handler);
    };

    Engine.off = function engineOff (type, handler){
        if (type === 'tick') listenOnTick = false;
        if (!(type in eventForwarders)) {
            document.removeEventListener(type, eventForwarders[type]);
        }
        eventHandler.off(type, handler);
    };

    eventHandler.on('dirty', function engineDirty(){
        if (!dirty) {
            dirty = true;
            rafId = window.requestAnimationFrame(loop);
        }
        dirtyLock++;
    });

    eventHandler.on('clean', function engineClean(){
        dirtyLock--;
        if (dirty && dirtyLock === 0) {
            dirty = false;
            window.cancelAnimationFrame(rafId);
        }
    });

    /**
     * Return engine options.
     *
     * @static
     * @method getOptions
     * @param {string} key
     * @return {Object} engine options
     */
    Engine.getOptions = function getOptions(key) {
        return optionsManager.getOptions(key);
    };

    /**
     * Set engine options
     *
     * @static
     * @method setOptions
     *
     * @param {Object} [options] overrides of default options
     * @param {Number} [options.fpsCap]  maximum fps at which the system should run
     * @param {boolean} [options.runLoop=true] whether the run loop should continue
     * @param {string} [options.containerType="div"] type of container element.  Defaults to 'div'.
     * @param {string} [options.containerClass="famous-container"] type of container element.  Defaults to 'famous-container'.
     */
    Engine.setOptions = function setOptions(options) {
        return optionsManager.setOptions.apply(optionsManager, arguments);
    };

    /**
     * Creates a new Context for rendering and event handling with
     *    provided document element as top of each tree. This will be tracked by the
     *    process-wide Engine.
     *
     * @static
     * @method createContext
     *
     * @param {Node} el will be top of Famo.us document element tree
     * @return {Context} new Context within el
     */
    Engine.createContext = function createContext(el) {
        var needMountContainer = (el === undefined);
        if (needMountContainer) el = document.createElement(options.containerType);

        el.classList.add(options.containerClass);

        var context = new Context(el);
        Engine.registerContext(context);
        
        if (needMountContainer) document.body.appendChild(el);
        return context;
    };

    /**
     * Registers an existing context to be updated within the run loop.
     *
     * @static
     * @method registerContext
     *
     * @param {Context} context Context to register
     * @return {FamousContext} provided context
     */
    Engine.registerContext = function registerContext(context) {
        context.size.subscribe(size);
        contexts.push(context);
        return context;
    };

    /**
     * Removes a context from the run loop. Note: this does not do any
     *     cleanup.
     *
     * @static
     * @method deregisterContext
     *
     * @param {Context} context Context to deregister
     */
    Engine.deregisterContext = function deregisterContext(context) {
        var i = contexts.indexOf(context);
        context.size.unsubscribe(size);
        if (i >= 0) contexts.splice(i, 1);
    };

    /**
     * Returns a list of all contexts.
     *
     * @static
     * @method getContexts
     * @return {Array} contexts that are updated on each tick
     */
    Engine.getContexts = function getContexts() {
        return contexts;
    };

    Engine.subscribe(Clock);
    Engine.subscribe(dirtyObjects);

    module.exports = Engine;
});
