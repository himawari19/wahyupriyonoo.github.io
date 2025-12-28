/**
 * Browser Compatibility Polyfills & Fallbacks
 * Ensures modern features work in older browsers
 */

(function() {
  'use strict';

  // 1. IntersectionObserver Polyfill (IE 11, older Safari)
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = function(callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.elements = [];
    };

    window.IntersectionObserver.prototype.observe = function(element) {
      this.elements.push(element);
      // Fallback: immediately trigger callback for observed elements
      var entry = {
        target: element,
        isIntersecting: true,
        intersectionRatio: 1
      };
      this.callback([entry]);
    };

    window.IntersectionObserver.prototype.unobserve = function(element) {
      this.elements = this.elements.filter(function(el) {
        return el !== element;
      });
    };

    window.IntersectionObserver.prototype.disconnect = function() {
      this.elements = [];
    };
  }

  // 2. Element.closest() Polyfill (IE 11)
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // 3. Element.matches() Polyfill (IE 11)
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  // 4. Fetch API Polyfill (IE 11)
  if (!window.fetch) {
    window.fetch = function(url, options) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var method = (options && options.method) || 'GET';
        
        xhr.open(method, url);
        
        if (options && options.headers) {
          Object.keys(options.headers).forEach(function(key) {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }

        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              status: xhr.status,
              statusText: xhr.statusText,
              json: function() {
                return Promise.resolve(JSON.parse(xhr.responseText));
              },
              text: function() {
                return Promise.resolve(xhr.responseText);
              }
            });
          } else {
            reject(new Error(xhr.statusText));
          }
        };

        xhr.onerror = function() {
          reject(new Error('Network error'));
        };

        xhr.send(options && options.body);
      });
    };
  }

  // 5. Promise Polyfill (IE 11)
  if (!window.Promise) {
    window.Promise = function(executor) {
      var self = this;
      this.state = 'pending';
      this.value = undefined;
      this.reason = undefined;
      this.onFulfilled = [];
      this.onRejected = [];

      function resolve(value) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = value;
          self.onFulfilled.forEach(function(fn) { fn(value); });
        }
      }

      function reject(reason) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.reason = reason;
          self.onRejected.forEach(function(fn) { fn(reason); });
        }
      }

      try {
        executor(resolve, reject);
      } catch (e) {
        reject(e);
      }
    };

    window.Promise.prototype.then = function(onFulfilled, onRejected) {
      var self = this;
      return new Promise(function(resolve, reject) {
        function handleFulfilled(value) {
          try {
            var result = onFulfilled ? onFulfilled(value) : value;
            resolve(result);
          } catch (e) {
            reject(e);
          }
        }

        function handleRejected(reason) {
          try {
            var result = onRejected ? onRejected(reason) : Promise.reject(reason);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        }

        if (self.state === 'fulfilled') {
          handleFulfilled(self.value);
        } else if (self.state === 'rejected') {
          handleRejected(self.reason);
        } else {
          self.onFulfilled.push(handleFulfilled);
          self.onRejected.push(handleRejected);
        }
      });
    };

    window.Promise.prototype.catch = function(onRejected) {
      return this.then(undefined, onRejected);
    };
  }

  // 6. Array.prototype.find() Polyfill (IE 11)
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError(predicate + ' is not a function');
      }
      var list = Object(this);
      var length = parseInt(list.length) || 0;
      var thisArg = arguments[1];
      for (var i = 0; i < length; i++) {
        var value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }

  // 7. Array.prototype.forEach() Polyfill (IE 8)
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
      if (this == null) {
        throw new TypeError('Array.prototype.forEach called on null or undefined');
      }
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      for (var i = 0; i < len; i++) {
        if (i in O) {
          callback.call(thisArg, O[i], i, O);
        }
      }
    };
  }

  // 8. Object.keys() Polyfill (IE 8)
  if (!Object.keys) {
    Object.keys = function(obj) {
      var keys = [];
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          keys.push(i);
        }
      }
      return keys;
    };
  }

  // 9. String.prototype.includes() Polyfill (IE 11)
  if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
      return this.indexOf(search, start) !== -1;
    };
  }

  // 10. CSS Custom Properties Fallback (IE 11)
  if (!window.CSS || !window.CSS.supports || !window.CSS.supports('--test', '0')) {
    // Fallback for CSS variables - set default vh value
    var setVh = function() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    };
    setVh();
    window.addEventListener('resize', setVh);
  }

  // 11. window.scrollTo() smooth behavior Polyfill (IE 11, older Safari)
  if (!('scrollBehavior' in document.documentElement.style)) {
    var smoothScroll = function(element, to, duration) {
      if (duration <= 0) return;
      var difference = to - element.scrollTop;
      var perTick = difference / duration * 10;
      setTimeout(function() {
        element.scrollTop += perTick;
        if (element.scrollTop === to) return;
        smoothScroll(element, to, duration - 10);
      }, 10);
    };

    window.scrollTo = (function(original) {
      return function(x, y) {
        if (typeof x === 'object' && x.behavior === 'smooth') {
          smoothScroll(window, x.top || 0, 300);
        } else {
          original.call(window, x, y);
        }
      };
    })(window.scrollTo);
  }

  // 12. URL API Polyfill (IE 11)
  if (!window.URL) {
    window.URL = function(url) {
      var a = document.createElement('a');
      a.href = url;
      this.href = a.href;
      this.hostname = a.hostname;
      this.pathname = a.pathname;
      this.search = a.search;
      this.hash = a.hash;
      this.protocol = a.protocol;
      
      // Parse search params
      this.searchParams = {
        get: function(key) {
          var params = new URLSearchParams(a.search);
          return params.get(key);
        }
      };
    };

    // URLSearchParams Polyfill
    if (!window.URLSearchParams) {
      window.URLSearchParams = function(search) {
        this.params = {};
        if (search) {
          search.replace(/[?&]+([^=&]+)=?([^&]*)/gi, function(m, key, value) {
            this.params[key] = value;
          }.bind(this));
        }
      };

      window.URLSearchParams.prototype.get = function(key) {
        return this.params[key] || null;
      };
    }
  }

})();
