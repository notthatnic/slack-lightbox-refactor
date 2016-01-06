/**
 * Utilities module
 */


(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Utilities = factory();
  }

}(this, function () {

  /**
   * bind event utility
   * @param {element} element DOM element to which to bind the event
   * @param {event} event event to listen for
   * @param {function} callback function to be executed on event
   */
  var bind = function(element, event, callback) {
    element.addEventListener(event, callback, false);
  };

  /**
   * unbind event utility (private)
   * @param {element} element DOM element from which to unbind the event
   * @param {event} event event to listen for
   * @param {function} callback function to be executed on event
   */
  var unbind = function(element, event, callback) {
    element.removeEventListener(event, callback, false);
  };

  /**
   * prevent default action utility
   * @param {event} event event to listen for
   */
  var preventDefaultEvent = function(event) {
    event.preventDefault();
  };

  // return object
  return {
    bind: bind,
    unbind: unbind,
    preventDefaultEvent: preventDefaultEvent
  };

}));