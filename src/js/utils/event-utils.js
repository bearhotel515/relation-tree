
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 17 /*~ 1000/60*/);
    });
}


if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
    window.clearTimeout);
}


const utils = {};
utils.onMouse =null
utils.mouseListener = null

utils.captureMouse = function (element) {
  var mouse = { x: 0, y: 0, event: null },
    body_scrollLeft = document.body.scrollLeft,
    element_scrollLeft = document.documentElement.scrollLeft,
    body_scrollTop = document.body.scrollTop,
    element_scrollTop = document.documentElement.scrollTop,
    offsetLeft = element.offsetLeft,
    offsetTop = element.offsetTop;
  function onMouse(event) {
    var x, y;
    if (event.offsetX) {
      x = event.offsetX
      y = event.offsetY
    } else {
      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = event.clientX + body_scrollLeft + element_scrollLeft;
        y = event.clientY + body_scrollTop + element_scrollTop;
      }
      x -= offsetLeft;
      y -= offsetTop;
    }
    mouse.x = x;
    mouse.y = y;
    mouse.event = event;
    return;
  }

  utils.mouseListener = onMouse
  element.addEventListener('mousemove', utils.mouseListener, false);
  return mouse;

};
utils.removeCaptureMouse = function (element) {
  element.removeEventListener('mousemove', utils.mouseListener, false);
};

utils.captureTouch = function (element) {
  var touch = { x: null, y: null, isPressed: false, event: null },
    body_scrollLeft = document.body.scrollLeft,
    element_scrollLeft = document.documentElement.scrollLeft,
    body_scrollTop = document.body.scrollTop,
    element_scrollTop = document.documentElement.scrollTop,
    offsetLeft = element.offsetLeft,
    offsetTop = element.offsetTop;

  element.addEventListener('touchstart', function (event) {
    touch.isPressed = true;
    touch.event = event;
  }, false);

  element.addEventListener('touchend', function (event) {
    touch.isPressed = false;
    touch.x = null;
    touch.y = null;
    touch.event = event;
  }, false);

  element.addEventListener('touchmove', function (event) {
    var x, y,
      touch_event = event.touches[0]; 

    if (touch_event.pageX || touch_event.pageY) {
      x = touch_event.pageX;
      y = touch_event.pageY;
    } else {
      x = touch_event.clientX + body_scrollLeft + element_scrollLeft;
      y = touch_event.clientY + body_scrollTop + element_scrollTop;
    }
    x -= offsetLeft;
    y -= offsetTop;

    touch.x = x;
    touch.y = y;
    touch.event = event;
  }, false);

  return touch;
};

utils.listenerWindowResize = function (fun) {
  window.addEventListener('resize', fun, false);
}
utils.removeListenerWindowResize = function () {
  window.removeEventListener('resize', fun, false);
} 
export default utils
