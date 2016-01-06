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

  /**
   * create new element utility
   * @param {string} elementTag html tag name for element to create
   * @param {Array} classes array of classnames to add to new element
   * attached
   * @param {Array} attributes list of attributes to be added to the new
   * element; attributes should be arrays of {attributeName, value}
   */
  var createNewElement = function(elementTag, classes, attributes) {
    var $el;

    if(elementTag === 'img') {
      $el = new Image();
    } else {
      $el = document.createElement(elementTag);
    }

    classes.forEach(function(className){
      $el.classList.add(className);
    });

    if(attributes) {
      attributes.forEach(function(attribute){
        $el.setAttribute(attribute[0], attribute[1]);
      });
    }

    return $el;
  };

  // return object
  return {
    bind: bind,
    unbind: unbind,
    preventDefaultEvent: preventDefaultEvent,
    createNewElement: createNewElement
  };

}));