/* global NodeList */
//Helpers for a querySelector
var qs = function (selector, scope) {
  //If scope is null, then return document
  return (scope || document).querySelector(selector);
}
module.exports.qs = qs;

var qsa = function (selector, scope) {
  return (scope || document).querySelectorAll(selector);
}
module.exports.qsa = qsa;

//Adding event listeners
var $on = function (target, type, callback, useCapture) {
  target.addEventListener(type, callback, !!useCapture);
}
module.exports.$on = $on;

// Attach a handler to event for all elements that match the selector,
// now or in the future, based on a root element
var $delegate = function (target, selector, type, handler) {
  function dispatchEvent(event) {
    var targetElement = event.target;
    var potentialElements = qsa(selector, target);
    var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

    if(hasMatch) {
      handler.call(targetElement, event);
    }
  }
  var useCapture = type === 'blur' || type === 'focus';

  $on(target, type, dispatchEvent, useCapture);
}

module.exports.$delegate = $delegate;

// Find the element's parent with the given tag name:
// $parent(qs('a'), 'div');
var $parent = function (element, tagName) {
  if (!element.parentNode) {
    return;
  }
  if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
    return element.parentNode;
  }
  return $parent(element.parentNode, tagName);
}

module.exports.$parent = $parent;

// Allow for looping on nodes by chaining:
// qsa('.foo').forEach(function () {})
// Is this overriden in this conext?
NodeList.prototype.forEach = Array.prototype.forEach;