/*  Prototype JavaScript framework, version 1.5.1.1
*  (c) 2005-2007 Sam Stephenson
*
*  Prototype is freely distributable under the terms of an MIT-style license.
*  For details, see the Prototype web site: http://www.prototypejs.org/
*/
/*--------------------------------------------------------------------------*/
var Prototype = {Version: '1.5.1.1',Browser: {IE:     !!(window.attachEvent && !window.opera),Opera:  !!window.opera,WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1
},BrowserFeatures: {XPath: !!document.evaluate,ElementExtensions: !!window.HTMLElement,SpecificElementExtensions:
(document.createElement('div').__proto__ !==
document.createElement('form').__proto__)
},ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,emptyFunction: function() { },K: function(x) { return x }
}
var Class = {create: function() {return function() {this.initialize.apply(this, arguments);}
}
}
var Abstract = new Object();Object.extend = function(destination, source) {for (var property in source) {destination[property] = source[property];}
return destination;}
Object.extend(Object, {inspect: function(object) {try {if (object === undefined) return 'undefined';if (object === null) return 'null';return object.inspect ? object.inspect() : object.toString();} catch (e) {if (e instanceof RangeError) return '...';throw e;}
},toJSON: function(object) {var type = typeof object;switch(type) {case 'undefined':
case 'function':
case 'unknown': return;case 'boolean': return object.toString();}
if (object === null) return 'null';if (object.toJSON) return object.toJSON();if (object.ownerDocument === document) return;var results = [];for (var property in object) {var value = Object.toJSON(object[property]);if (value !== undefined)
results.push(property.toJSON() + ': ' + value);}
return '{' + results.join(', ') + '}';},keys: function(object) {var keys = [];for (var property in object)
keys.push(property);return keys;},values: function(object) {var values = [];for (var property in object)
values.push(object[property]);return values;},clone: function(object) {return Object.extend({}, object);}
});Function.prototype.bind = function() {var __method = this, args = $A(arguments), object = args.shift();return function() {return __method.apply(object, args.concat($A(arguments)));}
}
Function.prototype.bindAsEventListener = function(object) {var __method = this, args = $A(arguments), object = args.shift();return function(event) {return __method.apply(object, [event || window.event].concat(args));}
}
Object.extend(Number.prototype, {toColorPart: function() {return this.toPaddedString(2, 16);},succ: function() {return this + 1;},times: function(iterator) {$R(0, this, true).each(iterator);return this;},toPaddedString: function(length, radix) {var string = this.toString(radix || 10);return '0'.times(length - string.length) + string;},toJSON: function() {return isFinite(this) ? this.toString() : 'null';}
});Date.prototype.toJSON = function() {return '"' + this.getFullYear() + '-' +
(this.getMonth() + 1).toPaddedString(2) + '-' +
this.getDate().toPaddedString(2) + 'T' +
this.getHours().toPaddedString(2) + ':' +
this.getMinutes().toPaddedString(2) + ':' +
this.getSeconds().toPaddedString(2) + '"';};var Try = {these: function() {var returnValue;for (var i = 0, length = arguments.length; i < length; i++) {var lambda = arguments[i];try {returnValue = lambda();break;} catch (e) {}
}
return returnValue;}
}
/*--------------------------------------------------------------------------*/
var PeriodicalExecuter = Class.create();PeriodicalExecuter.prototype = {initialize: function(callback, frequency) {this.callback = callback;this.frequency = frequency;this.currentlyExecuting = false;this.registerCallback();},registerCallback: function() {this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);},stop: function() {if (!this.timer) return;clearInterval(this.timer);this.timer = null;},onTimerEvent: function() {if (!this.currentlyExecuting) {try {this.currentlyExecuting = true;this.callback(this);} finally {this.currentlyExecuting = false;}
}
}
}
Object.extend(String, {interpret: function(value) {return value == null ? '' : String(value);},specialChar: {'\b': '\\b','\t': '\\t','\n': '\\n','\f': '\\f','\r': '\\r','\\': '\\\\'
}
});Object.extend(String.prototype, {gsub: function(pattern, replacement) {var result = '', source = this, match;replacement = arguments.callee.prepareReplacement(replacement);while (source.length > 0) {if (match = source.match(pattern)) {result += source.slice(0, match.index);result += String.interpret(replacement(match));source  = source.slice(match.index + match[0].length);} else {result += source, source = '';}
}
return result;},sub: function(pattern, replacement, count) {replacement = this.gsub.prepareReplacement(replacement);count = count === undefined ? 1 : count;return this.gsub(pattern, function(match) {if (--count < 0) return match[0];return replacement(match);});},scan: function(pattern, iterator) {this.gsub(pattern, iterator);return this;},truncate: function(length, truncation) {length = length || 30;truncation = truncation === undefined ? '...' : truncation;return this.length > length ?
this.slice(0, length - truncation.length) + truncation : this;},strip: function() {return this.replace(/^\s+/, '').replace(/\s+$/, '');},stripTags: function() {return this.replace(/<\/?[^>]+>/gi, '');},stripScripts: function() {return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');},extractScripts: function() {var matchAll = new RegExp(Prototype.ScriptFragment, 'img');var matchOne = new RegExp(Prototype.ScriptFragment, 'im');return (this.match(matchAll) || []).map(function(scriptTag) {return (scriptTag.match(matchOne) || ['', ''])[1];});},evalScripts: function() {return this.extractScripts().map(function(script) { return eval(script) });},escapeHTML: function() {var self = arguments.callee;self.text.data = this;return self.div.innerHTML;},unescapeHTML: function() {var div = document.createElement('div');div.innerHTML = this.stripTags();return div.childNodes[0] ? (div.childNodes.length > 1 ?
$A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
div.childNodes[0].nodeValue) : '';},toQueryParams: function(separator) {var match = this.strip().match(/([^?#]*)(#.*)?$/);if (!match) return {};return match[1].split(separator || '&').inject({}, function(hash, pair) {if ((pair = pair.split('='))[0]) {var key = decodeURIComponent(pair.shift());var value = pair.length > 1 ? pair.join('=') : pair[0];if (value != undefined) value = decodeURIComponent(value);if (key in hash) {if (hash[key].constructor != Array) hash[key] = [hash[key]];hash[key].push(value);}
else hash[key] = value;}
return hash;});},toArray: function() {return this.split('');},succ: function() {return this.slice(0, this.length - 1) +
String.fromCharCode(this.charCodeAt(this.length - 1) + 1);},times: function(count) {var result = '';for (var i = 0; i < count; i++) result += this;return result;},camelize: function() {var parts = this.split('-'), len = parts.length;if (len == 1) return parts[0];var camelized = this.charAt(0) == '-'
? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
: parts[0];for (var i = 1; i < len; i++)
camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);return camelized;},capitalize: function() {return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();},underscore: function() {return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();},dasherize: function() {return this.gsub(/_/,'-');},inspect: function(useDoubleQuotes) {var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {var character = String.specialChar[match[0]];return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);});if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';return "'" + escapedString.replace(/'/g, '\\\'') + "'";},toJSON: function() {return this.inspect(true);},unfilterJSON: function(filter) {return this.sub(filter || Prototype.JSONFilter, '#{1}');},isJSON: function() {var str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);},evalJSON: function(sanitize) {var json = this.unfilterJSON();try {if (!sanitize || json.isJSON()) return eval('(' + json + ')');} catch (e) { }
throw new SyntaxError('Badly formed JSON string: ' + this.inspect());},include: function(pattern) {return this.indexOf(pattern) > -1;},startsWith: function(pattern) {return this.indexOf(pattern) === 0;},endsWith: function(pattern) {var d = this.length - pattern.length;return d >= 0 && this.lastIndexOf(pattern) === d;},empty: function() {return this == '';},blank: function() {return /^\s*$/.test(this);}
});if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {escapeHTML: function() {return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},unescapeHTML: function() {return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
});String.prototype.gsub.prepareReplacement = function(replacement) {if (typeof replacement == 'function') return replacement;var template = new Template(replacement);return function(match) { return template.evaluate(match) };}
String.prototype.parseQuery = String.prototype.toQueryParams;Object.extend(String.prototype.escapeHTML, {div:  document.createElement('div'),text: document.createTextNode('')
});with (String.prototype.escapeHTML) div.appendChild(text);var Template = Class.create();Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;Template.prototype = {initialize: function(template, pattern) {this.template = template.toString();this.pattern  = pattern || Template.Pattern;},evaluate: function(object) {return this.template.gsub(this.pattern, function(match) {var before = match[1];if (before == '\\') return match[2];return before + String.interpret(object[match[3]]);});}
}
var $break = {}, $continue = new Error('"throw $continue" is deprecated, use "return" instead');var Enumerable = {each: function(iterator) {var index = 0;try {this._each(function(value) {iterator(value, index++);});} catch (e) {if (e != $break) throw e;}
return this;},eachSlice: function(number, iterator) {var index = -number, slices = [], array = this.toArray();while ((index += number) < array.length)
slices.push(array.slice(index, index+number));return slices.map(iterator);},all: function(iterator) {var result = true;this.each(function(value, index) {result = result && !!(iterator || Prototype.K)(value, index);if (!result) throw $break;});return result;},any: function(iterator) {var result = false;this.each(function(value, index) {if (result = !!(iterator || Prototype.K)(value, index))
throw $break;});return result;},collect: function(iterator) {var results = [];this.each(function(value, index) {results.push((iterator || Prototype.K)(value, index));});return results;},detect: function(iterator) {var result;this.each(function(value, index) {if (iterator(value, index)) {result = value;throw $break;}
});return result;},findAll: function(iterator) {var results = [];this.each(function(value, index) {if (iterator(value, index))
results.push(value);});return results;},grep: function(pattern, iterator) {var results = [];this.each(function(value, index) {var stringValue = value.toString();if (stringValue.match(pattern))
results.push((iterator || Prototype.K)(value, index));})
return results;},include: function(object) {var found = false;this.each(function(value) {if (value == object) {found = true;throw $break;}
});return found;},inGroupsOf: function(number, fillWith) {fillWith = fillWith === undefined ? null : fillWith;return this.eachSlice(number, function(slice) {while(slice.length < number) slice.push(fillWith);return slice;});},inject: function(memo, iterator) {this.each(function(value, index) {memo = iterator(memo, value, index);});return memo;},invoke: function(method) {var args = $A(arguments).slice(1);return this.map(function(value) {if( value.method )
return value[method].apply(value, args);return true;});},max: function(iterator) {var result;this.each(function(value, index) {value = (iterator || Prototype.K)(value, index);if (result == undefined || value >= result)
result = value;});return result;},min: function(iterator) {var result;this.each(function(value, index) {value = (iterator || Prototype.K)(value, index);if (result == undefined || value < result)
result = value;});return result;},partition: function(iterator) {var trues = [], falses = [];this.each(function(value, index) {((iterator || Prototype.K)(value, index) ?
trues : falses).push(value);});return [trues, falses];},pluck: function(property) {var results = [];this.each(function(value, index) {results.push(value[property]);});return results;},reject: function(iterator) {var results = [];this.each(function(value, index) {if (!iterator(value, index))
results.push(value);});return results;},sortBy: function(iterator) {return this.map(function(value, index) {return {value: value, criteria: iterator(value, index)};}).sort(function(left, right) {var a = left.criteria, b = right.criteria;return a < b ? -1 : a > b ? 1 : 0;}).pluck('value');},toArray: function() {return this.map();},zip: function() {var iterator = Prototype.K, args = $A(arguments);if (typeof args.last() == 'function')
iterator = args.pop();var collections = [this].concat(args).map($A);return this.map(function(value, index) {return iterator(collections.pluck(index));});},size: function() {return this.toArray().length;},inspect: function() {return '#<Enumerable:' + this.toArray().inspect() + '>';}
}
Object.extend(Enumerable, {map:     Enumerable.collect,find:    Enumerable.detect,select:  Enumerable.findAll,member:  Enumerable.include,entries: Enumerable.toArray
});var $A = Array.from = function(iterable) {if (!iterable) return [];if (iterable.toArray) {return iterable.toArray();} else {var results = [];for (var i = 0, length = iterable.length; i < length; i++)
results.push(iterable[i]);return results;}
}
if (Prototype.Browser.WebKit) {$A = Array.from = function(iterable) {if (!iterable) return [];if (!(typeof iterable == 'function' && iterable == '[object NodeList]') &&
iterable.toArray) {return iterable.toArray();} else {var results = [];for (var i = 0, length = iterable.length; i < length; i++)
results.push(iterable[i]);return results;}
}
}
Object.extend(Array.prototype, Enumerable);if (!Array.prototype._reverse)
Array.prototype._reverse = Array.prototype.reverse;Object.extend(Array.prototype, {_each: function(iterator) {for (var i = 0, length = this.length; i < length; i++)
iterator(this[i]);},clear: function() {this.length = 0;return this;},first: function() {return this[0];},last: function() {return this[this.length - 1];},compact: function() {return this.select(function(value) {return value != null;});},flatten: function() {return this.inject([], function(array, value) {return array.concat(value && value.constructor == Array ?
value.flatten() : [value]);});},without: function() {var values = $A(arguments);return this.select(function(value) {return !values.include(value);});},indexOf: function(object) {for (var i = 0, length = this.length; i < length; i++)
if (this[i] == object) return i;return -1;},reverse: function(inline) {return (inline !== false ? this : this.toArray())._reverse();},reduce: function() {return this.length > 1 ? this : this[0];},uniq: function(sorted) {return this.inject([], function(array, value, index) {if (0 == index || (sorted ? array.last() != value : !array.include(value)))
array.push(value);return array;});},clone: function() {return [].concat(this);},size: function() {return this.length;},inspect: function() {return '[' + this.map(Object.inspect).join(', ') + ']';},toJSON: function() {var results = [];this.each(function(object) {var value = Object.toJSON(object);if (value !== undefined) results.push(value);});return '[' + results.join(', ') + ']';}
});Array.prototype.toArray = Array.prototype.clone;function $w(string) {string = string.strip();return string ? string.split(/\s+/) : [];}
if (Prototype.Browser.Opera){Array.prototype.concat = function() {var array = [];for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);for (var i = 0, length = arguments.length; i < length; i++) {if (arguments[i].constructor == Array) {for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
array.push(arguments[i][j]);} else {array.push(arguments[i]);}
}
return array;}
}
var Hash = function(object) {if (object instanceof Hash) this.merge(object);else Object.extend(this, object || {});};Object.extend(Hash, {toQueryString: function(obj) {var parts = [];parts.add = arguments.callee.addPair;this.prototype._each.call(obj, function(pair) {if (!pair.key) return;var value = pair.value;if (value && typeof value == 'object') {if (value.constructor == Array) value.each(function(value) {parts.add(pair.key, value);});return;}
parts.add(pair.key, value);});return parts.join('&');},toJSON: function(object) {var results = [];this.prototype._each.call(object, function(pair) {var value = Object.toJSON(pair.value);if (value !== undefined) results.push(pair.key.toJSON() + ': ' + value);});return '{' + results.join(', ') + '}';}
});Hash.toQueryString.addPair = function(key, value, prefix) {key = encodeURIComponent(key);if (value === undefined) this.push(key);else this.push(key + '=' + (value == null ? '' : encodeURIComponent(value)));}
Object.extend(Hash.prototype, Enumerable);Object.extend(Hash.prototype, {_each: function(iterator) {for (var key in this) {var value = this[key];if (value && value == Hash.prototype[key]) continue;var pair = [key, value];pair.key = key;pair.value = value;iterator(pair);}
},keys: function() {return this.pluck('key');},values: function() {return this.pluck('value');},merge: function(hash) {return $H(hash).inject(this, function(mergedHash, pair) {mergedHash[pair.key] = pair.value;return mergedHash;});},remove: function() {var result;for(var i = 0, length = arguments.length; i < length; i++) {var value = this[arguments[i]];if (value !== undefined){if (result === undefined) result = value;else {if (result.constructor != Array) result = [result];result.push(value)
}
}
delete this[arguments[i]];}
return result;},toQueryString: function() {return Hash.toQueryString(this);},inspect: function() {return '#<Hash:{' + this.map(function(pair) {return pair.map(Object.inspect).join(': ');}).join(', ') + '}>';},toJSON: function() {return Hash.toJSON(this);}
});function $H(object) {if (object instanceof Hash) return object;return new Hash(object);};// Safari iterates over shadowed properties
if (function() {var i = 0, Test = function(value) { this.key = value };Test.prototype.key = 'foo';for (var property in new Test('bar')) i++;return i > 1;}()) Hash.prototype._each = function(iterator) {var cache = [];for (var key in this) {var value = this[key];if ((value && value == Hash.prototype[key]) || cache.include(key)) continue;cache.push(key);var pair = [key, value];pair.key = key;pair.value = value;iterator(pair);}
};ObjectRange = Class.create();Object.extend(ObjectRange.prototype, Enumerable);Object.extend(ObjectRange.prototype, {initialize: function(start, end, exclusive) {this.start = start;this.end = end;this.exclusive = exclusive;},_each: function(iterator) {var value = this.start;while (this.include(value)) {iterator(value);value = value.succ();}
},include: function(value) {if (value < this.start)
return false;if (this.exclusive)
return value < this.end;return value <= this.end;}
});var $R = function(start, end, exclusive) {return new ObjectRange(start, end, exclusive);}
var Ajax = {getTransport: function() {return Try.these(
function() {return new XMLHttpRequest()},function() {return new ActiveXObject('Msxml2.XMLHTTP')},function() {return new ActiveXObject('Microsoft.XMLHTTP')}
) || false;},activeRequestCount: 0
}
Ajax.Responders = {responders: [],_each: function(iterator) {this.responders._each(iterator);},register: function(responder) {if (!this.include(responder))
this.responders.push(responder);},unregister: function(responder) {this.responders = this.responders.without(responder);},dispatch: function(callback, request, transport, json) {this.each(function(responder) {if (typeof responder[callback] == 'function') {try {responder[callback].apply(responder, [request, transport, json]);} catch (e) {}
}
});}
};Object.extend(Ajax.Responders, Enumerable);Ajax.Responders.register({onCreate: function() {Ajax.activeRequestCount++;},onComplete: function() {Ajax.activeRequestCount--;}
});Ajax.Base = function() {};Ajax.Base.prototype = {setOptions: function(options) {this.options = {method:       'post',asynchronous: true,contentType:  'application/x-www-form-urlencoded',encoding:     'UTF-8',parameters:   ''
}
Object.extend(this.options, options || {});this.options.method = this.options.method.toLowerCase();if (typeof this.options.parameters == 'string')
this.options.parameters = this.options.parameters.toQueryParams();}
}
Ajax.Request = Class.create();Ajax.Request.Events =
['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];Ajax.Request.prototype = Object.extend(new Ajax.Base(), {_complete: false,initialize: function(url, options) {this.transport = Ajax.getTransport();this.setOptions(options);this.request(url);},request: function(url) {this.url = url;this.method = this.options.method;var params = Object.clone(this.options.parameters);if (!['get', 'post'].include(this.method)) {// simulate other verbs over post
params['_method'] = this.method;this.method = 'post';}
this.parameters = params;if (params = Hash.toQueryString(params)) {// when GET, append parameters to URL
if (this.method == 'get')
this.url += (this.url.include('?') ? '&' : '?') + params;else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
params += '&_=';}
try {if (this.options.onCreate) this.options.onCreate(this.transport);Ajax.Responders.dispatch('onCreate', this, this.transport);this.transport.open(this.method.toUpperCase(), this.url,this.options.asynchronous);if (this.options.asynchronous)
setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);this.transport.onreadystatechange = this.onStateChange.bind(this);this.setRequestHeaders();this.body = this.method == 'post' ? (this.options.postBody || params) : null;this.transport.send(this.body);/* Force Firefox to handle ready state 4 for synchronous requests */
if (!this.options.asynchronous && this.transport.overrideMimeType)
this.onStateChange();}
catch (e) {this.dispatchException(e);}
},onStateChange: function() {var readyState = this.transport.readyState;if (readyState > 1 && !((readyState == 4) && this._complete))
this.respondToReadyState(this.transport.readyState);},setRequestHeaders: function() {var headers = {'X-Requested-With': 'XMLHttpRequest','X-Prototype-Version': Prototype.Version,'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
};if (this.method == 'post') {headers['Content-type'] = this.options.contentType +
(this.options.encoding ? '; charset=' + this.options.encoding : '');/* Force "Connection: close" for older Mozilla browsers to work
* around a bug where XMLHttpRequest sends an incorrect
* Content-length header. See Mozilla Bugzilla #246651.
*/
if (this.transport.overrideMimeType &&
(navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
headers['Connection'] = 'close';}
if (typeof this.options.requestHeaders == 'object') {var extras = this.options.requestHeaders;if (typeof extras.push == 'function')
for (var i = 0, length = extras.length; i < length; i += 2)
headers[extras[i]] = extras[i+1];else
$H(extras).each(function(pair) { headers[pair.key] = pair.value });}
for (var name in headers)
this.transport.setRequestHeader(name, headers[name]);},success: function() {return !this.transport.status
|| (this.transport.status >= 200 && this.transport.status < 300);},respondToReadyState: function(readyState) {var state = Ajax.Request.Events[readyState];var transport = this.transport, json = this.evalJSON();if (state == 'Complete') {try {this._complete = true;(this.options['on' + this.transport.status]
|| this.options['on' + (this.success() ? 'Success' : 'Failure')]
|| Prototype.emptyFunction)(transport, json);} catch (e) {this.dispatchException(e);}
var contentType = this.getHeader('Content-type');if (contentType && contentType.strip().
match(/^(text|application)\/(x-)?(java|ecma)script(;.*)?$/i))
this.evalResponse();}
try {(this.options['on' + state] || Prototype.emptyFunction)(transport, json);Ajax.Responders.dispatch('on' + state, this, transport, json);} catch (e) {this.dispatchException(e);}
if (state == 'Complete') {// avoid memory leak in MSIE: clean up
this.transport.onreadystatechange = Prototype.emptyFunction;}
},getHeader: function(name) {try {return this.transport.getResponseHeader(name);} catch (e) { return null }
},evalJSON: function() {try {var json = this.getHeader('X-JSON');return json ? json.evalJSON() : null;} catch (e) { return null }
},evalResponse: function() {try {return eval((this.transport.responseText || '').unfilterJSON());} catch (e) {this.dispatchException(e);}
},dispatchException: function(exception) {(this.options.onException || Prototype.emptyFunction)(this, exception);Ajax.Responders.dispatch('onException', this, exception);}
});Ajax.Updater = Class.create();Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {initialize: function(container, url, options) {this.container = {success: (container.success || container),failure: (container.failure || (container.success ? null : container))
}
this.transport = Ajax.getTransport();this.setOptions(options);var onComplete = this.options.onComplete || Prototype.emptyFunction;this.options.onComplete = (function(transport, param) {this.updateContent();onComplete(transport, param);}).bind(this);this.request(url);},updateContent: function() {var receiver = this.container[this.success() ? 'success' : 'failure'];var response = this.transport.responseText;if (!this.options.evalScripts) response = response.stripScripts();if (receiver = $(receiver)) {if (this.options.insertion)
new this.options.insertion(receiver, response);else
receiver.update(response);}
if (this.success()) {if (this.onComplete)
setTimeout(this.onComplete.bind(this), 10);}
}
});Ajax.PeriodicalUpdater = Class.create();Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {initialize: function(container, url, options) {this.setOptions(options);this.onComplete = this.options.onComplete;this.frequency = (this.options.frequency || 2);this.decay = (this.options.decay || 1);this.updater = {};this.container = container;this.url = url;this.start();},start: function() {this.options.onComplete = this.updateComplete.bind(this);this.onTimerEvent();},stop: function() {this.updater.options.onComplete = undefined;clearTimeout(this.timer);(this.onComplete || Prototype.emptyFunction).apply(this, arguments);},updateComplete: function(request) {if (this.options.decay) {this.decay = (request.responseText == this.lastText ?
this.decay * this.options.decay : 1);this.lastText = request.responseText;}
this.timer = setTimeout(this.onTimerEvent.bind(this),this.decay * this.frequency * 1000);},onTimerEvent: function() {this.updater = new Ajax.Updater(this.container, this.url, this.options);}
});function $(element) {if (arguments.length > 1) {for (var i = 0, elements = [], length = arguments.length; i < length; i++)
elements.push($(arguments[i]));return elements;}
if (typeof element == 'string')
element = document.getElementById(element);return Element.extend(element);}
if (Prototype.BrowserFeatures.XPath) {document._getElementsByXPath = function(expression, parentElement) {var results = [];var query = document.evaluate(expression, $(parentElement) || document,null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);for (var i = 0, length = query.snapshotLength; i < length; i++)
results.push(query.snapshotItem(i));return results;};document.getElementsByClassName = function(className, parentElement) {var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";return document._getElementsByXPath(q, parentElement);}
} else document.getElementsByClassName = function(className, parentElement) {var children = ($(parentElement) || document.body).getElementsByTagName('*');var elements = [], child, pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");for (var i = 0, length = children.length; i < length; i++) {child = children[i];var elementClassName = child.className;if (elementClassName.length == 0) continue;if (elementClassName == className || elementClassName.match(pattern))
elements.push(Element.extend(child));}
return elements;};/*--------------------------------------------------------------------------*/
if (!window.Element) var Element = {};Element.extend = function(element) {var F = Prototype.BrowserFeatures;if (!element || !element.tagName || element.nodeType == 3 ||
element._extended || F.SpecificElementExtensions || element == window)
return element;var methods = {}, tagName = element.tagName, cache = Element.extend.cache,T = Element.Methods.ByTag;// extend methods for all tags (Safari doesn't need this)
if (!F.ElementExtensions) {Object.extend(methods, Element.Methods),Object.extend(methods, Element.Methods.Simulated);}
if (T[tagName]) Object.extend(methods, T[tagName]);for (var property in methods) {var value = methods[property];if (typeof value == 'function' && !(property in element))
element[property] = cache.findOrStore(value);}
element._extended = Prototype.emptyFunction;return element;};Element.extend.cache = {findOrStore: function(value) {return this[value] = this[value] || function() {return value.apply(null, [this].concat($A(arguments)));}
}
};Element.Methods = {visible: function(element) {return $(element).style.display != 'none';},toggle: function(element) {element = $(element);Element[Element.visible(element) ? 'hide' : 'show'](element);return element;},hide: function(element) {$(element).style.display = 'none';return element;},show: function(element) {$(element).style.display = '';return element;},remove: function(element) {element = $(element);element.parentNode.removeChild(element);return element;},update: function(element, html) {html = typeof html == 'undefined' ? '' : html.toString();$(element).innerHTML = html.stripScripts();setTimeout(function() {html.evalScripts()}, 10);return element;},replace: function(element, html) {element = $(element);html = typeof html == 'undefined' ? '' : html.toString();if (element.outerHTML) {element.outerHTML = html.stripScripts();} else {var range = element.ownerDocument.createRange();range.selectNodeContents(element);element.parentNode.replaceChild(
range.createContextualFragment(html.stripScripts()), element);}
setTimeout(function() {html.evalScripts()}, 10);return element;},inspect: function(element) {element = $(element);var result = '<' + element.tagName.toLowerCase();$H({'id': 'id', 'className': 'class'}).each(function(pair) {var property = pair.first(), attribute = pair.last();var value = (element[property] || '').toString();if (value) result += ' ' + attribute + '=' + value.inspect(true);});return result + '>';},recursivelyCollect: function(element, property) {element = $(element);var elements = [];while (element = element[property])
if (element.nodeType == 1)
elements.push(Element.extend(element));return elements;},ancestors: function(element) {return $(element).recursivelyCollect('parentNode');},descendants: function(element) {return $A($(element).getElementsByTagName('*')).each(Element.extend);},firstDescendant: function(element) {element = $(element).firstChild;while (element && element.nodeType != 1) element = element.nextSibling;return $(element);},immediateDescendants: function(element) {if (!(element = $(element).firstChild)) return [];while (element && element.nodeType != 1) element = element.nextSibling;if (element) return [element].concat($(element).nextSiblings());return [];},previousSiblings: function(element) {return $(element).recursivelyCollect('previousSibling');},nextSiblings: function(element) {return $(element).recursivelyCollect('nextSibling');},siblings: function(element) {element = $(element);return element.previousSiblings().reverse().concat(element.nextSiblings());},match: function(element, selector) {if (typeof selector == 'string')
selector = new Selector(selector);return selector.match($(element));},up: function(element, expression, index) {element = $(element);if (arguments.length == 1) return $(element.parentNode);var ancestors = element.ancestors();return expression ? Selector.findElement(ancestors, expression, index) :
ancestors[index || 0];},down: function(element, expression, index) {element = $(element);if (arguments.length == 1) return element.firstDescendant();var descendants = element.descendants();return expression ? Selector.findElement(descendants, expression, index) :
descendants[index || 0];},previous: function(element, expression, index) {element = $(element);if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));var previousSiblings = element.previousSiblings();return expression ? Selector.findElement(previousSiblings, expression, index) :
previousSiblings[index || 0];},next: function(element, expression, index) {element = $(element);if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));var nextSiblings = element.nextSiblings();return expression ? Selector.findElement(nextSiblings, expression, index) :
nextSiblings[index || 0];},getElementsBySelector: function() {var args = $A(arguments), element = $(args.shift());return Selector.findChildElements(element, args);},getElementsByClassName: function(element, className) {return document.getElementsByClassName(className, element);},readAttribute: function(element, name) {element = $(element);if (Prototype.Browser.IE) {if (!element.attributes) return null;var t = Element._attributeTranslations;if (t.values[name]) return t.values[name](element, name);if (t.names[name])  name = t.names[name];var attribute = element.attributes[name];return attribute ? attribute.nodeValue : null;}
return element.getAttribute(name);},getHeight: function(element) {return $(element).getDimensions().height;},getWidth: function(element) {return $(element).getDimensions().width;},classNames: function(element) {return new Element.ClassNames(element);},hasClassName: function(element, className) {if (!(element = $(element))) return;var elementClassName = element.className;if (elementClassName.length == 0) return false;if (elementClassName == className ||
elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
return true;return false;},addClassName: function(element, className) {if (!(element = $(element))) return;Element.classNames(element).add(className);return element;},removeClassName: function(element, className) {if (!(element = $(element))) return;Element.classNames(element).remove(className);return element;},toggleClassName: function(element, className) {if (!(element = $(element))) return;Element.classNames(element)[element.hasClassName(className) ? 'remove' : 'add'](className);return element;},observe: function() {Event.observe.apply(Event, arguments);return $A(arguments).first();},stopObserving: function() {Event.stopObserving.apply(Event, arguments);return $A(arguments).first();},// removes whitespace-only text node children
cleanWhitespace: function(element) {element = $(element);var node = element.firstChild;while (node) {var nextNode = node.nextSibling;if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
element.removeChild(node);node = nextNode;}
return element;},empty: function(element) {return $(element).innerHTML.blank();},descendantOf: function(element, ancestor) {element = $(element), ancestor = $(ancestor);while (element = element.parentNode)
if (element == ancestor) return true;return false;},scrollTo: function(element) {element = $(element);var pos = Position.cumulativeOffset(element);window.scrollTo(pos[0], pos[1]);return element;},getStyle: function(element, style) {element = $(element);style = style == 'float' ? 'cssFloat' : style.camelize();var value = element.style[style];if (!value) {var css = document.defaultView.getComputedStyle(element, null);value = css ? css[style] : null;}
if (style == 'opacity') return value ? parseFloat(value) : 1.0;return value == 'auto' ? null : value;},getOpacity: function(element) {return $(element).getStyle('opacity');},setStyle: function(element, styles, camelized) {element = $(element);var elementStyle = element.style;for (var property in styles)
if (property == 'opacity') element.setOpacity(styles[property])
else
{elementStyle[(property == 'float' || property == 'cssFloat') ?
(elementStyle.styleFloat === undefined ? 'cssFloat' : 'styleFloat') :
(camelized ? property : property.camelize())] = styles[property];}
return element;},setOpacity: function(element, value) {element = $(element);element.style.opacity = (value == 1 || value === '') ? '' :
(value < 0.00001) ? 0 : value;return element;},getDimensions: function(element) {element = $(element);var display = $(element).getStyle('display');if (display != 'none' && display != null) // Safari bug
return {width: element.offsetWidth, height: element.offsetHeight};// All *Width and *Height properties give 0 on elements with display none,// so enable the element temporarily
var els = element.style;var originalVisibility = els.visibility;var originalPosition = els.position;var originalDisplay = els.display;els.visibility = 'hidden';els.position = 'absolute';els.display = 'block';var originalWidth = element.clientWidth;var originalHeight = element.clientHeight;els.display = originalDisplay;els.position = originalPosition;els.visibility = originalVisibility;return {width: originalWidth, height: originalHeight};},makePositioned: function(element) {element = $(element);var pos = Element.getStyle(element, 'position');if (pos == 'static' || !pos) {element._madePositioned = true;element.style.position = 'relative';// Opera returns the offset relative to the positioning context, when an
if (window.opera) {element.style.top = 0;element.style.left = 0;}
}
return element;},undoPositioned: function(element) {element = $(element);if (element._madePositioned) {element._madePositioned = undefined;element.style.position =
element.style.top =
element.style.left =
element.style.bottom =
element.style.right = '';}
return element;},makeClipping: function(element) {element = $(element);if (element._overflow) return element;element._overflow = element.style.overflow || 'auto';if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
element.style.overflow = 'hidden';return element;},undoClipping: function(element) {element = $(element);if (!element._overflow) return element;element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;element._overflow = null;return element;}
};Object.extend(Element.Methods, {childOf: Element.Methods.descendantOf,childElements: Element.Methods.immediateDescendants
});if (Prototype.Browser.Opera) {Element.Methods._getStyle = Element.Methods.getStyle;Element.Methods.getStyle = function(element, style) {switch(style) {case 'left':
case 'top':
case 'right':
case 'bottom':
if (Element._getStyle(element, 'position') == 'static') return null;default: return Element._getStyle(element, style);}
};}
else if (Prototype.Browser.IE) {Element.Methods.getStyle = function(element, style) {element = $(element);style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();var value = element.style[style];if (!value && element.currentStyle) value = element.currentStyle[style];if (style == 'opacity') {if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
if (value[1]) return parseFloat(value[1]) / 100;return 1.0;}
if (value == 'auto') {if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
return element['offset'+style.capitalize()] + 'px';return null;}
return value;};Element.Methods.setOpacity = function(element, value) {element = $(element);var filter = element.getStyle('filter'), style = element.style;if (value == 1 || value === '') {style.filter = filter.replace(/alpha\([^\)]*\)/gi,'');return element;} else if (value < 0.00001) value = 0;style.filter = filter.replace(/alpha\([^\)]*\)/gi, '') +
'alpha(opacity=' + (value * 100) + ')';return element;};// IE is missing .innerHTML support for TABLE-related elements
Element.Methods.update = function(element, html) {element = $(element);html = typeof html == 'undefined' ? '' : html.toString();var tagName = element.tagName.toUpperCase();if (['THEAD','TBODY','TR','TD'].include(tagName)) {var div = document.createElement('div');switch (tagName) {case 'THEAD':
case 'TBODY':
div.innerHTML = '<table><tbody>' +  html.stripScripts() + '</tbody></table>';depth = 2;break;case 'TR':
div.innerHTML = '<table><tbody><tr>' +  html.stripScripts() + '</tr></tbody></table>';depth = 3;break;case 'TD':
div.innerHTML = '<table><tbody><tr><td>' +  html.stripScripts() + '</td></tr></tbody></table>';depth = 4;}
$A(element.childNodes).each(function(node) { element.removeChild(node) });depth.times(function() { div = div.firstChild });$A(div.childNodes).each(function(node) { element.appendChild(node) });} else {element.innerHTML = html.stripScripts();}
setTimeout(function() { html.evalScripts() }, 10);return element;}
}
else if (Prototype.Browser.Gecko) {Element.Methods.setOpacity = function(element, value) {element = $(element);element.style.opacity = (value == 1) ? 0.999999 :
(value === '') ? '' : (value < 0.00001) ? 0 : value;return element;};}
Element._attributeTranslations = {names: {colspan:   "colSpan",rowspan:   "rowSpan",valign:    "vAlign",datetime:  "dateTime",accesskey: "accessKey",tabindex:  "tabIndex",enctype:   "encType",maxlength: "maxLength",readonly:  "readOnly",longdesc:  "longDesc"
},values: {_getAttr: function(element, attribute) {return element.getAttribute(attribute, 2);},_flag: function(element, attribute) {return $(element).hasAttribute(attribute) ? attribute : null;},style: function(element) {return element.style.cssText.toLowerCase();},title: function(element) {var node = element.getAttributeNode('title');return node.specified ? node.nodeValue : null;}
}
};(function() {Object.extend(this, {href: this._getAttr,src:  this._getAttr,type: this._getAttr,disabled: this._flag,checked:  this._flag,readonly: this._flag,multiple: this._flag
});}).call(Element._attributeTranslations.values);Element.Methods.Simulated = {hasAttribute: function(element, attribute) {var t = Element._attributeTranslations, node;attribute = t.names[attribute] || attribute;node = $(element).getAttributeNode(attribute);return node && node.specified;}
};Element.Methods.ByTag = {};Object.extend(Element, Element.Methods);if (!Prototype.BrowserFeatures.ElementExtensions &&
document.createElement('div').__proto__) {window.HTMLElement = {};window.HTMLElement.prototype = document.createElement('div').__proto__;Prototype.BrowserFeatures.ElementExtensions = true;}
Element.hasAttribute = function(element, attribute) {if (element.hasAttribute) return element.hasAttribute(attribute);return Element.Methods.Simulated.hasAttribute(element, attribute);};Element.addMethods = function(methods) {var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;if (!methods) {Object.extend(Form, Form.Methods);Object.extend(Form.Element, Form.Element.Methods);Object.extend(Element.Methods.ByTag, {"FORM":     Object.clone(Form.Methods),"INPUT":    Object.clone(Form.Element.Methods),"SELECT":   Object.clone(Form.Element.Methods),"TEXTAREA": Object.clone(Form.Element.Methods)
});}
if (arguments.length == 2) {var tagName = methods;methods = arguments[1];}
if (!tagName) Object.extend(Element.Methods, methods || {});else {if (tagName.constructor == Array) tagName.each(extend);else extend(tagName);}
function extend(tagName) {tagName = tagName.toUpperCase();if (!Element.Methods.ByTag[tagName])
Element.Methods.ByTag[tagName] = {};Object.extend(Element.Methods.ByTag[tagName], methods);}
function copy(methods, destination, onlyIfAbsent) {onlyIfAbsent = onlyIfAbsent || false;var cache = Element.extend.cache;for (var property in methods) {var value = methods[property];if (!onlyIfAbsent || !(property in destination))
destination[property] = cache.findOrStore(value);}
}
function findDOMClass(tagName) {var klass;var trans = {"OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph","FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList","DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading","H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote","INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
"TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
"TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
"TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
"FrameSet", "IFRAME": "IFrame"
};if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';if (window[klass]) return window[klass];klass = 'HTML' + tagName + 'Element';if (window[klass]) return window[klass];klass = 'HTML' + tagName.capitalize() + 'Element';if (window[klass]) return window[klass];window[klass] = {};window[klass].prototype = document.createElement(tagName).__proto__;return window[klass];}
if (F.ElementExtensions) {copy(Element.Methods, HTMLElement.prototype);copy(Element.Methods.Simulated, HTMLElement.prototype, true);}
if (F.SpecificElementExtensions) {for (var tag in Element.Methods.ByTag) {var klass = findDOMClass(tag);if (typeof klass == "undefined") continue;copy(T[tag], klass.prototype);}
}
Object.extend(Element, Element.Methods);delete Element.ByTag;};var Toggle = { display: Element.toggle };/*--------------------------------------------------------------------------*/
Abstract.Insertion = function(adjacency) {this.adjacency = adjacency;}
Abstract.Insertion.prototype = {initialize: function(element, content) {this.element = $(element);this.content = content.stripScripts();if (this.adjacency && this.element.insertAdjacentHTML) {try {this.element.insertAdjacentHTML(this.adjacency, this.content);} catch (e) {var tagName = this.element.tagName.toUpperCase();if (['TBODY', 'TR'].include(tagName)) {this.insertContent(this.contentFromAnonymousTable());} else {throw e;}
}
} else {this.range = this.element.ownerDocument.createRange();if (this.initializeRange) this.initializeRange();this.insertContent([this.range.createContextualFragment(this.content)]);}
setTimeout(function() {content.evalScripts()}, 10);},contentFromAnonymousTable: function() {var div = document.createElement('div');div.innerHTML = '<table><tbody>' + this.content + '</tbody></table>';return $A(div.childNodes[0].childNodes[0].childNodes);}
}
var Insertion = new Object();Insertion.Before = Class.create();Insertion.Before.prototype = Object.extend(new Abstract.Insertion('beforeBegin'), {initializeRange: function() {this.range.setStartBefore(this.element);},insertContent: function(fragments) {fragments.each((function(fragment) {this.element.parentNode.insertBefore(fragment, this.element);}).bind(this));}
});Insertion.Top = Class.create();Insertion.Top.prototype = Object.extend(new Abstract.Insertion('afterBegin'), {initializeRange: function() {this.range.selectNodeContents(this.element);this.range.collapse(true);},insertContent: function(fragments) {fragments.reverse(false).each((function(fragment) {this.element.insertBefore(fragment, this.element.firstChild);}).bind(this));}
});Insertion.Bottom = Class.create();Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion('beforeEnd'), {initializeRange: function() {this.range.selectNodeContents(this.element);this.range.collapse(this.element);},insertContent: function(fragments) {fragments.each((function(fragment) {this.element.appendChild(fragment);}).bind(this));}
});Insertion.After = Class.create();Insertion.After.prototype = Object.extend(new Abstract.Insertion('afterEnd'), {initializeRange: function() {this.range.setStartAfter(this.element);},insertContent: function(fragments) {fragments.each((function(fragment) {this.element.parentNode.insertBefore(fragment,this.element.nextSibling);}).bind(this));}
});/*--------------------------------------------------------------------------*/
Element.ClassNames = Class.create();Element.ClassNames.prototype = {initialize: function(element) {this.element = $(element);},_each: function(iterator) {this.element.className.split(/\s+/).select(function(name) {return name.length > 0;})._each(iterator);},set: function(className) {this.element.className = className;},add: function(classNameToAdd) {if (this.include(classNameToAdd)) return;this.set($A(this).concat(classNameToAdd).join(' '));},remove: function(classNameToRemove) {if (!this.include(classNameToRemove)) return;this.set($A(this).without(classNameToRemove).join(' '));},toString: function() {return $A(this).join(' ');}
};Object.extend(Element.ClassNames.prototype, Enumerable);/* Portions of the Selector class are derived from Jack Slocum’s DomQuery,* part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
* license.  Please see http://www.yui-ext.com/ for more information. */
var Selector = Class.create();Selector.prototype = {initialize: function(expression) {this.expression = expression.strip();this.compileMatcher();},compileMatcher: function() {// Selectors with namespaced attributes can't use the XPath version
if (Prototype.BrowserFeatures.XPath && !(/\[[\w-]*?:/).test(this.expression))
return this.compileXPathMatcher();var e = this.expression, ps = Selector.patterns, h = Selector.handlers,c = Selector.criteria, le, p, m;if (Selector._cache[e]) {this.matcher = Selector._cache[e]; return;}
this.matcher = ["this.matcher = function(root) {","var r = root, h = Selector.handlers, c = false, n;"];while (e && le != e && (/\S/).test(e)) {le = e;for (var i in ps) {p = ps[i];if (m = e.match(p)) {this.matcher.push(typeof c[i] == 'function' ? c[i](m) :
new Template(c[i]).evaluate(m));e = e.replace(m[0], '');break;}
}
}
this.matcher.push("return h.unique(n);\n}");eval(this.matcher.join('\n'));Selector._cache[this.expression] = this.matcher;},compileXPathMatcher: function() {var e = this.expression, ps = Selector.patterns,x = Selector.xpath, le,  m;if (Selector._cache[e]) {this.xpath = Selector._cache[e]; return;}
this.matcher = ['.//*'];while (e && le != e && (/\S/).test(e)) {le = e;for (var i in ps) {if (m = e.match(ps[i])) {this.matcher.push(typeof x[i] == 'function' ? x[i](m) :
new Template(x[i]).evaluate(m));e = e.replace(m[0], '');break;}
}
}
this.xpath = this.matcher.join('');Selector._cache[this.expression] = this.xpath;},findElements: function(root) {root = root || document;if (this.xpath) return document._getElementsByXPath(this.xpath, root);return this.matcher(root);},match: function(element) {return this.findElements(document).include(element);},toString: function() {return this.expression;},inspect: function() {return "#<Selector:" + this.expression.inspect() + ">";}
};Object.extend(Selector, {_cache: {},xpath: {descendant:   "//*",child:        "/*",adjacent:     "/following-sibling::*[1]",laterSibling: '/following-sibling::*',tagName:      function(m) {if (m[1] == '*') return '';return "[local-name()='" + m[1].toLowerCase() +
"' or local-name()='" + m[1].toUpperCase() + "']";},className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",id:           "[@id='#{1}']",attrPresence: "[@#{1}]",attr: function(m) {m[3] = m[5] || m[6];return new Template(Selector.xpath.operators[m[2]]).evaluate(m);},pseudo: function(m) {var h = Selector.xpath.pseudos[m[1]];if (!h) return '';if (typeof h === 'function') return h(m);return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);},operators: {'=':  "[@#{1}='#{3}']",'!=': "[@#{1}!='#{3}']",'^=': "[starts-with(@#{1}, '#{3}')]",'$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",'*=': "[contains(@#{1}, '#{3}')]",'~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",'|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
},pseudos: {'first-child': '[not(preceding-sibling::*)]','last-child':  '[not(following-sibling::*)]','only-child':  '[not(preceding-sibling::* or following-sibling::*)]','empty':       "[count(*) = 0 and (count(text()) = 0 or translate(text(), ' \t\r\n', '') = '')]",'checked':     "[@checked]",'disabled':    "[@disabled]",'enabled':     "[not(@disabled)]",'not': function(m) {var e = m[6], p = Selector.patterns,x = Selector.xpath, le, m, v;var exclusion = [];while (e && le != e && (/\S/).test(e)) {le = e;for (var i in p) {if (m = e.match(p[i])) {v = typeof x[i] == 'function' ? x[i](m) : new Template(x[i]).evaluate(m);exclusion.push("(" + v.substring(1, v.length - 1) + ")");e = e.replace(m[0], '');break;}
}
}
return "[not(" + exclusion.join(" and ") + ")]";},'nth-child':      function(m) {return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);},'nth-last-child': function(m) {return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);},'nth-of-type':    function(m) {return Selector.xpath.pseudos.nth("position() ", m);},'nth-last-of-type': function(m) {return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);},'first-of-type':  function(m) {m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);},'last-of-type':   function(m) {m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);},'only-of-type':   function(m) {var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);},nth: function(fragment, m) {var mm, formula = m[6], predicate;if (formula == 'even') formula = '2n+0';if (formula == 'odd')  formula = '2n+1';if (mm = formula.match(/^(\d+)$/)) // digit only
return '[' + fragment + "= " + mm[1] + ']';if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
if (mm[1] == "-") mm[1] = -1;var a = mm[1] ? Number(mm[1]) : 1;var b = mm[2] ? Number(mm[2]) : 0;predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
"((#{fragment} - #{b}) div #{a} >= 0)]";return new Template(predicate).evaluate({fragment: fragment, a: a, b: b });}
}
}
},criteria: {tagName:      'n = h.tagName(n, r, "#{1}", c);   c = false;',className:    'n = h.className(n, r, "#{1}", c); c = false;',id:           'n = h.id(n, r, "#{1}", c);        c = false;',attrPresence: 'n = h.attrPresence(n, r, "#{1}"); c = false;',attr: function(m) {m[3] = (m[5] || m[6]);return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}"); c = false;').evaluate(m);},pseudo:       function(m) {if (m[6]) m[6] = m[6].replace(/"/g, '\\"');return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);},descendant:   'c = "descendant";',child:        'c = "child";',adjacent:     'c = "adjacent";',laterSibling: 'c = "laterSibling";'
},patterns: {// combinators must be listed first
laterSibling: /^\s*~\s*/,child:        /^\s*>\s*/,adjacent:     /^\s*\+\s*/,descendant:   /^\s/,// selectors follow
tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,id:           /^#([\w\-\*]+)(\b|$)/,className:    /^\.([\w\-\*]+)(\b|$)/,pseudo:       /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|\s|(?=:))/,attrPresence: /^\[([\w]+)\]/,attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\]]*?)\4|([^'"][^\]]*?)))?\]/
},handlers: {// UTILITY FUNCTIONS
concat: function(a, b) {for (var i = 0, node; node = b[i]; i++)
a.push(node);return a;},// marks an array of nodes for counting
mark: function(nodes) {for (var i = 0, node; node = nodes[i]; i++)
node._counted = true;return nodes;},unmark: function(nodes) {for (var i = 0, node; node = nodes[i]; i++)
node._counted = undefined;return nodes;},// mark each child node with its position (for nth calls)
index: function(parentNode, reverse, ofType) {parentNode._counted = true;if (reverse) {for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {node = nodes[i];if (node.nodeType == 1 && (!ofType || node._counted)) node.nodeIndex = j++;}
} else {for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
if (node.nodeType == 1 && (!ofType || node._counted)) node.nodeIndex = j++;}
},// filters out duplicates and extends all nodes
unique: function(nodes) {if (nodes.length == 0) return nodes;var results = [], n;for (var i = 0, l = nodes.length; i < l; i++)
if (!(n = nodes[i])._counted) {n._counted = true;results.push(Element.extend(n));}
return Selector.handlers.unmark(results);},// COMBINATOR FUNCTIONS
descendant: function(nodes) {var h = Selector.handlers;for (var i = 0, results = [], node; node = nodes[i]; i++)
h.concat(results, node.getElementsByTagName('*'));return results;},child: function(nodes) {var h = Selector.handlers;for (var i = 0, results = [], node; node = nodes[i]; i++) {for (var j = 0, children = [], child; child = node.childNodes[j]; j++)
if (child.nodeType == 1 && child.tagName != '!') results.push(child);}
return results;},adjacent: function(nodes) {for (var i = 0, results = [], node; node = nodes[i]; i++) {var next = this.nextElementSibling(node);if (next) results.push(next);}
return results;},laterSibling: function(nodes) {var h = Selector.handlers;for (var i = 0, results = [], node; node = nodes[i]; i++)
h.concat(results, Element.nextSiblings(node));return results;},nextElementSibling: function(node) {while (node = node.nextSibling)
if (node.nodeType == 1) return node;return null;},previousElementSibling: function(node) {while (node = node.previousSibling)
if (node.nodeType == 1) return node;return null;},// TOKEN FUNCTIONS
tagName: function(nodes, root, tagName, combinator) {tagName = tagName.toUpperCase();var results = [], h = Selector.handlers;if (nodes) {if (combinator) {// fastlane for ordinary descendant combinators
if (combinator == "descendant") {for (var i = 0, node; node = nodes[i]; i++)
h.concat(results, node.getElementsByTagName(tagName));return results;} else nodes = this[combinator](nodes);if (tagName == "*") return nodes;}
for (var i = 0, node; node = nodes[i]; i++)
if (node.tagName.toUpperCase() == tagName) results.push(node);return results;} else return root.getElementsByTagName(tagName);},id: function(nodes, root, id, combinator) {var targetNode = $(id), h = Selector.handlers;if (!nodes && root == document) return targetNode ? [targetNode] : [];if (nodes) {if (combinator) {if (combinator == 'child') {for (var i = 0, node; node = nodes[i]; i++)
if (targetNode.parentNode == node) return [targetNode];} else if (combinator == 'descendant') {for (var i = 0, node; node = nodes[i]; i++)
if (Element.descendantOf(targetNode, node)) return [targetNode];} else if (combinator == 'adjacent') {for (var i = 0, node; node = nodes[i]; i++)
if (Selector.handlers.previousElementSibling(targetNode) == node)
return [targetNode];} else nodes = h[combinator](nodes);}
for (var i = 0, node; node = nodes[i]; i++)
if (node == targetNode) return [targetNode];return [];}
return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];},className: function(nodes, root, className, combinator) {if (nodes && combinator) nodes = this[combinator](nodes);return Selector.handlers.byClassName(nodes, root, className);},byClassName: function(nodes, root, className) {if (!nodes) nodes = Selector.handlers.descendant([root]);var needle = ' ' + className + ' ';for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {nodeClassName = node.className;if (nodeClassName.length == 0) continue;if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
results.push(node);}
return results;},attrPresence: function(nodes, root, attr) {var results = [];for (var i = 0, node; node = nodes[i]; i++)
if (Element.hasAttribute(node, attr)) results.push(node);return results;},attr: function(nodes, root, attr, value, operator) {if (!nodes) nodes = root.getElementsByTagName("*");var handler = Selector.operators[operator], results = [];for (var i = 0, node; node = nodes[i]; i++) {var nodeValue = Element.readAttribute(node, attr);if (nodeValue === null) continue;if (handler(nodeValue, value)) results.push(node);}
return results;},pseudo: function(nodes, name, value, root, combinator) {if (nodes && combinator) nodes = this[combinator](nodes);if (!nodes) nodes = root.getElementsByTagName("*");return Selector.pseudos[name](nodes, value, root);}
},pseudos: {'first-child': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++) {if (Selector.handlers.previousElementSibling(node)) continue;results.push(node);}
return results;},'last-child': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++) {if (Selector.handlers.nextElementSibling(node)) continue;results.push(node);}
return results;},'only-child': function(nodes, value, root) {var h = Selector.handlers;for (var i = 0, results = [], node; node = nodes[i]; i++)
if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
results.push(node);return results;},'nth-child':        function(nodes, formula, root) {return Selector.pseudos.nth(nodes, formula, root);},'nth-last-child':   function(nodes, formula, root) {return Selector.pseudos.nth(nodes, formula, root, true);},'nth-of-type':      function(nodes, formula, root) {return Selector.pseudos.nth(nodes, formula, root, false, true);},'nth-last-of-type': function(nodes, formula, root) {return Selector.pseudos.nth(nodes, formula, root, true, true);},'first-of-type':    function(nodes, formula, root) {return Selector.pseudos.nth(nodes, "1", root, false, true);},'last-of-type':     function(nodes, formula, root) {return Selector.pseudos.nth(nodes, "1", root, true, true);},'only-of-type':     function(nodes, formula, root) {var p = Selector.pseudos;return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);},// handles the an+b logic
getIndices: function(a, b, total) {if (a == 0) return b > 0 ? [b] : [];return $R(1, total).inject([], function(memo, i) {if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);return memo;});},// handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
nth: function(nodes, formula, root, reverse, ofType) {if (nodes.length == 0) return [];if (formula == 'even') formula = '2n+0';if (formula == 'odd')  formula = '2n+1';var h = Selector.handlers, results = [], indexed = [], m;h.mark(nodes);for (var i = 0, node; node = nodes[i]; i++) {if (!node.parentNode._counted) {h.index(node.parentNode, reverse, ofType);indexed.push(node.parentNode);}
}
if (formula.match(/^\d+$/)) { // just a number
formula = Number(formula);for (var i = 0, node; node = nodes[i]; i++)
if (node.nodeIndex == formula) results.push(node);} else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
if (m[1] == "-") m[1] = -1;var a = m[1] ? Number(m[1]) : 1;var b = m[2] ? Number(m[2]) : 0;var indices = Selector.pseudos.getIndices(a, b, nodes.length);for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {for (var j = 0; j < l; j++)
if (node.nodeIndex == indices[j]) results.push(node);}
}
h.unmark(nodes);h.unmark(indexed);return results;},'empty': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++) {// IE treats comments as element nodes
if (node.tagName == '!' || (node.firstChild && !node.innerHTML.match(/^\s*$/))) continue;results.push(node);}
return results;},'not': function(nodes, selector, root) {var h = Selector.handlers, selectorType, m;var exclusions = new Selector(selector).findElements(root);h.mark(exclusions);for (var i = 0, results = [], node; node = nodes[i]; i++)
if (!node._counted) results.push(node);h.unmark(exclusions);return results;},'enabled': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++)
if (!node.disabled) results.push(node);return results;},'disabled': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++)
if (node.disabled) results.push(node);return results;},'checked': function(nodes, value, root) {for (var i = 0, results = [], node; node = nodes[i]; i++)
if (node.checked) results.push(node);return results;}
},operators: {'=':  function(nv, v) { return nv == v; },'!=': function(nv, v) { return nv != v; },'^=': function(nv, v) { return nv.startsWith(v); },'$=': function(nv, v) { return nv.endsWith(v); },'*=': function(nv, v) { return nv.include(v); },'~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },'|=': function(nv, v) { return ('-' + nv.toUpperCase() + '-').include('-' + v.toUpperCase() + '-'); }
},matchElements: function(elements, expression) {var matches = new Selector(expression).findElements(), h = Selector.handlers;h.mark(matches);for (var i = 0, results = [], element; element = elements[i]; i++)
if (element._counted) results.push(element);h.unmark(matches);return results;},findElement: function(elements, expression, index) {if (typeof expression == 'number') {index = expression; expression = false;}
return Selector.matchElements(elements, expression || '*')[index || 0];},findChildElements: function(element, expressions) {var exprs = expressions.join(','), expressions = [];exprs.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {expressions.push(m[1].strip());});var results = [], h = Selector.handlers;for (var i = 0, l = expressions.length, selector; i < l; i++) {selector = new Selector(expressions[i].strip());h.concat(results, selector.findElements(element));}
return (l > 1) ? h.unique(results) : results;}
});function $$() {return Selector.findChildElements(document, $A(arguments));}
var Form = {reset: function(form) {$(form).reset();return form;},serializeElements: function(elements, getHash) {var data = elements.inject({}, function(result, element) {if (!element.disabled && element.name) {var key = element.name, value = $(element).getValue();if (value != null) {if (key in result) {if (result[key].constructor != Array) result[key] = [result[key]];result[key].push(value);}
else result[key] = value;}
}
return result;});return getHash ? data : Hash.toQueryString(data);}
};Form.Methods = {serialize: function(form, getHash) {return Form.serializeElements(Form.getElements(form), getHash);},getElements: function(form) {return $A($(form).getElementsByTagName('*')).inject([],function(elements, child) {if (Form.Element.Serializers[child.tagName.toLowerCase()])
elements.push(Element.extend(child));return elements;}
);},getInputs: function(form, typeName, name) {form = $(form);var inputs = form.getElementsByTagName('input');if (!typeName && !name) return $A(inputs).map(Element.extend);for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {var input = inputs[i];if ((typeName && input.type != typeName) || (name && input.name != name))
continue;matchingInputs.push(Element.extend(input));}
return matchingInputs;},disable: function(form) {form = $(form);Form.getElements(form).invoke('disable');return form;},enable: function(form) {form = $(form);Form.getElements(form).invoke('enable');return form;},findFirstElement: function(form) {return $(form).getElements().find(function(element) {return element.type != 'hidden' && !element.disabled &&
['input', 'select', 'textarea'].include(element.tagName.toLowerCase());});},focusFirstElement: function(form) {form = $(form);form.findFirstElement().activate();return form;},request: function(form, options) {form = $(form), options = Object.clone(options || {});var params = options.parameters;options.parameters = form.serialize(true);if (params) {if (typeof params == 'string') params = params.toQueryParams();Object.extend(options.parameters, params);}
if (form.hasAttribute('method') && !options.method)
options.method = form.method;return new Ajax.Request(form.readAttribute('action'), options);}
}
/*--------------------------------------------------------------------------*/
Form.Element = {focus: function(element) {$(element).focus();return element;},select: function(element) {$(element).select();return element;}
}
Form.Element.Methods = {serialize: function(element) {element = $(element);if (!element.disabled && element.name) {var value = element.getValue();if (value != undefined) {var pair = {};pair[element.name] = value;return Hash.toQueryString(pair);}
}
return '';},getValue: function(element) {element = $(element);var method = element.tagName.toLowerCase();return Form.Element.Serializers[method](element);},clear: function(element) {$(element).value = '';return element;},present: function(element) {return $(element).value != '';},activate: function(element) {element = $(element);try {element.focus();if (element.select && (element.tagName.toLowerCase() != 'input' ||
!['button', 'reset', 'submit'].include(element.type)))
element.select();} catch (e) {}
return element;},disable: function(element) {element = $(element);element.blur();element.disabled = true;return element;},enable: function(element) {element = $(element);element.disabled = false;return element;}
}
/*--------------------------------------------------------------------------*/
var Field = Form.Element;var $F = Form.Element.Methods.getValue;/*--------------------------------------------------------------------------*/
Form.Element.Serializers = {input: function(element) {switch (element.type.toLowerCase()) {case 'checkbox':
case 'radio':
return Form.Element.Serializers.inputSelector(element);default:
return Form.Element.Serializers.textarea(element);}
},inputSelector: function(element) {return element.checked ? element.value : null;},textarea: function(element) {return element.value;},select: function(element) {return this[element.type == 'select-one' ?
'selectOne' : 'selectMany'](element);},selectOne: function(element) {var index = element.selectedIndex;return index >= 0 ? this.optionValue(element.options[index]) : null;},selectMany: function(element) {var values, length = element.length;if (!length) return null;for (var i = 0, values = []; i < length; i++) {var opt = element.options[i];if (opt.selected) values.push(this.optionValue(opt));}
return values;},optionValue: function(opt) {// extend element because hasAttribute may not be native
return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;}
}
/*--------------------------------------------------------------------------*/
Abstract.TimedObserver = function() {}
Abstract.TimedObserver.prototype = {initialize: function(element, frequency, callback) {this.frequency = frequency;this.element   = $(element);this.callback  = callback;this.lastValue = this.getValue();this.registerCallback();},registerCallback: function() {setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);},onTimerEvent: function() {var value = this.getValue();var changed = ('string' == typeof this.lastValue && 'string' == typeof value
? this.lastValue != value : String(this.lastValue) != String(value));if (changed) {this.callback(this.element, value);this.lastValue = value;}
}
}
Form.Element.Observer = Class.create();Form.Element.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {getValue: function() {return Form.Element.getValue(this.element);}
});Form.Observer = Class.create();Form.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {getValue: function() {return Form.serialize(this.element);}
});/*--------------------------------------------------------------------------*/
Abstract.EventObserver = function() {}
Abstract.EventObserver.prototype = {initialize: function(element, callback) {this.element  = $(element);this.callback = callback;this.lastValue = this.getValue();if (this.element.tagName.toLowerCase() == 'form')
this.registerFormCallbacks();else
this.registerCallback(this.element);},onElementEvent: function() {var value = this.getValue();if (this.lastValue != value) {this.callback(this.element, value);this.lastValue = value;}
},registerFormCallbacks: function() {Form.getElements(this.element).each(this.registerCallback.bind(this));},registerCallback: function(element) {if (element.type) {switch (element.type.toLowerCase()) {case 'checkbox':
case 'radio':
Event.observe(element, 'click', this.onElementEvent.bind(this));break;default:
Event.observe(element, 'change', this.onElementEvent.bind(this));break;}
}
}
}
Form.Element.EventObserver = Class.create();Form.Element.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {getValue: function() {return Form.Element.getValue(this.element);}
});Form.EventObserver = Class.create();Form.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {getValue: function() {return Form.serialize(this.element);}
});if (!window.Event) {var Event = new Object();}
Object.extend(Event, {KEY_BACKSPACE: 8,KEY_TAB:       9,KEY_RETURN:   13,KEY_ESC:      27,KEY_LEFT:     37,KEY_UP:       38,KEY_RIGHT:    39,KEY_DOWN:     40,KEY_DELETE:   46,KEY_HOME:     36,KEY_END:      35,KEY_PAGEUP:   33,KEY_PAGEDOWN: 34,element: function(event) {return $(event.target || event.srcElement);},isLeftClick: function(event) {return (((event.which) && (event.which == 1)) ||
((event.button) && (event.button == 1)));},pointerX: function(event) {return event.pageX || (event.clientX +
(document.documentElement.scrollLeft || document.body.scrollLeft));},pointerY: function(event) {return event.pageY || (event.clientY +
(document.documentElement.scrollTop || document.body.scrollTop));},stop: function(event) {if (event.preventDefault) {event.preventDefault();event.stopPropagation();} else {event.returnValue = false;event.cancelBubble = true;}
},// find the first node with the given tagName, starting from the
findElement: function(event, tagName) {var element = Event.element(event);while (element.parentNode && (!element.tagName ||
(element.tagName.toUpperCase() != tagName.toUpperCase())))
element = element.parentNode;return element;},observers: false,_observeAndCache: function(element, name, observer, useCapture) {if (!this.observers) this.observers = [];if (element.addEventListener) {this.observers.push([element, name, observer, useCapture]);element.addEventListener(name, observer, useCapture);} else if (element.attachEvent) {this.observers.push([element, name, observer, useCapture]);element.attachEvent('on' + name, observer);}
},unloadCache: function() {if (!Event.observers) return;for (var i = 0, length = Event.observers.length; i < length; i++) {Event.stopObserving.apply(this, Event.observers[i]);Event.observers[i][0] = null;}
Event.observers = false;},observe: function(element, name, observer, useCapture) {element = $(element);useCapture = useCapture || false;if (name == 'keypress' &&
(Prototype.Browser.WebKit || element.attachEvent))
name = 'keydown';Event._observeAndCache(element, name, observer, useCapture);},stopObserving: function(element, name, observer, useCapture) {element = $(element);useCapture = useCapture || false;if (name == 'keypress' &&
(Prototype.Browser.WebKit || element.attachEvent))
name = 'keydown';if (element.removeEventListener) {element.removeEventListener(name, observer, useCapture);} else if (element.detachEvent) {try {element.detachEvent('on' + name, observer);} catch (e) {}
}
}
});/* prevent memory leaks in IE */
if (Prototype.Browser.IE)
Event.observe(window, 'unload', Event.unloadCache, false);var Position = {// set to true if needed, warning: firefox performance problems
includeScrollOffsets: false,// must be called before calling withinIncludingScrolloffset, every time the
prepare: function() {this.deltaX =  window.pageXOffset
|| document.documentElement.scrollLeft
|| document.body.scrollLeft
|| 0;this.deltaY =  window.pageYOffset
|| document.documentElement.scrollTop
|| document.body.scrollTop
|| 0;},realOffset: function(element) {var valueT = 0, valueL = 0;do {valueT += element.scrollTop  || 0;valueL += element.scrollLeft || 0;element = element.parentNode;} while (element);return [valueL, valueT];},cumulativeOffset: function(element) {var valueT = 0, valueL = 0;do {valueT += element.offsetTop  || 0;valueL += element.offsetLeft || 0;element = element.offsetParent;} while (element);return [valueL, valueT];},positionedOffset: function(element) {var valueT = 0, valueL = 0;do {valueT += element.offsetTop  || 0;valueL += element.offsetLeft || 0;element = element.offsetParent;if (element) {if(element.tagName=='BODY') break;var p = Element.getStyle(element, 'position');if (p == 'relative' || p == 'absolute') break;}
} while (element);return [valueL, valueT];},offsetParent: function(element) {if (element.offsetParent) return element.offsetParent;if (element == document.body) return element;while ((element = element.parentNode) && element != document.body)
if (Element.getStyle(element, 'position') != 'static')
return element;return document.body;},// caches x/y coordinate pair to use with overlap
within: function(element, x, y) {if (this.includeScrollOffsets)
return this.withinIncludingScrolloffsets(element, x, y);this.xcomp = x;this.ycomp = y;this.offset = this.cumulativeOffset(element);return (y >= this.offset[1] &&
y <  this.offset[1] + element.offsetHeight &&
x >= this.offset[0] &&
x <  this.offset[0] + element.offsetWidth);},withinIncludingScrolloffsets: function(element, x, y) {var offsetcache = this.realOffset(element);this.xcomp = x + offsetcache[0] - this.deltaX;this.ycomp = y + offsetcache[1] - this.deltaY;this.offset = this.cumulativeOffset(element);return (this.ycomp >= this.offset[1] &&
this.ycomp <  this.offset[1] + element.offsetHeight &&
this.xcomp >= this.offset[0] &&
this.xcomp <  this.offset[0] + element.offsetWidth);},// within must be called directly before
overlap: function(mode, element) {if (!mode) return 0;if (mode == 'vertical')
return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
element.offsetHeight;if (mode == 'horizontal')
return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
element.offsetWidth;},page: function(forElement) {var valueT = 0, valueL = 0;var element = forElement;do {valueT += element.offsetTop  || 0;valueL += element.offsetLeft || 0;// Safari fix
if (element.offsetParent == document.body)
if (Element.getStyle(element,'position')=='absolute') break;} while (element = element.offsetParent);element = forElement;do {if (!window.opera || element.tagName=='BODY') {valueT -= element.scrollTop  || 0;valueL -= element.scrollLeft || 0;}
} while (element = element.parentNode);return [valueL, valueT];},clone: function(source, target) {var options = Object.extend({setLeft:    true,setTop:     true,setWidth:   true,setHeight:  true,offsetTop:  0,offsetLeft: 0
}, arguments[2] || {})
source = $(source);var p = Position.page(source);// find coordinate system to use
target = $(target);var delta = [0, 0];var parent = null;// delta [0,0] will do fine with position: fixed elements,// position:absolute needs offsetParent deltas
if (Element.getStyle(target,'position') == 'absolute') {parent = Position.offsetParent(target);delta = Position.page(parent);}
if (parent == document.body) {delta[0] -= document.body.offsetLeft;delta[1] -= document.body.offsetTop;}
if(options.setLeft)   target.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';if(options.setTop)    target.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';if(options.setWidth)  target.style.width = source.offsetWidth + 'px';if(options.setHeight) target.style.height = source.offsetHeight + 'px';},absolutize: function(element) {element = $(element);if (element.style.position == 'absolute') return;Position.prepare();var offsets = Position.positionedOffset(element);var top     = offsets[1];var left    = offsets[0];var width   = element.clientWidth;var height  = element.clientHeight;element._originalLeft   = left - parseFloat(element.style.left  || 0);element._originalTop    = top  - parseFloat(element.style.top || 0);element._originalWidth  = element.style.width;element._originalHeight = element.style.height;element.style.position = 'absolute';element.style.top    = top + 'px';element.style.left   = left + 'px';element.style.width  = width + 'px';element.style.height = height + 'px';},relativize: function(element) {element = $(element);if (element.style.position == 'relative') return;Position.prepare();element.style.position = 'relative';var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);element.style.top    = top + 'px';element.style.left   = left + 'px';element.style.height = element._originalHeight;element.style.width  = element._originalWidth;}
}
if (Prototype.Browser.WebKit) {Position.cumulativeOffset = function(element) {var valueT = 0, valueL = 0;do {valueT += element.offsetTop  || 0;valueL += element.offsetLeft || 0;if (element.offsetParent == document.body)
if (Element.getStyle(element, 'position') == 'absolute') break;element = element.offsetParent;} while (element);return [valueL, valueT];}
}
Element.addMethods();
/************************************
*
* An add-on to Prototype 1.5 to speed up the $$ function in usual cases.
*
* http://www.sylvainzimmer.com/index.php/archives/2006/06/25/speeding-up-prototypes-selector/
* 
* Authors: 
*    - Sylvain ZIMMER <sylvain _at_ jamendo.com>
*
* Changelog:
*   v1 (2006/06/25)
*     - Initial release
*
* License: AS-IS
*
* Trivia: Check out www.jamendo.com for some great Creative Commons music ;-)
*
************************************/
var SelectorLiteAddon=Class.create();
SelectorLiteAddon.prototype = {
initialize: function(stack) {
this.r=[]; //results
this.s=[]; //stack of selectors
this.i=0;  //stack pointer
for (var i=stack.length-1;i>=0;i--) {
var s=["*","",[]]; 
var t=stack[i];
var cursor=t.length-1;
do {
var d=t.lastIndexOf("#");
var p=t.lastIndexOf(".");
cursor=Math.max(d,p);
if (cursor==-1) {
s[0]=t.toUpperCase();
} else if (d==-1 || p==cursor) {
s[2].push(t.substring(p+1));
} else if (!s[1]) {
s[1]=t.substring(d+1);
}
t=t.substring(0,cursor);
} while (cursor>0);
this.s[i]=s;
}
},
get:function(root) {
this.explore(root || document,this.i==(this.s.length-1));
return this.r;
},
explore:function(elt,leaf) {
var s=this.s[this.i];
var r=[];
if (s[1]) {
e=$(s[1]);      
if (e && (s[0]=="*" || e.tagName==s[0]) && e.childOf(elt)) {
r=[e];
}
} else {
r=$A(elt.getElementsByTagName(s[0]));
}
if (s[2].length==1) { //single classname
r=r.findAll(function(o) {
if (o.className.indexOf(" ")==-1) {
return o.className==s[2][0];
} else {
return o.className.split(/\s+/).include(s[2][0]);
}
});
} else if (s[2].length>0) {
r=r.findAll(function(o) {
if (o.className.indexOf(" ")==-1) { 
return false;
} else {
var q=o.className.split(/\s+/);
return s[2].all(function(c) {
return q.include(c);
});
}
});
}
if (leaf) {
this.r=this.r.concat(r);
} else {
++this.i;
r.each(function(o) {
this.explore(o,this.i==(this.s.length-1));
}.bind(this));
}
}
}
var $$old=$$;
var $$=function(a,b) {
if (b || a.indexOf("[")>=0) return $$old.apply(this,arguments);
return new SelectorLiteAddon(a.split(/\s+/)).get();
}
var Builder = {NODEMAP: {AREA: 'map',CAPTION: 'table',COL: 'table',COLGROUP: 'table',LEGEND: 'fieldset',OPTGROUP: 'select',OPTION: 'select',PARAM: 'object',TBODY: 'table',TD: 'table',TFOOT: 'table',TH: 'table',THEAD: 'table',TR: 'table'
},// note: For Firefox < 1.5, OPTION and OPTGROUP tags are currently broken,//       due to a Firefox bug
node: function(elementName) {elementName = elementName.toUpperCase();// try innerHTML approach
var parentTag = this.NODEMAP[elementName] || 'div';var parentElement = document.createElement(parentTag);try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
parentElement.innerHTML = "<" + elementName + "></" + elementName + ">";} catch(e) {}
var element = parentElement.firstChild || null;// see if browser added wrapping tags
if(element && (element.tagName.toUpperCase() != elementName))
element = element.getElementsByTagName(elementName)[0];// fallback to createElement approach
if(!element) element = document.createElement(elementName);// abort if nothing could be created
if(!element) return;// attributes (or text)
if(arguments[1])
if(this._isStringOrNumber(arguments[1]) ||
(arguments[1] instanceof Array) ||
arguments[1].tagName) {this._children(element, arguments[1]);} else {var attrs = this._attributes(arguments[1]);if(attrs.length) {try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
parentElement.innerHTML = "<" +elementName + " " +
attrs + "></" + elementName + ">";} catch(e) {}
element = parentElement.firstChild || null;// workaround firefox 1.0.X bug
if(!element) {element = document.createElement(elementName);for(attr in arguments[1]) 
element[attr == 'class' ? 'className' : attr] = arguments[1][attr];}
if(element.tagName.toUpperCase() != elementName)
element = parentElement.getElementsByTagName(elementName)[0];}
} 
if(arguments[2])
this._children(element, arguments[2]);return element;},_text: function(text) {return document.createTextNode(text);},ATTR_MAP: {'className': 'class','htmlFor': 'for'
},_attributes: function(attributes) {var attrs = [];for(attribute in attributes)
attrs.push((attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute) +
'="' + attributes[attribute].toString().escapeHTML().gsub(/"/,'&quot;') + '"');return attrs.join(" ");},_children: function(element, children) {if(children.tagName) {element.appendChild(children);return;}
if(typeof children=='object') { // array can hold nodes and text
children.flatten().each( function(e) {if(typeof e=='object')
element.appendChild(e)
else
if(Builder._isStringOrNumber(e))
element.appendChild(Builder._text(e));});} else
if(Builder._isStringOrNumber(children))
element.appendChild(Builder._text(children));},_isStringOrNumber: function(param) {return(typeof param=='string' || typeof param=='number');},build: function(html) {var element = this.node('div');$(element).update(html.strip());return element.down();},dump: function(scope) { 
if(typeof scope != 'object' && typeof scope != 'function') scope = window; //global scope 
var tags = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " +
"BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " +
"FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX "+
"KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P "+
"PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD "+
"TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);tags.each( function(tag){ 
scope[tag] = function() { 
return Builder.node.apply(Builder, [tag].concat($A(arguments)));  
} 
});}
}
String.prototype.parseColor = function() {  
var color = '#';if(this.slice(0,4) == 'rgb(') {  
var cols = this.slice(4,this.length-1).split(',');  
var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);  
} else {  
if(this.slice(0,1) == '#') {  
if(this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();  
if(this.length==7) color = this.toLowerCase();  
}  
}  
return(color.length==7 ? color : (arguments[0] || this));  
}
/*--------------------------------------------------------------------------*/
Element.collectTextNodes = function(element) {  
return $A($(element).childNodes).collect( function(node) {return (node.nodeType==3 ? node.nodeValue : 
(node.hasChildNodes() ? Element.collectTextNodes(node) : ''));}).flatten().join('');}
Element.collectTextNodesIgnoreClass = function(element, className) {  
return $A($(element).childNodes).collect( function(node) {return (node.nodeType==3 ? node.nodeValue : 
((node.hasChildNodes() && !Element.hasClassName(node,className)) ? 
Element.collectTextNodesIgnoreClass(node, className) : ''));}).flatten().join('');}
Element.setContentZoom = function(element, percent) {element = $(element);  
element.setStyle({fontSize: (percent/100) + 'em'});   
if(Prototype.Browser.WebKit) window.scrollBy(0,0);return element;}
Element.getInlineOpacity = function(element){return $(element).style.opacity || '';}
Element.forceRerendering = function(element) {try {element = $(element);var n = document.createTextNode(' ');element.appendChild(n);element.removeChild(n);} catch(e) { }
};/*--------------------------------------------------------------------------*/
Array.prototype.call = function() {var args = arguments;this.each(function(f){ f.apply(this, args) });}
/*--------------------------------------------------------------------------*/
var Effect = {_elementDoesNotExistError: {name: 'ElementDoesNotExistError',message: 'The specified DOM element does not exist, but is required for this effect to operate'
},tagifyText: function(element) {if(typeof Builder == 'undefined')
throw("Effect.tagifyText requires including script.aculo.us' builder.js library");var tagifyStyle = 'position:relative';if(Prototype.Browser.IE) tagifyStyle += ';zoom:1';element = $(element);$A(element.childNodes).each( function(child) {if(child.nodeType==3) {child.nodeValue.toArray().each( function(character) {element.insertBefore(
Builder.node('span',{style: tagifyStyle},character == ' ' ? String.fromCharCode(160) : character), 
child);});Element.remove(child);}
});},multiple: function(element, effect) {var elements;if(((typeof element == 'object') || 
(typeof element == 'function')) && 
(element.length))
elements = element;else
elements = $(element).childNodes;var options = Object.extend({speed: 0.1,delay: 0.0
}, arguments[2] || {});var masterDelay = options.delay;$A(elements).each( function(element, index) {new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));});},PAIRS: {'slide':  ['SlideDown','SlideUp'],'blind':  ['BlindDown','BlindUp'],'appear': ['Appear','Fade']
},toggle: function(element, effect) {element = $(element);effect = (effect || 'appear').toLowerCase();var options = Object.extend({queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
}, arguments[2] || {});Effect[element.visible() ? 
Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);}
};var Effect2 = Effect; // deprecated
/* ------------- transitions ------------- */
Effect.Transitions = {linear: Prototype.K,sinoidal: function(pos) {return (-Math.cos(pos*Math.PI)/2) + 0.5;},reverse: function(pos) {return 1-pos;},flicker: function(pos) {var pos = ((-Math.cos(pos*Math.PI)/4) + 0.75) + Math.random()/4;return (pos > 1 ? 1 : pos);},wobble: function(pos) {return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;},pulse: function(pos, pulses) { 
pulses = pulses || 5; 
return (
Math.round((pos % (1/pulses)) * pulses) == 0 ? 
((pos * pulses * 2) - Math.floor(pos * pulses * 2)) : 
1 - ((pos * pulses * 2) - Math.floor(pos * pulses * 2))
);},none: function(pos) {return 0;},full: function(pos) {return 1;}
};/* ------------- core effects ------------- */
Effect.ScopedQueue = Class.create();Object.extend(Object.extend(Effect.ScopedQueue.prototype, Enumerable), {initialize: function() {this.effects  = [];this.interval = null;    
},_each: function(iterator) {this.effects._each(iterator);},add: function(effect) {var timestamp = new Date().getTime();var position = (typeof effect.options.queue == 'string') ? 
effect.options.queue : effect.options.queue.position;switch(position) {case 'front':
this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {e.startOn  += effect.finishOn;e.finishOn += effect.finishOn;});break;case 'with-last':
timestamp = this.effects.pluck('startOn').max() || timestamp;break;case 'end':
timestamp = this.effects.pluck('finishOn').max() || timestamp;break;}
effect.startOn  += timestamp;effect.finishOn += timestamp;if(!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
this.effects.push(effect);if(!this.interval)
this.interval = setInterval(this.loop.bind(this), 15);},remove: function(effect) {this.effects = this.effects.reject(function(e) { return e==effect });if(this.effects.length == 0) {clearInterval(this.interval);this.interval = null;}
},loop: function() {var timePos = new Date().getTime();for(var i=0, len=this.effects.length;i<len;i++) 
this.effects[i] && this.effects[i].loop(timePos);}
});Effect.Queues = {instances: $H(),get: function(queueName) {if(typeof queueName != 'string') return queueName;if(!this.instances[queueName])
this.instances[queueName] = new Effect.ScopedQueue();return this.instances[queueName];}
}
Effect.Queue = Effect.Queues.get('global');Effect.DefaultOptions = {transition: Effect.Transitions.sinoidal,duration:   1.0,   // seconds
fps:        100,   // 100= assume 66fps max.
sync:       false, // true for combining
from:       0.0,to:         1.0,delay:      0.0,queue:      'parallel'
}
Effect.Base = function() {};Effect.Base.prototype = {position: null,start: function(options) {function codeForEvent(options,eventName){return (
(options[eventName+'Internal'] ? 'this.options.'+eventName+'Internal(this);' : '') +
(options[eventName] ? 'this.options.'+eventName+'(this);' : '')
);}
if(options.transition === false) options.transition = Effect.Transitions.linear;this.options      = Object.extend(Object.extend({},Effect.DefaultOptions), options || {});this.currentFrame = 0;this.state        = 'idle';this.startOn      = this.options.delay*1000;this.finishOn     = this.startOn+(this.options.duration*1000);this.fromToDelta  = this.options.to-this.options.from;this.totalTime    = this.finishOn-this.startOn;this.totalFrames  = this.options.fps*this.options.duration;eval('this.render = function(pos){ '+
'if(this.state=="idle"){this.state="running";'+
codeForEvent(options,'beforeSetup')+
(this.setup ? 'this.setup();':'')+ 
codeForEvent(options,'afterSetup')+
'};if(this.state=="running"){'+
'pos=this.options.transition(pos)*'+this.fromToDelta+'+'+this.options.from+';'+
'this.position=pos;'+
codeForEvent(options,'beforeUpdate')+
(this.update ? 'this.update(pos);':'')+
codeForEvent(options,'afterUpdate')+
'}}');this.event('beforeStart');if(!this.options.sync)
Effect.Queues.get(typeof this.options.queue == 'string' ? 
'global' : this.options.queue.scope).add(this);},loop: function(timePos) {if(timePos >= this.startOn) {if(timePos >= this.finishOn) {this.render(1.0);this.cancel();this.event('beforeFinish');if(this.finish) this.finish(); 
this.event('afterFinish');return;  
}
var pos   = (timePos - this.startOn) / this.totalTime,frame = Math.round(pos * this.totalFrames);if(frame > this.currentFrame) {this.render(pos);this.currentFrame = frame;}
}
},cancel: function() {if(!this.options.sync)
Effect.Queues.get(typeof this.options.queue == 'string' ? 
'global' : this.options.queue.scope).remove(this);this.state = 'finished';},event: function(eventName) {if(this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);if(this.options[eventName]) this.options[eventName](this);},inspect: function() {var data = $H();for(property in this)
if(typeof this[property] != 'function') data[property] = this[property];return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';}
}
Effect.Parallel = Class.create();Object.extend(Object.extend(Effect.Parallel.prototype, Effect.Base.prototype), {initialize: function(effects) {this.effects = effects || [];this.start(arguments[1]);},update: function(position) {this.effects.invoke('render', position);},finish: function(position) {this.effects.each( function(effect) {effect.render(1.0);effect.cancel();effect.event('beforeFinish');if(effect.finish) effect.finish(position);effect.event('afterFinish');});}
});Effect.Event = Class.create();Object.extend(Object.extend(Effect.Event.prototype, Effect.Base.prototype), {initialize: function() {var options = Object.extend({duration: 0
}, arguments[0] || {});this.start(options);},update: Prototype.emptyFunction
});Effect.Opacity = Class.create();Object.extend(Object.extend(Effect.Opacity.prototype, Effect.Base.prototype), {initialize: function(element) {this.element = $(element);if(!this.element) throw(Effect._elementDoesNotExistError);// make this work on IE on elements without 'layout'
if(Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
this.element.setStyle({zoom: 1});var options = Object.extend({from: this.element.getOpacity() || 0.0,to:   1.0
}, arguments[1] || {});this.start(options);},update: function(position) {this.element.setOpacity(position);}
});Effect.Move = Class.create();Object.extend(Object.extend(Effect.Move.prototype, Effect.Base.prototype), {initialize: function(element) {this.element = $(element);if(!this.element) throw(Effect._elementDoesNotExistError);var options = Object.extend({x:    0,y:    0,mode: 'relative'
}, arguments[1] || {});this.start(options);},setup: function() {// Bug in Opera: Opera returns the "real" position of a static element or
this.element.makePositioned();this.originalLeft = parseFloat(this.element.getStyle('left') || '0');this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');if(this.options.mode == 'absolute') {// absolute movement, so we need to calc deltaX and deltaY
this.options.x = this.options.x - this.originalLeft;this.options.y = this.options.y - this.originalTop;}
},update: function(position) {this.element.setStyle({left: Math.round(this.options.x  * position + this.originalLeft) + 'px',top:  Math.round(this.options.y  * position + this.originalTop)  + 'px'
});}
});// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {return new Effect.Move(element, 
Object.extend({ x: toLeft, y: toTop }, arguments[3] || {}));};Effect.Scale = Class.create();Object.extend(Object.extend(Effect.Scale.prototype, Effect.Base.prototype), {initialize: function(element, percent) {this.element = $(element);if(!this.element) throw(Effect._elementDoesNotExistError);var options = Object.extend({scaleX: true,scaleY: true,scaleContent: true,scaleFromCenter: false,scaleMode: 'box',        // 'box' or 'contents' or {} with provided values
scaleFrom: 100.0,scaleTo:   percent
}, arguments[2] || {});this.start(options);},setup: function() {this.restoreAfterFinish = this.options.restoreAfterFinish || false;this.elementPositioning = this.element.getStyle('position');this.originalStyle = {};['top','left','width','height','fontSize'].each( function(k) {this.originalStyle[k] = this.element.style[k];}.bind(this));this.originalTop  = this.element.offsetTop;this.originalLeft = this.element.offsetLeft;var fontSize = this.element.getStyle('font-size') || '100%';['em','px','%','pt'].each( function(fontSizeType) {if(fontSize.indexOf(fontSizeType)>0) {this.fontSize     = parseFloat(fontSize);this.fontSizeType = fontSizeType;}
}.bind(this));this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;this.dims = null;if(this.options.scaleMode=='box')
this.dims = [this.element.offsetHeight, this.element.offsetWidth];if(/^content/.test(this.options.scaleMode))
this.dims = [this.element.scrollHeight, this.element.scrollWidth];if(!this.dims)
this.dims = [this.options.scaleMode.originalHeight,this.options.scaleMode.originalWidth];},update: function(position) {var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);if(this.options.scaleContent && this.fontSize)
this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);},finish: function(position) {if(this.restoreAfterFinish) this.element.setStyle(this.originalStyle);},setDimensions: function(height, width) {var d = {};if(this.options.scaleX) d.width = Math.round(width) + 'px';if(this.options.scaleY) d.height = Math.round(height) + 'px';if(this.options.scaleFromCenter) {var topd  = (height - this.dims[0])/2;var leftd = (width  - this.dims[1])/2;if(this.elementPositioning == 'absolute') {if(this.options.scaleY) d.top = this.originalTop-topd + 'px';if(this.options.scaleX) d.left = this.originalLeft-leftd + 'px';} else {if(this.options.scaleY) d.top = -topd + 'px';if(this.options.scaleX) d.left = -leftd + 'px';}
}
this.element.setStyle(d);}
});Effect.Highlight = Class.create();Object.extend(Object.extend(Effect.Highlight.prototype, Effect.Base.prototype), {initialize: function(element) {this.element = $(element);if(!this.element) throw(Effect._elementDoesNotExistError);var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || {});this.start(options);},setup: function() {// Prevent executing on elements not in the layout flow
if(this.element.getStyle('display')=='none') { this.cancel(); return; }
this.oldStyle = {};if (!this.options.keepBackgroundImage) {this.oldStyle.backgroundImage = this.element.getStyle('background-image');this.element.setStyle({backgroundImage: 'none'});}
if(!this.options.endcolor)
this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');if(!this.options.restorecolor)
this.options.restorecolor = this.element.getStyle('background-color');// init color calculations
this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));},update: function(position) {this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){return m+(Math.round(this._base[i]+(this._delta[i]*position)).toColorPart()); }.bind(this)) });},finish: function() {this.element.setStyle(Object.extend(this.oldStyle, {backgroundColor: this.options.restorecolor
}));}
});Effect.ScrollTo = Class.create();Object.extend(Object.extend(Effect.ScrollTo.prototype, Effect.Base.prototype), {initialize: function(element) {this.element = $(element);this.start(arguments[1] || {});},setup: function() {Position.prepare();var offsets = Position.cumulativeOffset(this.element);if(this.options.offset) offsets[1] += this.options.offset;var max = window.innerHeight ? 
window.height - window.innerHeight :
document.body.scrollHeight - 
(document.documentElement.clientHeight ? 
document.documentElement.clientHeight : document.body.clientHeight);this.scrollStart = Position.deltaY;this.delta = (offsets[1] > max ? max : offsets[1]) - this.scrollStart;},update: function(position) {Position.prepare();window.scrollTo(Position.deltaX, 
this.scrollStart + (position*this.delta));}
});/* ------------- combination effects ------------- */
Effect.Fade = function(element) {element = $(element);var oldOpacity = element.getInlineOpacity();var options = Object.extend({from: element.getOpacity() || 1.0,to:   0.0,afterFinishInternal: function(effect) { 
if(effect.options.to!=0) return;effect.element.hide().setStyle({opacity: oldOpacity}); 
}}, arguments[1] || {});return new Effect.Opacity(element,options);}
Effect.Appear = function(element) {element = $(element);var options = Object.extend({from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),to:   1.0,// force Safari to render floated elements properly
afterFinishInternal: function(effect) {effect.element.forceRerendering();},beforeSetup: function(effect) {effect.element.setOpacity(effect.options.from).show(); 
}}, arguments[1] || {});return new Effect.Opacity(element,options);}
Effect.Puff = function(element) {element = $(element);var oldStyle = { 
opacity: element.getInlineOpacity(), 
position: element.getStyle('position'),top:  element.style.top,left: element.style.left,width: element.style.width,height: element.style.height
};return new Effect.Parallel(
[ new Effect.Scale(element, 200, 
{ sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }), 
new Effect.Opacity(element, { sync: true, to: 0.0 } ) ], 
Object.extend({ duration: 1.0, 
beforeSetupInternal: function(effect) {Position.absolutize(effect.effects[0].element)
},afterFinishInternal: function(effect) {effect.effects[0].element.hide().setStyle(oldStyle); }
}, arguments[1] || {})
);}
Effect.BlindUp = function(element) {element = $(element);element.makeClipping();return new Effect.Scale(element, 0,Object.extend({ scaleContent: false, 
scaleX: false, 
restoreAfterFinish: true,afterFinishInternal: function(effect) {effect.element.hide().undoClipping();} 
}, arguments[1] || {})
);}
Effect.BlindDown = function(element) {element = $(element);var elementDimensions = element.getDimensions();return new Effect.Scale(element, 100, Object.extend({ 
scaleContent: false, 
scaleX: false,scaleFrom: 0,scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},restoreAfterFinish: true,afterSetup: function(effect) {effect.element.makeClipping().setStyle({height: '0px'}).show(); 
},  
afterFinishInternal: function(effect) {effect.element.undoClipping();}
}, arguments[1] || {}));}
Effect.SwitchOff = function(element) {element = $(element);var oldOpacity = element.getInlineOpacity();return new Effect.Appear(element, Object.extend({duration: 0.4,from: 0,transition: Effect.Transitions.flicker,afterFinishInternal: function(effect) {new Effect.Scale(effect.element, 1, { 
duration: 0.3, scaleFromCenter: true,scaleX: false, scaleContent: false, restoreAfterFinish: true,beforeSetup: function(effect) { 
effect.element.makePositioned().makeClipping();},afterFinishInternal: function(effect) {effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});}
})
}
}, arguments[1] || {}));}
Effect.DropOut = function(element) {element = $(element);var oldStyle = {top: element.getStyle('top'),left: element.getStyle('left'),opacity: element.getInlineOpacity() };return new Effect.Parallel(
[ new Effect.Move(element, {x: 0, y: 100, sync: true }), 
new Effect.Opacity(element, { sync: true, to: 0.0 }) ],Object.extend(
{ duration: 0.5,beforeSetup: function(effect) {effect.effects[0].element.makePositioned(); 
},afterFinishInternal: function(effect) {effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);} 
}, arguments[1] || {}));}
Effect.Shake = function(element) {element = $(element);var oldStyle = {top: element.getStyle('top'),left: element.getStyle('left') };return new Effect.Move(element, 
{ x:  20, y: 0, duration: 0.05, afterFinishInternal: function(effect) {new Effect.Move(effect.element,{ x: -40, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {new Effect.Move(effect.element,{ x:  40, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {new Effect.Move(effect.element,{ x: -40, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {new Effect.Move(effect.element,{ x:  40, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {new Effect.Move(effect.element,{ x: -20, y: 0, duration: 0.05, afterFinishInternal: function(effect) {effect.element.undoPositioned().setStyle(oldStyle);}}) }}) }}) }}) }}) }});}
Effect.SlideDown = function(element) {element = $(element).cleanWhitespace();// SlideDown need to have the content of the element wrapped in a container element with fixed height!
var oldInnerBottom = element.down().getStyle('bottom');var elementDimensions = element.getDimensions();return new Effect.Scale(element, 100, Object.extend({ 
scaleContent: false, 
scaleX: false, 
scaleFrom: window.opera ? 0 : 1,scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},restoreAfterFinish: true,afterSetup: function(effect) {effect.element.makePositioned();effect.element.down().makePositioned();if(window.opera) effect.element.setStyle({top: ''});effect.element.makeClipping().setStyle({height: '0px'}).show(); 
},afterUpdateInternal: function(effect) {effect.element.down().setStyle({bottom:
(effect.dims[0] - effect.element.clientHeight) + 'px' }); 
},afterFinishInternal: function(effect) {effect.element.undoClipping().undoPositioned();effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
}, arguments[1] || {})
);}
Effect.SlideUp = function(element) {element = $(element).cleanWhitespace();var oldInnerBottom = element.down().getStyle('bottom');return new Effect.Scale(element, window.opera ? 0 : 1,Object.extend({ scaleContent: false, 
scaleX: false, 
scaleMode: 'box',scaleFrom: 100,restoreAfterFinish: true,beforeStartInternal: function(effect) {effect.element.makePositioned();effect.element.down().makePositioned();if(window.opera) effect.element.setStyle({top: ''});effect.element.makeClipping().show();},  
afterUpdateInternal: function(effect) {effect.element.down().setStyle({bottom:
(effect.dims[0] - effect.element.clientHeight) + 'px' });},afterFinishInternal: function(effect) {effect.element.hide().undoClipping().undoPositioned().setStyle({bottom: oldInnerBottom});effect.element.down().undoPositioned();}
}, arguments[1] || {})
);}
Effect.Squish = function(element) {return new Effect.Scale(element, window.opera ? 1 : 0, { 
restoreAfterFinish: true,beforeSetup: function(effect) {effect.element.makeClipping(); 
},  
afterFinishInternal: function(effect) {effect.element.hide().undoClipping(); 
}
});}
Effect.Grow = function(element) {element = $(element);var options = Object.extend({direction: 'center',moveTransition: Effect.Transitions.sinoidal,scaleTransition: Effect.Transitions.sinoidal,opacityTransition: Effect.Transitions.full
}, arguments[1] || {});var oldStyle = {top: element.style.top,left: element.style.left,height: element.style.height,width: element.style.width,opacity: element.getInlineOpacity() };var dims = element.getDimensions();    
var initialMoveX, initialMoveY;var moveX, moveY;switch (options.direction) {case 'top-left':
initialMoveX = initialMoveY = moveX = moveY = 0; 
break;case 'top-right':
initialMoveX = dims.width;initialMoveY = moveY = 0;moveX = -dims.width;break;case 'bottom-left':
initialMoveX = moveX = 0;initialMoveY = dims.height;moveY = -dims.height;break;case 'bottom-right':
initialMoveX = dims.width;initialMoveY = dims.height;moveX = -dims.width;moveY = -dims.height;break;case 'center':
initialMoveX = dims.width / 2;initialMoveY = dims.height / 2;moveX = -dims.width / 2;moveY = -dims.height / 2;break;}
return new Effect.Move(element, {x: initialMoveX,y: initialMoveY,duration: 0.01, 
beforeSetup: function(effect) {effect.element.hide().makeClipping().makePositioned();},afterFinishInternal: function(effect) {new Effect.Parallel(
[ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),new Effect.Scale(effect.element, 100, {scaleMode: { originalHeight: dims.height, originalWidth: dims.width }, 
sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
], Object.extend({beforeSetup: function(effect) {effect.effects[0].element.setStyle({height: '0px'}).show(); 
},afterFinishInternal: function(effect) {effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle); 
}
}, options)
)
}
});}
Effect.Shrink = function(element) {element = $(element);var options = Object.extend({direction: 'center',moveTransition: Effect.Transitions.sinoidal,scaleTransition: Effect.Transitions.sinoidal,opacityTransition: Effect.Transitions.none
}, arguments[1] || {});var oldStyle = {top: element.style.top,left: element.style.left,height: element.style.height,width: element.style.width,opacity: element.getInlineOpacity() };var dims = element.getDimensions();var moveX, moveY;switch (options.direction) {case 'top-left':
moveX = moveY = 0;break;case 'top-right':
moveX = dims.width;moveY = 0;break;case 'bottom-left':
moveX = 0;moveY = dims.height;break;case 'bottom-right':
moveX = dims.width;moveY = dims.height;break;case 'center':  
moveX = dims.width / 2;moveY = dims.height / 2;break;}
return new Effect.Parallel(
[ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
], Object.extend({            
beforeStartInternal: function(effect) {effect.effects[0].element.makePositioned().makeClipping(); 
},afterFinishInternal: function(effect) {effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
}, options)
);}
Effect.Pulsate = function(element) {element = $(element);var options    = arguments[1] || {};var oldOpacity = element.getInlineOpacity();var transition = options.transition || Effect.Transitions.sinoidal;var reverser   = function(pos){ return transition(1-Effect.Transitions.pulse(pos, options.pulses)) };reverser.bind(transition);return new Effect.Opacity(element, 
Object.extend(Object.extend({  duration: 2.0, from: 0,afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
}, options), {transition: reverser}));}
Effect.Fold = function(element) {element = $(element);var oldStyle = {top: element.style.top,left: element.style.left,width: element.style.width,height: element.style.height };element.makeClipping();return new Effect.Scale(element, 5, Object.extend({   
scaleContent: false,scaleX: false,afterFinishInternal: function(effect) {new Effect.Scale(element, 1, { 
scaleContent: false, 
scaleY: false,afterFinishInternal: function(effect) {effect.element.hide().undoClipping().setStyle(oldStyle);} });}}, arguments[1] || {}));};Effect.Morph = Class.create();Object.extend(Object.extend(Effect.Morph.prototype, Effect.Base.prototype), {initialize: function(element) {this.element = $(element);if(!this.element) throw(Effect._elementDoesNotExistError);var options = Object.extend({style: {}
}, arguments[1] || {});if (typeof options.style == 'string') {if(options.style.indexOf(':') == -1) {var cssText = '', selector = '.' + options.style;$A(document.styleSheets).reverse().each(function(styleSheet) {if (styleSheet.cssRules) cssRules = styleSheet.cssRules;else if (styleSheet.rules) cssRules = styleSheet.rules;$A(cssRules).reverse().each(function(rule) {if (selector == rule.selectorText) {cssText = rule.style.cssText;throw $break;}
});if (cssText) throw $break;});this.style = cssText.parseStyle();options.afterFinishInternal = function(effect){effect.element.addClassName(effect.options.style);effect.transforms.each(function(transform) {if(transform.style != 'opacity')
effect.element.style[transform.style] = '';});}
} else this.style = options.style.parseStyle();} else this.style = $H(options.style)
this.start(options);},setup: function(){function parseColor(color){if(!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';color = color.parseColor();return $R(0,2).map(function(i){return parseInt( color.slice(i*2+1,i*2+3), 16 ) 
});}
this.transforms = this.style.map(function(pair){var property = pair[0], value = pair[1], unit = null;if(value.parseColor('#zzzzzz') != '#zzzzzz') {value = value.parseColor();unit  = 'color';} else if(property == 'opacity') {value = parseFloat(value);if(Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
this.element.setStyle({zoom: 1});} else if(Element.CSS_LENGTH.test(value)) {var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);value = parseFloat(components[1]);unit = (components.length == 3) ? components[2] : null;}
var originalValue = this.element.getStyle(property);return { 
style: property.camelize(), 
originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0), 
targetValue: unit=='color' ? parseColor(value) : value,unit: unit
};}.bind(this)).reject(function(transform){return (
(transform.originalValue == transform.targetValue) ||
(
transform.unit != 'color' &&
(isNaN(transform.originalValue) || isNaN(transform.targetValue))
)
)
});},update: function(position) {var style = {}, transform, i = this.transforms.length;while(i--)
style[(transform = this.transforms[i]).style] = 
transform.unit=='color' ? '#'+
(Math.round(transform.originalValue[0]+
(transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
(Math.round(transform.originalValue[1]+
(transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
(Math.round(transform.originalValue[2]+
(transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
transform.originalValue + Math.round(
((transform.targetValue - transform.originalValue) * position) * 1000)/1000 + transform.unit;this.element.setStyle(style, true);}
});Effect.Transform = Class.create();Object.extend(Effect.Transform.prototype, {initialize: function(tracks){this.tracks  = [];this.options = arguments[1] || {};this.addTracks(tracks);},addTracks: function(tracks){tracks.each(function(track){var data = $H(track).values().first();this.tracks.push($H({ids:     $H(track).keys().first(),effect:  Effect.Morph,options: { style: data }
}));}.bind(this));return this;},play: function(){return new Effect.Parallel(
this.tracks.map(function(track){var elements = [$(track.ids) || $$(track.ids)].flatten();return elements.map(function(e){ return new track.effect(e, Object.extend({ sync:true }, track.options)) });}).flatten(),this.options
);}
});Element.CSS_PROPERTIES = $w(
'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' + 
'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
'fontSize fontWeight height left letterSpacing lineHeight ' +
'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
'right textIndent top width wordSpacing zIndex');Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;String.prototype.parseStyle = function(){var element = document.createElement('div');element.innerHTML = '<div style="' + this + '"></div>';var style = element.childNodes[0].style, styleRules = $H();Element.CSS_PROPERTIES.each(function(property){if(style[property]) styleRules[property] = style[property]; 
});if(Prototype.Browser.IE && this.indexOf('opacity') > -1) {styleRules.opacity = this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1];}
return styleRules;};Element.morph = function(element, style) {new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || {}));return element;};['getInlineOpacity','forceRerendering','setContentZoom','collectTextNodes','collectTextNodesIgnoreClass','morph'].each( 
function(f) { Element.Methods[f] = Element[f]; }
);Element.Methods.visualEffect = function(element, effect, options) {s = effect.dasherize().camelize();effect_class = s.charAt(0).toUpperCase() + s.substring(1);new Effect[effect_class](element, options);return $(element);};Element.addMethods();
if(typeof Effect == 'undefined')
throw("controls.js requires including script.aculo.us' effects.js library");var Autocompleter = {}
Autocompleter.Base = function() {};Autocompleter.Base.prototype = {baseInitialize: function(element, update, options) {element          = $(element)
this.element     = element; 
this.update      = $(update);  
this.hasFocus    = false; 
this.changed     = false; 
this.active      = false; 
this.index       = 0;     
this.entryCount  = 0;if(this.setOptions)
this.setOptions(options);else
this.options = options || {};this.options.paramName    = this.options.paramName || this.element.name;this.options.tokens       = this.options.tokens || [];this.options.frequency    = this.options.frequency || 0.4;this.options.minChars     = this.options.minChars || 1;this.options.onShow       = this.options.onShow || 
function(element, update){ 
if(!update.style.position || update.style.position=='absolute') {update.style.position = 'absolute';Position.clone(element, update, {setHeight: false, 
offsetTop: element.offsetHeight
});}
Effect.Appear(update,{duration:0.15});};this.options.onHide = this.options.onHide || 
function(element, update){ new Effect.Fade(update,{duration:0.15}) };if(typeof(this.options.tokens) == 'string') 
this.options.tokens = new Array(this.options.tokens);this.observer = null;this.element.setAttribute('autocomplete','off');Element.hide(this.update);Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));Event.observe(this.element, 'keypress', this.onKeyPress.bindAsEventListener(this));// Turn autocomplete back on when the user leaves the page, so that the
Event.observe(window, 'beforeunload', function(){ 
element.setAttribute('autocomplete', 'on'); 
});},show: function() {if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);if(!this.iefix && 
(Prototype.Browser.IE) &&
(Element.getStyle(this.update, 'position')=='absolute')) {new Insertion.After(this.update, 
'<iframe id="' + this.update.id + '_iefix" '+
'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');this.iefix = $(this.update.id+'_iefix');}
if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);},fixIEOverlapping: function() {Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});this.iefix.style.zIndex = 1;this.update.style.zIndex = 2;Element.show(this.iefix);},hide: function() {this.stopIndicator();if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);if(this.iefix) Element.hide(this.iefix);},startIndicator: function() {if(this.options.indicator) Element.show(this.options.indicator);},stopIndicator: function() {if(this.options.indicator) Element.hide(this.options.indicator);},onKeyPress: function(event) {if(this.active)
switch(event.keyCode) {case Event.KEY_TAB:
case Event.KEY_RETURN:
this.selectEntry();Event.stop(event);case Event.KEY_ESC:
this.hide();this.active = false;Event.stop(event);return;case Event.KEY_LEFT:
case Event.KEY_RIGHT:
return;case Event.KEY_UP:
this.markPrevious();this.render();if(Prototype.Browser.WebKit) Event.stop(event);return;case Event.KEY_DOWN:
this.markNext();this.render();if(Prototype.Browser.WebKit) Event.stop(event);return;}
else 
if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN || 
(Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;this.changed = true;this.hasFocus = true;if(this.observer) clearTimeout(this.observer);this.observer = 
setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);},activate: function() {this.changed = false;this.hasFocus = true;this.getUpdatedChoices();},onHover: function(event) {var element = Event.findElement(event, 'LI');if(this.index != element.autocompleteIndex) 
{this.index = element.autocompleteIndex;this.render();}
Event.stop(event);},onClick: function(event) {var element = Event.findElement(event, 'LI');this.index = element.autocompleteIndex;this.selectEntry();this.hide();},onBlur: function(event) {// needed to make click events working
setTimeout(this.hide.bind(this), 250);this.hasFocus = false;this.active = false;     
}, 
render: function() {if(this.entryCount > 0) {for (var i = 0; i < this.entryCount; i++)
this.index==i ? 
Element.addClassName(this.getEntry(i),"selected") : 
Element.removeClassName(this.getEntry(i),"selected");if(this.hasFocus) { 
this.show();this.active = true;}
} else {this.active = false;this.hide();}
},markPrevious: function() {if(this.index > 0) this.index--
else this.index = this.entryCount-1;this.getEntry(this.index).scrollIntoView(true);},markNext: function() {if(this.index < this.entryCount-1) this.index++
else this.index = 0;this.getEntry(this.index).scrollIntoView(false);},getEntry: function(index) {return this.update.firstChild.childNodes[index];},getCurrentEntry: function() {return this.getEntry(this.index);},selectEntry: function() {this.active = false;this.updateElement(this.getCurrentEntry());},updateElement: function(selectedElement) {if (this.options.updateElement) {this.options.updateElement(selectedElement);return;}
var value = '';if (this.options.select) {var nodes = document.getElementsByClassName(this.options.select, selectedElement) || [];if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);} else
value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');var lastTokenPos = this.findLastToken();if (lastTokenPos != -1) {var newValue = this.element.value.substr(0, lastTokenPos + 1);var whitespace = this.element.value.substr(lastTokenPos + 1).match(/^\s+/);if (whitespace)
newValue += whitespace[0];this.element.value = newValue + value;} else {this.element.value = value;}
this.element.focus();if (this.options.afterUpdateElement)
this.options.afterUpdateElement(this.element, selectedElement);},updateChoices: function(choices) {if(!this.changed && this.hasFocus) {this.update.innerHTML = choices;Element.cleanWhitespace(this.update);Element.cleanWhitespace(this.update.down());if(this.update.firstChild && this.update.down().childNodes) {this.entryCount = 
this.update.down().childNodes.length;for (var i = 0; i < this.entryCount; i++) {var entry = this.getEntry(i);entry.autocompleteIndex = i;this.addObservers(entry);}
} else { 
this.entryCount = 0;}
this.stopIndicator();this.index = 0;if(this.entryCount==1 && this.options.autoSelect) {this.selectEntry();this.hide();} else {this.render();}
}
},addObservers: function(element) {Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));Event.observe(element, "click", this.onClick.bindAsEventListener(this));},onObserverEvent: function() {this.changed = false;   
if(this.getToken().length>=this.options.minChars) {this.getUpdatedChoices();} else {this.active = false;this.hide();}
},getToken: function() {var tokenPos = this.findLastToken();if (tokenPos != -1)
var ret = this.element.value.substr(tokenPos + 1).replace(/^\s+/,'').replace(/\s+$/,'');else
var ret = this.element.value;return /\n/.test(ret) ? '' : ret;},findLastToken: function() {var lastTokenPos = -1;for (var i=0; i<this.options.tokens.length; i++) {var thisTokenPos = this.element.value.lastIndexOf(this.options.tokens[i]);if (thisTokenPos > lastTokenPos)
lastTokenPos = thisTokenPos;}
return lastTokenPos;}
}
Ajax.Autocompleter = Class.create();Object.extend(Object.extend(Ajax.Autocompleter.prototype, Autocompleter.Base.prototype), {initialize: function(element, update, url, options) {this.baseInitialize(element, update, options);this.options.asynchronous  = true;this.options.onComplete    = this.onComplete.bind(this);this.options.defaultParams = this.options.parameters || null;this.url                   = url;},getUpdatedChoices: function() {this.startIndicator();var entry = encodeURIComponent(this.options.paramName) + '=' + 
encodeURIComponent(this.getToken());this.options.parameters = this.options.callback ?
this.options.callback(this.element, entry) : entry;if(this.options.defaultParams) 
this.options.parameters += '&' + this.options.defaultParams;new Ajax.Request(this.url, this.options);},onComplete: function(request) {this.updateChoices(request.responseText);}
});// The local array autocompleter. Used when you'd prefer to
Autocompleter.Local = Class.create();Autocompleter.Local.prototype = Object.extend(new Autocompleter.Base(), {initialize: function(element, update, array, options) {this.baseInitialize(element, update, options);this.options.array = array;},getUpdatedChoices: function() {this.updateChoices(this.options.selector(this));},setOptions: function(options) {this.options = Object.extend({choices: 10,partialSearch: true,partialChars: 2,ignoreCase: true,fullSearch: false,selector: function(instance) {var ret       = []; // Beginning matches
var partial   = []; // Inside matches
var entry     = instance.getToken();var count     = 0;for (var i = 0; i < instance.options.array.length &&  
ret.length < instance.options.choices ; i++) { 
var elem = instance.options.array[i];var foundPos = instance.options.ignoreCase ? 
elem.toLowerCase().indexOf(entry.toLowerCase()) : 
elem.indexOf(entry);while (foundPos != -1) {if (foundPos == 0 && elem.length != entry.length) { 
ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" + 
elem.substr(entry.length) + "</li>");break;} else if (entry.length >= instance.options.partialChars && 
instance.options.partialSearch && foundPos != -1) {if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
foundPos + entry.length) + "</li>");break;}
}
foundPos = instance.options.ignoreCase ? 
elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) : 
elem.indexOf(entry, foundPos + 1);}
}
if (partial.length)
ret = ret.concat(partial.slice(0, instance.options.choices - ret.length))
return "<ul>" + ret.join('') + "</ul>";}
}, options || {});}
});// AJAX in-place editor
Field.scrollFreeActivate = function(field) {setTimeout(function() {Field.activate(field);}, 1);}
Ajax.InPlaceEditor = Class.create();Ajax.InPlaceEditor.defaultHighlightColor = "#FFFF99";Ajax.InPlaceEditor.prototype = {initialize: function(element, url, options) {this.url = url;this.element = $(element);this.options = Object.extend({paramName: "value",okButton: true,okLink: false,okText: "ok",cancelButton: false,cancelLink: true,cancelText: "cancel",textBeforeControls: '',textBetweenControls: '',textAfterControls: '',savingText: "Saving...",clickToEditText: "Click to edit",okText: "ok",rows: 1,onComplete: function(transport, element) {new Effect.Highlight(element, {startcolor: this.options.highlightcolor});},onFailure: function(transport) {alert("Error communicating with the server: " + transport.responseText.stripTags());},callback: function(form) {return Form.serialize(form);},handleLineBreaks: true,loadingText: 'Loading...',savingClassName: 'inplaceeditor-saving',loadingClassName: 'inplaceeditor-loading',formClassName: 'inplaceeditor-form',highlightcolor: Ajax.InPlaceEditor.defaultHighlightColor,highlightendcolor: "#FFFFFF",externalControl: null,submitOnBlur: false,ajaxOptions: {},evalScripts: false
}, options || {});if(!this.options.formId && this.element.id) {this.options.formId = this.element.id + "-inplaceeditor";if ($(this.options.formId)) {// there's already a form with that name, don't specify an id
this.options.formId = null;}
}
if (this.options.externalControl) {this.options.externalControl = $(this.options.externalControl);}
this.originalBackground = Element.getStyle(this.element, 'background-color');if (!this.originalBackground) {this.originalBackground = "transparent";}
this.element.title = this.options.clickToEditText;this.onclickListener = this.enterEditMode.bindAsEventListener(this);this.mouseoverListener = this.enterHover.bindAsEventListener(this);this.mouseoutListener = this.leaveHover.bindAsEventListener(this);Event.observe(this.element, 'click', this.onclickListener);Event.observe(this.element, 'mouseover', this.mouseoverListener);Event.observe(this.element, 'mouseout', this.mouseoutListener);if (this.options.externalControl) {Event.observe(this.options.externalControl, 'click', this.onclickListener);Event.observe(this.options.externalControl, 'mouseover', this.mouseoverListener);Event.observe(this.options.externalControl, 'mouseout', this.mouseoutListener);}
},enterEditMode: function(evt) {if (this.saving) return;if (this.editing) return;this.editing = true;this.onEnterEditMode();if (this.options.externalControl) {Element.hide(this.options.externalControl);}
Element.hide(this.element);this.createForm();this.element.parentNode.insertBefore(this.form, this.element);if (!this.options.loadTextURL) Field.scrollFreeActivate(this.editField);// stop the event to avoid a page refresh in Safari
if (evt) {Event.stop(evt);}
return false;},createForm: function() {this.form = document.createElement("form");this.form.id = this.options.formId;Element.addClassName(this.form, this.options.formClassName)
this.form.onsubmit = this.onSubmit.bind(this);this.createEditField();if (this.options.textarea) {var br = document.createElement("br");this.form.appendChild(br);}
if (this.options.textBeforeControls)
this.form.appendChild(document.createTextNode(this.options.textBeforeControls));if (this.options.okButton) {var okButton = document.createElement("input");okButton.type = "submit";okButton.value = this.options.okText;okButton.className = 'editor_ok_button';this.form.appendChild(okButton);}
if (this.options.okLink) {var okLink = document.createElement("a");okLink.href = "#";okLink.appendChild(document.createTextNode(this.options.okText));okLink.onclick = this.onSubmit.bind(this);okLink.className = 'editor_ok_link';this.form.appendChild(okLink);}
if (this.options.textBetweenControls && 
(this.options.okLink || this.options.okButton) && 
(this.options.cancelLink || this.options.cancelButton))
this.form.appendChild(document.createTextNode(this.options.textBetweenControls));if (this.options.cancelButton) {var cancelButton = document.createElement("input");cancelButton.type = "submit";cancelButton.value = this.options.cancelText;cancelButton.onclick = this.onclickCancel.bind(this);cancelButton.className = 'editor_cancel_button';this.form.appendChild(cancelButton);}
if (this.options.cancelLink) {var cancelLink = document.createElement("a");cancelLink.href = "#";cancelLink.appendChild(document.createTextNode(this.options.cancelText));cancelLink.onclick = this.onclickCancel.bind(this);cancelLink.className = 'editor_cancel editor_cancel_link';      
this.form.appendChild(cancelLink);}
if (this.options.textAfterControls)
this.form.appendChild(document.createTextNode(this.options.textAfterControls));},hasHTMLLineBreaks: function(string) {if (!this.options.handleLineBreaks) return false;return string.match(/<br/i) || string.match(/<p>/i);},convertHTMLLineBreaks: function(string) {return string.replace(/<br>/gi, "\n").replace(/<br\/>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<p>/gi, "");},createEditField: function() {var text;if(this.options.loadTextURL) {text = this.options.loadingText;} else {text = this.getText();}
var obj = this;if (this.options.rows == 1 && !this.hasHTMLLineBreaks(text)) {this.options.textarea = false;var textField = document.createElement("input");textField.obj = this;textField.type = "text";textField.name = this.options.paramName;textField.value = text;textField.style.backgroundColor = this.options.highlightcolor;textField.className = 'editor_field';var size = this.options.size || this.options.cols || 0;if (size != 0) textField.size = size;if (this.options.submitOnBlur)
textField.onblur = this.onSubmit.bind(this);this.editField = textField;} else {this.options.textarea = true;var textArea = document.createElement("textarea");textArea.obj = this;textArea.name = this.options.paramName;textArea.value = this.convertHTMLLineBreaks(text);textArea.rows = this.options.rows;textArea.cols = this.options.cols || 40;textArea.className = 'editor_field';      
if (this.options.submitOnBlur)
textArea.onblur = this.onSubmit.bind(this);this.editField = textArea;}
if(this.options.loadTextURL) {this.loadExternalText();}
this.form.appendChild(this.editField);},getText: function() {return this.element.innerHTML;},loadExternalText: function() {Element.addClassName(this.form, this.options.loadingClassName);this.editField.disabled = true;new Ajax.Request(
this.options.loadTextURL,Object.extend({asynchronous: true,onComplete: this.onLoadedExternalText.bind(this)
}, this.options.ajaxOptions)
);},onLoadedExternalText: function(transport) {Element.removeClassName(this.form, this.options.loadingClassName);this.editField.disabled = false;this.editField.value = transport.responseText.stripTags();Field.scrollFreeActivate(this.editField);},onclickCancel: function() {this.onComplete();this.leaveEditMode();return false;},onFailure: function(transport) {this.options.onFailure(transport);if (this.oldInnerHTML) {this.element.innerHTML = this.oldInnerHTML;this.oldInnerHTML = null;}
return false;},onSubmit: function() {// onLoading resets these so we need to save them away for the Ajax call
var form = this.form;var value = this.editField.value;// do this first, sometimes the ajax call returns before we get a chance to switch on Saving...
this.onLoading();if (this.options.evalScripts) {new Ajax.Request(
this.url, Object.extend({parameters: this.options.callback(form, value),onComplete: this.onComplete.bind(this),onFailure: this.onFailure.bind(this),asynchronous:true, 
evalScripts:true
}, this.options.ajaxOptions));} else  {new Ajax.Updater(
{ success: this.element,// don't update on failure (this could be an option)
failure: null }, 
this.url, Object.extend({parameters: this.options.callback(form, value),onComplete: this.onComplete.bind(this),onFailure: this.onFailure.bind(this)
}, this.options.ajaxOptions));}
if (arguments.length > 1) {Event.stop(arguments[0]);}
return false;},onLoading: function() {this.saving = true;this.removeForm();this.leaveHover();this.showSaving();},showSaving: function() {this.oldInnerHTML = this.element.innerHTML;this.element.innerHTML = this.options.savingText;Element.addClassName(this.element, this.options.savingClassName);this.element.style.backgroundColor = this.originalBackground;Element.show(this.element);},removeForm: function() {if(this.form) {if (this.form.parentNode) Element.remove(this.form);this.form = null;}
},enterHover: function() {if (this.saving) return;this.element.style.backgroundColor = this.options.highlightcolor;if (this.effect) {this.effect.cancel();}
Element.addClassName(this.element, this.options.hoverClassName)
},leaveHover: function() {if (this.options.backgroundColor) {this.element.style.backgroundColor = this.oldBackground;}
Element.removeClassName(this.element, this.options.hoverClassName)
if (this.saving) return;this.effect = new Effect.Highlight(this.element, {startcolor: this.options.highlightcolor,endcolor: this.options.highlightendcolor,restorecolor: this.originalBackground
});},leaveEditMode: function() {Element.removeClassName(this.element, this.options.savingClassName);this.removeForm();this.leaveHover();this.element.style.backgroundColor = this.originalBackground;Element.show(this.element);if (this.options.externalControl) {Element.show(this.options.externalControl);}
this.editing = false;this.saving = false;this.oldInnerHTML = null;this.onLeaveEditMode();},onComplete: function(transport) {this.leaveEditMode();this.options.onComplete.bind(this)(transport, this.element);},onEnterEditMode: function() {},onLeaveEditMode: function() {},dispose: function() {if (this.oldInnerHTML) {this.element.innerHTML = this.oldInnerHTML;}
this.leaveEditMode();Event.stopObserving(this.element, 'click', this.onclickListener);Event.stopObserving(this.element, 'mouseover', this.mouseoverListener);Event.stopObserving(this.element, 'mouseout', this.mouseoutListener);if (this.options.externalControl) {Event.stopObserving(this.options.externalControl, 'click', this.onclickListener);Event.stopObserving(this.options.externalControl, 'mouseover', this.mouseoverListener);Event.stopObserving(this.options.externalControl, 'mouseout', this.mouseoutListener);}
}
};Ajax.InPlaceCollectionEditor = Class.create();Object.extend(Ajax.InPlaceCollectionEditor.prototype, Ajax.InPlaceEditor.prototype);Object.extend(Ajax.InPlaceCollectionEditor.prototype, {createEditField: function() {if (!this.cached_selectTag) {var selectTag = document.createElement("select");var collection = this.options.collection || [];var optionTag;collection.each(function(e,i) {optionTag = document.createElement("option");optionTag.value = (e instanceof Array) ? e[0] : e;if((typeof this.options.value == 'undefined') && 
((e instanceof Array) ? this.element.innerHTML == e[1] : e == optionTag.value)) optionTag.selected = true;if(this.options.value==optionTag.value) optionTag.selected = true;optionTag.appendChild(document.createTextNode((e instanceof Array) ? e[1] : e));selectTag.appendChild(optionTag);}.bind(this));this.cached_selectTag = selectTag;}
this.editField = this.cached_selectTag;if(this.options.loadTextURL) this.loadExternalText();this.form.appendChild(this.editField);this.options.callback = function(form, value) {return "value=" + encodeURIComponent(value);}
}
});// Delayed observer, like Form.Element.Observer, 
Form.Element.DelayedObserver = Class.create();Form.Element.DelayedObserver.prototype = {initialize: function(element, delay, callback) {this.delay     = delay || 0.5;this.element   = $(element);this.callback  = callback;this.timer     = null;this.lastValue = $F(this.element); 
Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));},delayedListener: function(event) {if(this.lastValue == $F(this.element)) return;if(this.timer) clearTimeout(this.timer);this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);this.lastValue = $F(this.element);},onTimerEvent: function() {this.timer = null;this.callback(this.element, $F(this.element));}
};
if(typeof Effect == 'undefined')
throw("dragdrop.js requires including script.aculo.us' effects.js library");var Droppables = {drops: [],remove: function(element) {this.drops = this.drops.reject(function(d) { return d.element==$(element) });},add: function(element) {element = $(element);var options = Object.extend({greedy:     true,hoverclass: null,tree:       false
}, arguments[1] || {});// cache containers
if(options.containment) {options._containers = [];var containment = options.containment;if((typeof containment == 'object') && 
(containment.constructor == Array)) {containment.each( function(c) { options._containers.push($(c)) });} else {options._containers.push($(containment));}
}
if(options.accept) options.accept = [options.accept].flatten();Element.makePositioned(element); // fix IE
options.element = element;this.drops.push(options);},findDeepestChild: function(drops) {deepest = drops[0];for (i = 1; i < drops.length; ++i)
if (Element.isParent(drops[i].element, deepest.element))
deepest = drops[i];return deepest;},isContained: function(element, drop) {var containmentNode;if(drop.tree) {containmentNode = element.treeNode; 
} else {containmentNode = element.parentNode;}
return drop._containers.detect(function(c) { return containmentNode == c });},isAffected: function(point, element, drop) {return (
(drop.element!=element) &&
((!drop._containers) ||
this.isContained(element, drop)) &&
((!drop.accept) ||
(Element.classNames(element).detect( 
function(v) { return drop.accept.include(v) } ) )) &&
Position.within(drop.element, point[0], point[1]) );},deactivate: function(drop) {if(drop.hoverclass)
Element.removeClassName(drop.element, drop.hoverclass);this.last_active = null;},activate: function(drop) {if(drop.hoverclass)
Element.addClassName(drop.element, drop.hoverclass);this.last_active = drop;},show: function(point, element) {if(!this.drops.length) return;var affected = [];if(this.last_active) this.deactivate(this.last_active);this.drops.each( function(drop) {if(Droppables.isAffected(point, element, drop))
affected.push(drop);});if(affected.length>0) {drop = Droppables.findDeepestChild(affected);Position.within(drop.element, point[0], point[1]);if(drop.onHover)
drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));Droppables.activate(drop);}
},fire: function(event, element) {if(!this.last_active) return;Position.prepare();if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
if (this.last_active.onDrop) {this.last_active.onDrop(element, this.last_active.element, event); 
return true; 
}
},reset: function() {if(this.last_active)
this.deactivate(this.last_active);}
}
var Draggables = {drags: [],observers: [],register: function(draggable) {if(this.drags.length == 0) {this.eventMouseUp   = this.endDrag.bindAsEventListener(this);this.eventMouseMove = this.updateDrag.bindAsEventListener(this);this.eventKeypress  = this.keyPress.bindAsEventListener(this);Event.observe(document, "mouseup", this.eventMouseUp);Event.observe(document, "mousemove", this.eventMouseMove);Event.observe(document, "keypress", this.eventKeypress);}
this.drags.push(draggable);},unregister: function(draggable) {this.drags = this.drags.reject(function(d) { return d==draggable });if(this.drags.length == 0) {Event.stopObserving(document, "mouseup", this.eventMouseUp);Event.stopObserving(document, "mousemove", this.eventMouseMove);Event.stopObserving(document, "keypress", this.eventKeypress);}
},activate: function(draggable) {if(draggable.options.delay) { 
this._timeout = setTimeout(function() { 
Draggables._timeout = null; 
window.focus(); 
Draggables.activeDraggable = draggable; 
}.bind(this), draggable.options.delay); 
} else {window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
this.activeDraggable = draggable;}
},deactivate: function() {this.activeDraggable = null;},updateDrag: function(event) {if(!this.activeDraggable) return;var pointer = [Event.pointerX(event), Event.pointerY(event)];// Mozilla-based browsers fire successive mousemove events with
if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;this._lastPointer = pointer;this.activeDraggable.updateDrag(event, pointer);},endDrag: function(event) {if(this._timeout) { 
clearTimeout(this._timeout); 
this._timeout = null; 
}
if(!this.activeDraggable) return;this._lastPointer = null;this.activeDraggable.endDrag(event);this.activeDraggable = null;},keyPress: function(event) {if(this.activeDraggable)
this.activeDraggable.keyPress(event);},addObserver: function(observer) {this.observers.push(observer);this._cacheObserverCallbacks();},removeObserver: function(element) {  // element instead of observer fixes mem leaks
this.observers = this.observers.reject( function(o) { return o.element==element });this._cacheObserverCallbacks();},notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
if(this[eventName+'Count'] > 0)
this.observers.each( function(o) {if(o[eventName]) o[eventName](eventName, draggable, event);});if(draggable.options[eventName]) draggable.options[eventName](draggable, event);},_cacheObserverCallbacks: function() {['onStart','onEnd','onDrag'].each( function(eventName) {Draggables[eventName+'Count'] = Draggables.observers.select(
function(o) { return o[eventName]; }
).length;});}
}
/*--------------------------------------------------------------------------*/
var Draggable = Class.create();Draggable._dragging    = {};Draggable.prototype = {initialize: function(element) {var defaults = {handle: false,reverteffect: function(element, top_offset, left_offset) {var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,queue: {scope:'_draggable', position:'end'}
});},endeffect: function(element) {var toOpacity = typeof element._opacity == 'number' ? element._opacity : 1.0;new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity, 
queue: {scope:'_draggable', position:'end'},afterFinish: function(){ 
Draggable._dragging[element] = false 
}
}); 
},zindex: 1000,revert: false,quiet: false,scroll: false,scrollSensitivity: 20,scrollSpeed: 15,snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
delay: 0
};if(!arguments[1] || typeof arguments[1].endeffect == 'undefined')
Object.extend(defaults, {starteffect: function(element) {element._opacity = Element.getOpacity(element);Draggable._dragging[element] = true;new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7}); 
}
});var options = Object.extend(defaults, arguments[1] || {});this.element = $(element);if(options.handle && (typeof options.handle == 'string'))
this.handle = this.element.down('.'+options.handle, 0);if(!this.handle) this.handle = $(options.handle);if(!this.handle) this.handle = this.element;if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {options.scroll = $(options.scroll);this._isScrollChild = Element.childOf(this.element, options.scroll);}
Element.makePositioned(this.element); // fix IE    
this.delta    = this.currentDelta();this.options  = options;this.dragging = false;   
this.eventMouseDown = this.initDrag.bindAsEventListener(this);Event.observe(this.handle, "mousedown", this.eventMouseDown);Draggables.register(this);},destroy: function() {Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);Draggables.unregister(this);},currentDelta: function() {return([
parseInt(Element.getStyle(this.element,'left') || '0'),parseInt(Element.getStyle(this.element,'top') || '0')]);},initDrag: function(event) {if(typeof Draggable._dragging[this.element] != 'undefined' &&
Draggable._dragging[this.element]) return;if(Event.isLeftClick(event)) {    
var src = Event.element(event);if((tag_name = src.tagName.toUpperCase()) && (
tag_name=='INPUT' ||
tag_name=='SELECT' ||
tag_name=='OPTION' ||
tag_name=='BUTTON' ||
tag_name=='TEXTAREA')) return;var pointer = [Event.pointerX(event), Event.pointerY(event)];var pos     = Position.cumulativeOffset(this.element);this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });Draggables.activate(this);Event.stop(event);}
},startDrag: function(event) {this.dragging = true;if(this.options.zindex) {this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);this.element.style.zIndex = this.options.zindex;}
if(this.options.ghosting) {this._clone = this.element.cloneNode(true);Position.absolutize(this.element);this.element.parentNode.insertBefore(this._clone, this.element);}
if(this.options.scroll) {if (this.options.scroll == window) {var where = this._getWindowScroll(this.options.scroll);this.originalScrollLeft = where.left;this.originalScrollTop = where.top;} else {this.originalScrollLeft = this.options.scroll.scrollLeft;this.originalScrollTop = this.options.scroll.scrollTop;}
}
Draggables.notify('onStart', this, event);if(this.options.starteffect) this.options.starteffect(this.element);},updateDrag: function(event, pointer) {if(!this.dragging) this.startDrag(event);if(!this.options.quiet){Position.prepare();Droppables.show(pointer, this.element);}
Draggables.notify('onDrag', this, event);this.draw(pointer);if(this.options.change) this.options.change(this);if(this.options.scroll) {this.stopScrolling();var p;if (this.options.scroll == window) {with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
} else {p = Position.page(this.options.scroll);p[0] += this.options.scroll.scrollLeft + Position.deltaX;p[1] += this.options.scroll.scrollTop + Position.deltaY;p.push(p[0]+this.options.scroll.offsetWidth);p.push(p[1]+this.options.scroll.offsetHeight);}
var speed = [0,0];if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);this.startScrolling(speed);}
if(Prototype.Browser.WebKit) window.scrollBy(0,0);Event.stop(event);},finishDrag: function(event, success) {this.dragging = false;if(this.options.quiet){Position.prepare();var pointer = [Event.pointerX(event), Event.pointerY(event)];Droppables.show(pointer, this.element);}
if(this.options.ghosting) {Position.relativize(this.element);Element.remove(this._clone);this._clone = null;}
var dropped = false; 
if(success) { 
dropped = Droppables.fire(event, this.element); 
if (!dropped) dropped = false; 
}
if(dropped && this.options.onDropped) this.options.onDropped(this.element);Draggables.notify('onEnd', this, event);var revert = this.options.revert;if(revert && typeof revert == 'function') revert = revert(this.element);var d = this.currentDelta();if(revert && this.options.reverteffect) {if (dropped == 0 || revert != 'failure')
this.options.reverteffect(this.element,d[1]-this.delta[1], d[0]-this.delta[0]);} else {this.delta = d;}
if(this.options.zindex)
this.element.style.zIndex = this.originalZ;if(this.options.endeffect) 
this.options.endeffect(this.element);Draggables.deactivate(this);Droppables.reset();},keyPress: function(event) {if(event.keyCode!=Event.KEY_ESC) return;this.finishDrag(event, false);Event.stop(event);},endDrag: function(event) {if(!this.dragging) return;this.stopScrolling();this.finishDrag(event, true);Event.stop(event);},draw: function(point) {var pos = Position.cumulativeOffset(this.element);if(this.options.ghosting) {var r   = Position.realOffset(this.element);pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;}
var d = this.currentDelta();pos[0] -= d[0]; pos[1] -= d[1];if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;}
var p = [0,1].map(function(i){ 
return (point[i]-pos[i]-this.offset[i]) 
}.bind(this));if(this.options.snap) {if(typeof this.options.snap == 'function') {p = this.options.snap(p[0],p[1],this);} else {if(this.options.snap instanceof Array) {p = p.map( function(v, i) {return Math.round(v/this.options.snap[i])*this.options.snap[i] }.bind(this))
} else {p = p.map( function(v) {return Math.round(v/this.options.snap)*this.options.snap }.bind(this))
}
}}
var style = this.element.style;if((!this.options.constraint) || (this.options.constraint=='horizontal'))
style.left = p[0] + "px";if((!this.options.constraint) || (this.options.constraint=='vertical'))
style.top  = p[1] + "px";if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
},stopScrolling: function() {if(this.scrollInterval) {clearInterval(this.scrollInterval);this.scrollInterval = null;Draggables._lastScrollPointer = null;}
},startScrolling: function(speed) {if(!(speed[0] || speed[1])) return;this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];this.lastScrolled = new Date();this.scrollInterval = setInterval(this.scroll.bind(this), 10);},scroll: function() {var current = new Date();var delta = current - this.lastScrolled;this.lastScrolled = current;if(this.options.scroll == window) {with (this._getWindowScroll(this.options.scroll)) {if (this.scrollSpeed[0] || this.scrollSpeed[1]) {var d = delta / 1000;this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );}
}
} else {this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;}
Position.prepare();Droppables.show(Draggables._lastPointer, this.element);Draggables.notify('onDrag', this);if (this._isScrollChild) {Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;if (Draggables._lastScrollPointer[0] < 0)
Draggables._lastScrollPointer[0] = 0;if (Draggables._lastScrollPointer[1] < 0)
Draggables._lastScrollPointer[1] = 0;this.draw(Draggables._lastScrollPointer);}
if(this.options.change) this.options.change(this);},_getWindowScroll: function(w) {var T, L, W, H;with (w.document) {if (w.document.documentElement && documentElement.scrollTop) {T = documentElement.scrollTop;L = documentElement.scrollLeft;} else if (w.document.body) {T = body.scrollTop;L = body.scrollLeft;}
if (w.innerWidth) {W = w.innerWidth;H = w.innerHeight;} else if (w.document.documentElement && documentElement.clientWidth) {W = documentElement.clientWidth;H = documentElement.clientHeight;} else {W = body.offsetWidth;H = body.offsetHeight
}
}
return { top: T, left: L, width: W, height: H };}
}
/*--------------------------------------------------------------------------*/
var SortableObserver = Class.create();SortableObserver.prototype = {initialize: function(element, observer) {this.element   = $(element);this.observer  = observer;this.lastValue = Sortable.serialize(this.element);},onStart: function() {this.lastValue = Sortable.serialize(this.element);},onEnd: function() {Sortable.unmark();if(this.lastValue != Sortable.serialize(this.element))
this.observer(this.element)
}
}
var Sortable = {SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,sortables: {},_findRootElement: function(element) {while (element.tagName.toUpperCase() != "BODY") {  
if(element.id && Sortable.sortables[element.id]) return element;element = element.parentNode;}
},options: function(element) {element = Sortable._findRootElement($(element));if(!element) return;return Sortable.sortables[element.id];},destroy: function(element){var s = Sortable.options(element);if(s) {Draggables.removeObserver(s.element);s.droppables.each(function(d){ Droppables.remove(d) });s.draggables.invoke('destroy');delete Sortable.sortables[s.element.id];}
},create: function(element) {element = $(element);var options = Object.extend({ 
element:     element,tag:         'li',       // assumes li children, override with tag: 'tagname'
dropOnEmpty: false,tree:        false,treeTag:     'ul',overlap:     'vertical', // one of 'vertical', 'horizontal'
constraint:  'vertical', // one of 'vertical', 'horizontal', false
containment: element,    // also takes array of elements (or id's); or false
handle:      false,      // or a CSS class
only:        false,delay:       0,hoverclass:  null,ghosting:    false,quiet:       false, 
scroll:      false,scrollSensitivity: 20,scrollSpeed: 15,format:      this.SERIALIZE_RULE,// these take arrays of elements or ids and can be 
elements:    false,handles:     false,onChange:    Prototype.emptyFunction,onUpdate:    Prototype.emptyFunction
}, arguments[1] || {});// clear any old sortable with same element
this.destroy(element);// build options for the draggables
var options_for_draggable = {revert:      true,quiet:       options.quiet,scroll:      options.scroll,scrollSpeed: options.scrollSpeed,scrollSensitivity: options.scrollSensitivity,delay:       options.delay,ghosting:    options.ghosting,constraint:  options.constraint,handle:      options.handle };if(options.starteffect)
options_for_draggable.starteffect = options.starteffect;if(options.reverteffect)
options_for_draggable.reverteffect = options.reverteffect;else
if(options.ghosting) options_for_draggable.reverteffect = function(element) {element.style.top  = 0;element.style.left = 0;};if(options.endeffect)
options_for_draggable.endeffect = options.endeffect;if(options.zindex)
options_for_draggable.zindex = options.zindex;// build options for the droppables  
var options_for_droppable = {overlap:     options.overlap,containment: options.containment,tree:        options.tree,hoverclass:  options.hoverclass,onHover:     Sortable.onHover
}
var options_for_tree = {onHover:      Sortable.onEmptyHover,overlap:      options.overlap,containment:  options.containment,hoverclass:   options.hoverclass
}
Element.cleanWhitespace(element); 
options.draggables = [];options.droppables = [];// drop on empty handling
if(options.dropOnEmpty || options.tree) {Droppables.add(element, options_for_tree);options.droppables.push(element);}
(options.elements || this.findElements(element, options) || []).each( function(e,i) {var handle = options.handles ? $(options.handles[i]) :
(options.handle ? $(e).getElementsByClassName(options.handle)[0] : e); 
options.draggables.push(
new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));Droppables.add(e, options_for_droppable);if(options.tree) e.treeNode = element;options.droppables.push(e);      
});if(options.tree) {(Sortable.findTreeElements(element, options) || []).each( function(e) {Droppables.add(e, options_for_tree);e.treeNode = element;options.droppables.push(e);});}
this.sortables[element.id] = options;// for onupdate
Draggables.addObserver(new SortableObserver(element, options.onUpdate));},// return all suitable-for-sortable elements in a guaranteed order
findElements: function(element, options) {return Element.findChildren(
element, options.only, options.tree ? true : false, options.tag);},findTreeElements: function(element, options) {return Element.findChildren(
element, options.only, options.tree ? true : false, options.treeTag);},onHover: function(element, dropon, overlap) {if(Element.isParent(dropon, element)) return;if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {return;} else if(overlap>0.5) {Sortable.mark(dropon, 'before');if(dropon.previousSibling != element) {var oldParentNode = element.parentNode;element.style.visibility = "hidden"; // fix gecko rendering
dropon.parentNode.insertBefore(element, dropon);if(dropon.parentNode!=oldParentNode) 
Sortable.options(oldParentNode).onChange(element);Sortable.options(dropon.parentNode).onChange(element);}
} else {Sortable.mark(dropon, 'after');var nextElement = dropon.nextSibling || null;if(nextElement != element) {var oldParentNode = element.parentNode;element.style.visibility = "hidden"; // fix gecko rendering
dropon.parentNode.insertBefore(element, nextElement);if(dropon.parentNode!=oldParentNode) 
Sortable.options(oldParentNode).onChange(element);Sortable.options(dropon.parentNode).onChange(element);}
}
},onEmptyHover: function(element, dropon, overlap) {var oldParentNode = element.parentNode;var droponOptions = Sortable.options(dropon);if(!Element.isParent(dropon, element)) {var index;var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});var child = null;if(children) {var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);for (index = 0; index < children.length; index += 1) {if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {offset -= Element.offsetSize (children[index], droponOptions.overlap);} else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {child = index + 1 < children.length ? children[index + 1] : null;break;} else {child = children[index];break;}
}
}
dropon.insertBefore(element, child);Sortable.options(oldParentNode).onChange(element);droponOptions.onChange(element);}
},unmark: function() {if(Sortable._marker) Sortable._marker.hide();},mark: function(dropon, position) {// mark on ghosting only
var sortable = Sortable.options(dropon.parentNode);if(sortable && !sortable.ghosting) return; 
if(!Sortable._marker) {Sortable._marker = 
($('dropmarker') || Element.extend(document.createElement('DIV'))).
hide().addClassName('dropmarker').setStyle({position:'absolute'});document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);}    
var offsets = Position.cumulativeOffset(dropon);Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});if(position=='after')
if(sortable.overlap == 'horizontal') 
Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});else
Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});Sortable._marker.show();},_tree: function(element, options, parent) {var children = Sortable.findElements(element, options) || [];for (var i = 0; i < children.length; ++i) {var match = children[i].id.match(options.format);if (!match) continue;var child = {id: encodeURIComponent(match ? match[1] : null),element: element,parent: parent,children: [],position: parent.children.length,container: $(children[i]).down(options.treeTag)
}
/* Get the element containing the children and recurse over it */
if (child.container)
this._tree(child.container, options, child)
parent.children.push (child);}
return parent; 
},tree: function(element) {element = $(element);var sortableOptions = this.options(element);var options = Object.extend({tag: sortableOptions.tag,treeTag: sortableOptions.treeTag,only: sortableOptions.only,name: element.id,format: sortableOptions.format
}, arguments[1] || {});var root = {id: null,parent: null,children: [],container: element,position: 0
}
return Sortable._tree(element, options, root);},/* Construct a [i] index for a particular node */
_constructIndex: function(node) {var index = '';do {if (node.id) index = '[' + node.position + ']' + index;} while ((node = node.parent) != null);return index;},sequence: function(element) {element = $(element);var options = Object.extend(this.options(element), arguments[1] || {});return $(this.findElements(element, options) || []).map( function(item) {return item.id.match(options.format) ? item.id.match(options.format)[1] : '';});},setSequence: function(element, new_sequence) {element = $(element);var options = Object.extend(this.options(element), arguments[2] || {});var nodeMap = {};this.findElements(element, options).each( function(n) {if (n.id.match(options.format))
nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];n.parentNode.removeChild(n);});new_sequence.each(function(ident) {var n = nodeMap[ident];if (n) {n[1].appendChild(n[0]);delete nodeMap[ident];}
});},serialize: function(element) {element = $(element);var options = Object.extend(Sortable.options(element), arguments[1] || {});var name = encodeURIComponent(
(arguments[1] && arguments[1].name) ? arguments[1].name : element.id);if (options.tree) {return Sortable.tree(element, arguments[1]).children.map( function (item) {return [name + Sortable._constructIndex(item) + "[id]=" + 
encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));}).flatten().join('&');} else {return Sortable.sequence(element, arguments[1]).map( function(item) {return name + "[]=" + encodeURIComponent(item);}).join('&');}
}
}
Element.isParent = function(child, element) {if (!child.parentNode || child == element) return false;if (child.parentNode == element) return true;return Element.isParent(child.parentNode, element);}
Element.findChildren = function(element, only, recursive, tagName) {   
if(!element.hasChildNodes()) return null;tagName = tagName.toUpperCase();if(only) only = [only].flatten();var elements = [];$A(element.childNodes).each( function(e) {if(e.tagName && e.tagName.toUpperCase()==tagName &&
(!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
elements.push(e);if(recursive) {var grandchildren = Element.findChildren(e, only, recursive, tagName);if(grandchildren) elements.push(grandchildren);}
});return (elements.length>0 ? elements.flatten() : []);}
Element.offsetSize = function (element, type) {return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];}
var str_action_menu               ='Actions Menu';var str_artist                    ='Artist';var str_cancel                    ='cancel';var str_close                     ='close';var str_collab_confirm_membership ='confirm membership';var str_collab_confirmed          ='confirmed';var str_collab_credit             ='credit';var str_collab_enter_role         ='Enter %s\'s role (e.g. bass, producer, vocals)';  //Enter%s'srole(e.g. bass, producer, vocals)
var str_collab_hide               ='hide';var str_collab_invite             ='invite other people';var str_collab_not_confirmed      ='unconfirmed';var str_collab_publish            ='publish';var str_collab_remove2            ='remove';var str_collab_send_email         ='send email';var str_collab_send_mail_to       ='Send mail to %s';var str_collab_tags_label         ='tags (e.g. bass, beat, keys)';   //tags(e.g.bass, beat, keys)
var str_default                   ='default';var str_download                  ='Download';var str_download_this_page        ='Download this page';var str_files_have_been_reordered ='Files have been reordered';var str_filter_2_weeks_ago        ='2 weeks ago';var str_filter_3_months_ago       ='3 months ago';var str_filter_a_week_ago         ='a week ago';var str_filter_a_year_ago         ='a year ago';var str_filter_all                ='all';var str_filter_all_time           ='forever';var str_filter_artist             ='Artist';var str_filter_clear              ='clear';var str_filter_date               ='Date';var str_filter_enter_user         ='Enter user below';var str_filter_hide_list          ='hide list';var str_filter_go                 ='see results';var str_filter_last_month         ='Last month';var str_filter_license            ='License';var str_filter_limit              ='Limit';var str_filter_least_to_most      ='Least to most';var str_filter_match              ='Match';var str_filter_match_all_tags     ='Match all tags';var str_filter_match_any_tags     ='Match any tags';var str_filter_most_to_least      ='Most to least';var str_filter_name               ='Name';var str_filter_no_records_match   ='no records match';var str_filter_order              ='Order';var str_filter_remixes_of         ='Remixes of';var str_filter_score              ='Ratings';var str_filter_show_list          ='show list';var str_filter_since              ='Since';var str_filter_sort               ='Sort';var str_filter_yesterday          ='Yesterday';var str_forum_post_topic_reply    ='Post topic reply';var str_getting_data              ='Getting data...';var str_lic_attribution           ='attribution';var str_lic_nc_sampling_plus      ='nc sampling+';var str_lic_nc_share_alike        ='nc share alike';var str_lic_non_commercial        ='non commercial';var str_lic_public                ='public domain';var str_lic_sampling              ='sampling';var str_lic_sampling_plus         ='sampling+';var str_lic_share_alike           ='share alike';var str_loading                   ='loading...';var str_new_row                   ='new row';var str_ok                        ='ok';var str_pl_and_track_added        ='New playlist created and track added.';var str_pl_dynamic_changed        ='Dynamic playlist changed.';var str_pl_favs_add_to            ='Add to favorites';var str_pl_favs_remove_from       ='Remove from favorites';var str_pl_new_playlist_created   ='New playlist created';var str_pl_track_added            ='Track added to playlist';var str_pl_track_has_been_removed ='Track has been removed from playlist';var str_ratings                   ='Ratings';var str_remix_close               ='Close search box';var str_remix_lic                 ='This remix will be licensed under a %s license';var str_remix_no_matches          ='Sorry, no sources match \"%s\" Try adding a \'*\': \"%s*\" ';var str_remix_no_matches_gen      ='Sorry, no sources match \"%s\"';var str_remix_no_search_term      ='Please enter a search phrase longer than 3 characters';var str_remix_open                ='Open search box';var str_remix_this_site           ='This site';var str_review_write              ='Write Review';var str_see_results               ='See Results';var str_tags                      ='Tags';var str_thinking                  ='thinking...';var str_topic_delete              ='Delete';var str_topic_edit                ='Edit';var str_topic_reply               ='Reply';var str_topic_reply_to_yourself   ='Reply to yourself';var str_topic_reply_with_quote    ='Reply with quote';var str_topic_reply_to_sn         ='Reply to #{1}';var str_topic_translate           ='Translate';var str_trackback_error           ='There was an error reaching the page:';var str_trackback_no_email        ='You must supply a valid email address';var str_trackback_no_link         ='You must supply a link';var str_trackback_response        ='The administrators have been notified and your #{1} link to \"#{2}\" by #{3} will appear here soon.';var str_trackback_title           ='Submit a Trackback';var str_trackback_type_album      ='Album/CD';      
var str_trackback_type_podcast    ='Podcast';var str_trackback_type_remix      ='Remix';var str_trackback_type_video      ='Video';var str_trackback_type_web        ='Web Page';var str_working                   ='working...';
/*
ModalBox - The pop-up window thingie with AJAX, based on prototype and script.aculo.us.
Copyright Andrey Okonetchnikov (andrej.okonetschnikow@gmail.com), 2006-2007
All rights reserved.
VERSION 1.5.5.1
Last Modified: 09/21/2007
*/
if (!window.Modalbox)
var Modalbox = new Object();Modalbox.Methods = {overrideAlert: false, // Override standard browser alert message with ModalBox
focusableElements: new Array,options: {title: "ModalBox Window", // Title of the ModalBox window
overlayClose: true, // Close modal box by clicking on overlay
width: 500, // Default width in px
height: 90, // Default height in px
overlayOpacity: .75, // Default overlay opacity
overlayDuration: .25, // Default overlay fade in/out duration in seconds
slideDownDuration: .5, // Default Modalbox appear slide down effect in seconds
slideUpDuration: .15, // Default Modalbox hiding slide up effect in seconds
resizeDuration: .2, // Default resize duration seconds
inactiveFade: true, // Fades MB window on inactive state
transitions: true, // Toggles transition effects. Transitions are enabled by default
loadingString: "Please wait. Loading...", // Default loading string message
closeString: "Close window", // Default title attribute for close window link
params: {},method: 'get' // Default Ajax request method
},_options: new Object,setOptions: function(options) {Object.extend(this.options, options || {});},_init: function(options) {// Setting up original options with default options
Object.extend(this._options, this.options);this.setOptions(options);//Create the overlay
this.MBoverlay = Builder.node("div", { id: "MB_overlay", opacity: "0" });//Create the window
this.MBwindow = Builder.node("div", {id: "MB_window", style: "display: none"}, [
this.MBframe = Builder.node("div", {id: "MB_frame"}, [
this.MBheader = Builder.node("div", {id: "MB_header"}, [
this.MBcaption = Builder.node("div", {id: "MB_caption"}),this.MBclose = Builder.node("a", {id: "MB_close", title: this.options.closeString, href: "#"}, [
Builder.build("<span>&times;</span>"),]),]),this.MBcontent = Builder.node("div", {id: "MB_content"}, [
this.MBloading = Builder.node("div", {id: "MB_loading"}, this.options.loadingString),]),]),]);// If title isn't given, the header will not displayed 
if(!this.options.title) this.MBheader.hide();// Inserting into DOM
document.body.insertBefore(this.MBwindow, document.body.childNodes[0]);document.body.insertBefore(this.MBoverlay, document.body.childNodes[0]);// Initial scrolling position of the window. To be used for remove scrolling effect during ModalBox appearing
this.initScrollX = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft;this.initScrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;//Adding event observers
this.hide = this.hide.bindAsEventListener(this);this.close = this._hide.bindAsEventListener(this);this.kbdHandler = this.kbdHandler.bindAsEventListener(this);this._initObservers();this.initialized = true; // Mark as initialized
this.active = true; // Mark as active
this.currFocused = 0;},show: function(content, options) {if(!this.initialized) this._init(options); // Check for is already initialized
this.content = content;this.setOptions(options);Element.update(this.MBcaption, this.options.title); // Updating title of the MB
if(this.MBwindow.style.display == "none") { // First modal box appearing
this._appear();this.event("onShow"); // Passing onShow callback
}
else { // If MB already on the screen, update it
this._update();this.event("onUpdate"); // Passing onUpdate callback
} 
},hide: function(options) { // External hide method to use from external HTML and JS
if(this.initialized) {if(options) Object.extend(this.options, options); // Passing callbacks
if(this.options.transitions)
Effect.SlideUp(this.MBwindow, { duration: this.options.slideUpDuration, afterFinish: this._deinit.bind(this) } );else {Element.hide(this.MBwindow);this._deinit();}
} else throw("Modalbox isn't initialized");},alert: function(message){var html = '<div class="MB_alert"><p>' + message + '</p><input type="button" onclick="Modalbox.hide()" value="OK" /></div>';Modalbox.show(html, {title: 'Alert: ' + document.title.substring(0,46) + '...', width: 300, height: 200});},_hide: function(event) { // Internal hide method to use inside MB class
if(event) Event.stop(event);this.hide();},_appear: function() { // First appearing of MB
if(window.IEversion && (window.IEversion < 7.0)) {this._toggleSelects();}
this._setOverlay();this._setWidth();this._setPosition();if(this.options.transitions) {Element.setStyle(this.MBoverlay, {opacity: 0});new Effect.Fade(this.MBoverlay, {from: 0, 
to: this.options.overlayOpacity, 
duration: this.options.overlayDuration, 
afterFinish: function() {new Effect.SlideDown(this.MBwindow, {duration: this.options.slideDownDuration, 
afterFinish: function(){ 
this._setPosition(); 
this.loadContent();}.bind(this)
});}.bind(this)
});} else {Element.setStyle(this.MBoverlay, {opacity: this.options.overlayOpacity});Element.show(this.MBwindow);this._setPosition(); 
this.loadContent();}
this._setWidthAndPosition = this._setWidthAndPosition.bindAsEventListener(this);Event.observe(window, "resize", this._setWidthAndPosition);},resize: function(byWidth, byHeight, options) { // Change size of MB without loading content
var wHeight = Element.getHeight(this.MBwindow);var wWidth = Element.getWidth(this.MBwindow);var hHeight = Element.getHeight(this.MBheader);var cHeight = Element.getHeight(this.MBcontent);var newHeight = ((wHeight - hHeight + byHeight) < cHeight) ? (cHeight + hHeight - wHeight) : byHeight;this.setOptions(options); // Passing callbacks
if(this.options.transitions) {new Effect.ScaleBy(this.MBwindow, byWidth, newHeight, {duration: this.options.resizeDuration, 
afterFinish: function() { 
this.event("_afterResize"); // Passing internal callback
this.event("afterResize"); // Passing callback
}.bind(this)
});} else {this.MBwindow.setStyle({width: wWidth + byWidth + "px", height: wHeight + newHeight + "px"});setTimeout(function() {this.event("_afterResize"); // Passing internal callback
this.event("afterResize"); // Passing callback
}.bind(this), 1);}
},_update: function() { // Updating MB in case of wizards
Element.update(this.MBcontent, "");this.MBcontent.appendChild(this.MBloading);Element.update(this.MBloading, this.options.loadingString);this.currentDims = [this.MBwindow.offsetWidth, this.MBwindow.offsetHeight];Modalbox.resize((this.options.width - this.currentDims[0]), 
(this.options.height - this.currentDims[1]), 
{_afterResize: this._loadAfterResize.bind(this) });},loadContent: function () {if(this.event("beforeLoad") != false) { // If callback passed false, skip loading of the content
if(typeof this.content == 'string') {var htmlRegExp = new RegExp(/<\/?[^>]+>/gi);if(htmlRegExp.test(this.content)) { // Plain HTML given as a parameter
this._insertContent(this.content);this._putContent();} else 
new Ajax.Request( this.content, { method: this.options.method.toLowerCase(), parameters: this.options.params, 
onComplete: function(transport) {var response = new String(transport.responseText);this._insertContent(transport.responseText.stripScripts());response.extractScripts().map(function(script) { 
return eval(script.replace("<!--", "").replace("// -->", ""));}.bind(window));this._putContent();}.bind(this)
});} else if (typeof this.content == 'object') {// HTML Object is given
this._insertContent(this.content);this._putContent();} else {Modalbox.hide();throw('Please specify correct URL or HTML element (plain HTML or object)');}
}
},_insertContent: function(content){Element.extend(this.MBcontent);this.MBcontent.update("");if(typeof content == 'string')
this.MBcontent.hide().update(content);else if (typeof this.content == 'object') { // HTML Object is given
var _htmlObj = content.cloneNode(true); // If node already a part of DOM we'll clone it
if(this.content.id) this.content.id = "MB_" + this.content.id;/* Add prefix for IDs on all elements inside the DOM node */
this.content.getElementsBySelector('*[id]').each(function(el){ el.id = "MB_" + el.id });this.MBcontent.hide().appendChild(_htmlObj);this.MBcontent.down().show(); // Toggle visibility for hidden nodes
if(navigator.appVersion.match(/\bMSIE\b/)) // Toggling back visibility for hidden selects in IE
$$("#MB_content select").invoke('setStyle', {'visibility': ''});}
},_putContent: function(){// Prepare and resize modal box for content
if(this.options.height == this._options.height)
Modalbox.resize(0, this.MBcontent.getHeight() - Element.getHeight(this.MBwindow) + Element.getHeight(this.MBheader), {afterResize: function(){this.MBcontent.show();this.focusableElements = this._findFocusableElements();this._setFocus(); // Setting focus on first 'focusable' element in content (input, select, textarea, link or button)
this.event("afterLoad"); // Passing callback
}.bind(this)
});else { // Height is defined. Creating a scrollable window
this._setWidth();this.MBcontent.setStyle({overflow: 'auto', height: Element.getHeight(this.MBwindow) - Element.getHeight(this.MBheader) - 13 + 'px'});this.MBcontent.show();this.focusableElements = this._findFocusableElements();this._setFocus(); // Setting focus on first 'focusable' element in content (input, select, textarea, link or button)
this.event("afterLoad"); // Passing callback
}
},activate: function(options){this.setOptions(options);this.active = true;Event.observe(this.MBclose, "click", this.close);if(this.options.overlayClose) Event.observe(this.MBoverlay, "click", this.hide);Element.show(this.MBclose);if(this.options.transitions && this.options.inactiveFade) new Effect.Appear(this.MBwindow, {duration: this.options.slideUpDuration});},deactivate: function(options) {this.setOptions(options);this.active = false;Event.stopObserving(this.MBclose, "click", this.close);if(this.options.overlayClose) Event.stopObserving(this.MBoverlay, "click", this.hide);Element.hide(this.MBclose);if(this.options.transitions && this.options.inactiveFade) new Effect.Fade(this.MBwindow, {duration: this.options.slideUpDuration, to: .75});},_initObservers: function(){Event.observe(this.MBclose, "click", this.close);if(this.options.overlayClose) Event.observe(this.MBoverlay, "click", this.hide);Event.observe(document, "keypress", Modalbox.kbdHandler );},_removeObservers: function(){Event.stopObserving(this.MBclose, "click", this.close);if(this.options.overlayClose) Event.stopObserving(this.MBoverlay, "click", this.hide);Event.stopObserving(document, "keypress", Modalbox.kbdHandler );},_loadAfterResize: function() {this._setWidth();this._setPosition();this.loadContent();},_setFocus: function() { // Setting focus to be looped inside current MB
if(this.focusableElements.length > 0) {var i = 0;var firstEl = this.focusableElements.find(function (el){i++;return el.tabIndex == 1;}) || this.focusableElements.first();this.currFocused = (i == this.focusableElements.length - 1) ? (i-1) : 0;firstEl.focus(); // Focus on first focusable element except close button
} else
$("MB_close").focus(); // If no focusable elements exist focus on close button
},_findFocusableElements: function(){ // Collect form elements or links from MB content
var els = this.MBcontent.getElementsBySelector('input:not([type~=hidden]), select, textarea, button, a[href]');els.invoke('addClassName', 'MB_focusable');return this.MBcontent.getElementsByClassName('MB_focusable');},kbdHandler: function(e) {var node = Event.element(e);switch(e.keyCode) {case Event.KEY_TAB:
Event.stop(e);if(!e.shiftKey) { //Focusing in direct order
if(this.currFocused == this.focusableElements.length - 1) {this.focusableElements.first().focus();this.currFocused = 0;} else {this.currFocused++;this.focusableElements[this.currFocused].focus();}
} else { // Shift key is pressed. Focusing in reverse order
if(this.currFocused == 0) {this.focusableElements.last().focus();this.currFocused = this.focusableElements.length - 1;} else {this.currFocused--;this.focusableElements[this.currFocused].focus();}
}
break;			
case Event.KEY_ESC:
if(this.active) this._hide(e);break;case 32:
this._preventScroll(e);break;case 0: // For Gecko browsers compatibility
if(e.which == 32) this._preventScroll(e);break;case Event.KEY_UP:
case Event.KEY_DOWN:
case Event.KEY_PAGEDOWN:
case Event.KEY_PAGEUP:
case Event.KEY_HOME:
case Event.KEY_END:
if(/Safari|KHTML/.test(navigator.userAgent) && !["textarea", "select"].include(node.tagName.toLowerCase()))
Event.stop(e);else if( (node.tagName.toLowerCase() == "input" && ["submit", "button"].include(node.type)) || (node.tagName.toLowerCase() == "a") )
Event.stop(e);break;}
},_preventScroll: function(event) { // Disabling scrolling by "space" key
if(!["input", "textarea", "select", "button"].include(Event.element(event).tagName.toLowerCase())) 
Event.stop(event);},_deinit: function()
{	
this._removeObservers();Event.stopObserving(window, "resize", this._setWidthAndPosition );if(this.options.transitions) {Effect.toggle(this.MBoverlay, 'appear', {duration: this.options.overlayDuration, afterFinish: this._removeElements.bind(this) });} else {this.MBoverlay.hide();this._removeElements();}
Element.setStyle(this.MBcontent, {overflow: '', height: ''});},_removeElements: function () {if(navigator.appVersion.match(/\bMSIE\b/)) {this._prepareIE("", ""); // If set to auto MSIE will show horizontal scrolling
window.scrollTo(this.initScrollX, this.initScrollY);}
Element.remove(this.MBoverlay);Element.remove(this.MBwindow);/* Replacing prefixes 'MB_' in IDs for the original content */
if(typeof this.content == 'object' && this.content.id && this.content.id.match(/MB_/)) {this.content.getElementsBySelector('*[id]').each(function(el){ el.id = el.id.replace(/MB_/, ""); });this.content.id = this.content.id.replace(/MB_/, "");}
/* Initialized will be set to false */
this.initialized = false;//if(navigator.appVersion.match(/\bMSIE\b/))
if(window.IEversion && (window.IEversion < 7.0)) 
this._toggleSelects(); // Toggle back 'select' elements in IE
this.event("afterHide"); // Passing afterHide callback
this.setOptions(this._options); //Settings options object into intial state
},_setOverlay: function () {if(navigator.appVersion.match(/\bMSIE\b/)) {this._prepareIE("100%", "hidden");if (!navigator.appVersion.match(/\b7.0\b/)) window.scrollTo(0,0); // Disable scrolling on top for IE7
}
},_setWidth: function () { //Set size
Element.setStyle(this.MBwindow, {width: this.options.width + "px", height: this.options.height + "px"});},_setPosition: function () {Element.setStyle(this.MBwindow, {left: Math.round((Element.getWidth(document.body) - Element.getWidth(this.MBwindow)) / 2 ) + "px"});},_setWidthAndPosition: function () {Element.setStyle(this.MBwindow, {width: this.options.width + "px"});this._setPosition();},_getScrollTop: function () { //From: http://www.quirksmode.org/js/doctypes.html
var theTop;if (document.documentElement && document.documentElement.scrollTop)
theTop = document.documentElement.scrollTop;else if (document.body)
theTop = document.body.scrollTop;return theTop;},// For IE browsers -- IE requires height to 100% and overflow hidden (taken from lightbox)
_prepareIE: function(height, overflow){var body = document.getElementsByTagName('body')[0];body.style.height = height;body.style.overflow = overflow;var html = document.getElementsByTagName('html')[0];html.style.height = height;html.style.overflow = overflow; 
},// For IE < 7 browsers -- hiding all SELECT elements
_toggleSelects: function() {var selects = $$("select");// ccHack: invoke with 'setStyle' doesn't seem to work, 
if(this.initialized) {selects.each( function(e) {e.style.display = 'none';});} else {selects.each( function(e) {e.style.display = '';});}
},event: function(eventName) {if(this.options[eventName]) {var returnValue = this.options[eventName](); // Executing callback
this.options[eventName] = null; // Removing callback after execution
if(returnValue != undefined) 
return returnValue;else 
return true;}
return true;}
}
Object.extend(Modalbox, Modalbox.Methods);if(Modalbox.overrideAlert) window.alert = Modalbox.alert;Effect.ScaleBy = Class.create();Object.extend(Object.extend(Effect.ScaleBy.prototype, Effect.Base.prototype), {initialize: function(element, byWidth, byHeight, options) {this.element = $(element)
var options = Object.extend({scaleFromTop: true,scaleMode: 'box',        // 'box' or 'contents' or {} with provided values
scaleByWidth: byWidth,scaleByHeight: byHeight
}, arguments[3] || {});this.start(options);},setup: function() {this.elementPositioning = this.element.getStyle('position');this.originalTop  = this.element.offsetTop;this.originalLeft = this.element.offsetLeft;this.dims = null;if(this.options.scaleMode=='box')
this.dims = [this.element.offsetHeight, this.element.offsetWidth];if(/^content/.test(this.options.scaleMode))
this.dims = [this.element.scrollHeight, this.element.scrollWidth];if(!this.dims)
this.dims = [this.options.scaleMode.originalHeight,this.options.scaleMode.originalWidth];this.deltaY = this.options.scaleByHeight;this.deltaX = this.options.scaleByWidth;},update: function(position) {var currentHeight = this.dims[0] + (this.deltaY * position);var currentWidth = this.dims[1] + (this.deltaX * position);currentHeight = (currentHeight > 0) ? currentHeight : 0;currentWidth = (currentWidth > 0) ? currentWidth : 0;this.setDimensions(currentHeight, currentWidth);},setDimensions: function(height, width) {var d = {};d.width = width + 'px';d.height = height + 'px';var topd  = Math.round((height - this.dims[0])/2);var leftd = Math.round((width  - this.dims[1])/2);if(this.elementPositioning == 'absolute' || this.elementPositioning == 'fixed') {if(!this.options.scaleFromTop) d.top = this.originalTop-topd + 'px';d.left = this.originalLeft-leftd + 'px';} else {if(!this.options.scaleFromTop) d.top = -topd + 'px';d.left = -leftd + 'px';}
this.element.setStyle(d);}
});
/*
* Creative Commons has made the contents of this file
* available under a CC-GNU-GPL license:
*
* http://creativecommons.org/licenses/GPL/2.0/
*
* A copy of the full license can be found as part of this
* distribution in the file LICENSE.TXT.
* 
* You may use the ccHost software in accordance with the
* terms of that license. You agree that you are solely 
* responsible for your use of the ccHost software and you
* represent and warrant to Creative Commons that your use
* of the ccHost software will comply with the CC-GNU-GPL.
*
* $Id: cchost.js 13205 2009-07-31 20:04:05Z fourstones $
*
*/
var cc_unloading = false;
Event.observe(window,'beforeunload', function() { cc_unloading = true; } );
/*
Some browsers (er, like IE) cache ajax requests, even if the
user empties their browser cache, the ajax fetcher still 
keeps things around. So we override the Ajax.Request ctor
and tack on a random url argument (the current time) which
fools IE into getting the live data.
*/
Ajax.Request.prototype._old_request_init = Ajax.Request.prototype.initialize;
Ajax.Request.prototype.initialize = function(url, options) {
var _q_ = '?';
if( url.match(/\?/) )
_q_ = '&';
url += _q_ + '_cache_buster=' + new Date().getTime();
this._old_request_init(url,options);
};
function CC$$(expr,parent)
{
return new SelectorLiteAddon(expr.split(/\s+/)).get(parent);
}
/*
Double clicking on a link that is supposed to open a modal box
has several bad side effects, double pumping the Ajax request
on slow connections, closing the box before it opens on fast
ones. Here we inject a 2 sec time buffer between requests to
open, re-open and close, hopefully covering all those cases.
*/
if (!window.Modalbox)
throw( "no modalbox defined!" );
Modalbox._lastopentime = 0;
Modalbox._old_show = Modalbox.show;
Modalbox._old_hide = Modalbox.hide;
Modalbox.show = function( content, options ) {
var now = new Date().getTime();
if( this._lastopentime )
{
var tdiff = now - this._lastopentime;
if( tdiff < 2000 )
return;
}
this._lastopentime = now;
this._old_show( content, options );
};
Modalbox.hide = function(options) {
var now = new Date().getTime();
if( this._lastopentime )
{
var tdiff = now - this._lastopentime;
if( tdiff < 2000 )
return false;
}
var val = this._old_hide(options);
this._lastopentime = 0;
return val;
};
/*
Hook menu items so they go to a browser popup
usage:
new popupHook( [ 'mi_managesite', 'mi_global_settings' ] );  
*/
var popupHook = Class.create();
popupHook.prototype = {
options: { height:600, width:900 },
initialize: function(ids,options) {
Object.extend(this.options, options || {});
var me = this;
ids.each( function( id ) {
if( $(id) )
{
var e = $(id);
var href = e.href;
e.href = 'javascript://hooked for popup ' + id;
title = e.innerHTML.stripTags();
Event.observe( id, 'click', me.onClick.bindAsEventListener( me, href, title ) );
}
} );
},
onClick: function( e, href, thetitle ) {
if( href.indexOf('?') == -1 )
href += '?popup=1';
else
href += '&popup=1';
var dim = "height=" + this.options.height + ",width=" + this.options.width ;
var win = window.open( href, 'cchostextrawin', "status=1,toolbar=0,location=0,menubar=0,directories=0," +
"resizable=1,scrollbars=1," + dim );
win.title = thetitle;
}
}
/*
Hook a link so it goes to a DHTML model popup div
*/
var modalHook = Class.create();
modalHook.prototype = {
in_hook: false,
initialize: function(ids) {
var me = this;
ids.each( function( id ) {
if( $(id) )
{
var e = $(id);
var href = e.href;
e.href = 'javascript://hooked ' + id;
title = e.innerHTML.stripTags();
Event.observe( id, 'click', me.onClick.bindAsEventListener( me, href, title ) );
}
} );
},
onClick: function( e, href, thetitle ) {
if( this.in_hook ) // prevent double-click processing
{
Event.stop(e);
alert('wups');
return false;
}
this.in_hook = true;
if( href.indexOf('?') == -1 )
href += '?ajax=1';
else
href += '&ajax=1';
Modalbox.show( href, {title: thetitle, width: 700, height: 550, afterHide: this.afterHide.bind(this) } );
},
afterHide: function() {
this.in_hook = false;
}
}
/*
hook a class of links so the id triggers a query in a DHTML modal popup
*/
var queryPopup = Class.create();
queryPopup.prototype = {
className: '',
template: '',
title: '',
width: null,
height: null,
in_hook: false,
initialize: function(className,template,title) {
this.className = className;
this.template = template;
this.title = title;
},
hookLink: function( element, query ) {
Event.observe( element, 'click', this.onQClick.bindAsEventListener(this,query) );
},
onQClick: function( e, query ) {
this._show(query_url + query);
},
_show: function(url) {
if( this.in_hook )
return;
this.in_hook = true;
var params = {title: this.title, afterHide: this.afterHide.bind(this) };
if( this.height )
params.height = this.height;
if( this.width )
params.width = this.width;
Modalbox.show( url,  params );
},
hookLinks: function(parent) {
var me = this;
CC$$('.' + this.className,parent).each( function(link) {
var upload_id = link.id.match(/[0-9]+$/);
Event.observe( link, 'click', me.onClick.bindAsEventListener( me, upload_id ) );
});
},
onClick: function( e, upload_id ) {
this._show(query_url + 'f=html&t='+this.template+'&ids=' + upload_id);
},
afterHide: function() {
this.in_hook = false;
}
}
/*
If user is logged in, make ratings stars interactive
(called from userHooks below)
*/
var ratingsHooks = Class.create();
ratingsHooks.prototype = {
full_star_url: null,
null_star_url: null,
return_macro: null,
initialize: function(ok_to_rate) {
try
{
this.full_star_url = full_star;
this.null_star_url = null_star;
this.return_macro = rate_return_t || null;
var me = this;
$$('.rate_star').each( function(img) {
var m = img.id.match(/([0-9]+)_([0-9]+)$/);
var id = m[2];
var num = m[1];
if( ok_to_rate.include(id) )
{
img.altsrc = img.src;
Event.observe(img,'click',me.onRateClick.bindAsEventListener(me,id,num));
Event.observe(img,'mouseover',me.onRateHover.bindAsEventListener(me,id,num));
Event.observe(img,'mouseout',me.onRateOff.bindAsEventListener(me,id,num));
}
});
}
catch (e)
{
alert( 'cchost.js (1): ' + e);
}
},
onRateClick: function(event,id,num) {
var rlabel = $("rate_label_" + id);
if( rlabel )
rlabel.innerHTML = str_ratings;
var h_elem = $("rate_head_" + id);
if( h_elem )
h_elem.style.display = 'none';
var b_elem = $("rate_edit_" + id);
if( b_elem )
b_elem.style.display = 'none';
var d_elem = $("rate_block_" + id);
d_elem.innerHTML = '...';
var url = home_url + "rate/" + id + "/" + num;
if( this.return_macro )
url += q + 'rmacro=' + this.return_macro + '&_cache_buster=' + new Date().getTime();
new Ajax.Updater(d_elem,url);
},
onRateOff: function(event,id,num) {
var i;
for( i=1; i<6; i++)
{
var img = $('rate_star_' + i + '_' + id);
img.src = img.altsrc;
}
},
onRateHover: function(event,id,num) {
var i;
for( i=1; i<=num; i++)
{
var img = 'rate_star_' + i + '_' + id;
$(img).src = this.full_star_url;
}
}
}
/*
If the user is logged in while listing records, enable
in-situ reviewing (called from userHooks below)
*/
var quickReviewHooks = Class.create();
quickReviewHooks.prototype = {
initialize: function(reviewable_ids) {
try
{
var me = this;
reviewable_ids.each( function(id) {
var btn_holder = $('instareview_btn_' + id);
if( btn_holder )
{
var btn_id     = 'review_button_' + id;
var html = '<a href="javascript://instarview" class="instareview_btn" id="' + btn_id + '">&nbsp;</a>';
btn_holder.innerHTML = html;
Event.observe(btn_id,'click',me.onQuickReviewClick.bindAsEventListener(me,id));
}
});
}
catch (e)
{
alert('cchost.js (2): ' + e);
}
},
onQuickReviewClick: function(event,id) {
var url = home_url + 'reviews/post/' + id + q + 'ajax=1';
Modalbox.show( url, {title: str_review_write, width: 500, height: 500} );
}
}
/*
If the user is logged in, make the 'recommends' thumbs up interactive
(called from userHooks below)
*/
var recommendsHooks = Class.create();
recommendsHooks.prototype = {
return_macro: null,
initialize: function(ok_to_rate,block_parent) {
try
{
if( block_parent )
{
if( block_parent == 'undefined' ) {
block_parent =  null;
}
else {
block_parent = $(block_parent);
}
}
var me = this;
this.return_macro = recommend_return_t || null ;
CC$$('.recommend_block',block_parent).each( function(e) {
var id = e.id.match(/[0-9]+$/);
if( ok_to_rate.include(id) ) {
var html = e.innerHTML;
var newHtml = '<span class="recommend_link">' + html + '</span>';
e.innerHTML = newHtml;
Event.observe(e,'click',me.onRecommendClick.bindAsEventListener(me,id,e));
Element.removeClassName(e,'rated');
}
});
}
catch (e)
{
alert( 'cchost.js (3): ' + e);
}
},
onRecommendClick: function(event,id) {
var d_elem = $("recommend_block_" + id);
d_elem.innerHTML = '...';
var url = home_url + "rate/" + id + "/5";
if( this.return_macro )
url += q + 'rmacro=' + this.return_macro + '&_cache_buster=' + new Date().getTime();
new Ajax.Updater(d_elem,url,{onComplete:this.onRecommendFilled.bind(this,id)});
},
onRecommendFilled: function(id) {
Element.addClassName($("recommend_block_" + id),'rated');
}
}
/*
If the user is logged in, make the topics/reviews interactive
(called from userHooks below)
*/
var topicHooks = Class.create();
topicHooks.prototype = {
initialize: function(topics_cmds) {
try
{
topics_cmds.each( function(cmd_meta) {
var id = cmd_meta.id;
var html = '';
if( cmd_meta.cmds )
{
cmd_meta.cmds.each( function(cmd) {
html += '<a class="cc_gen_button" href="' + cmd.href + '"';
if( cmd.id )
{
html += ' id="' + cmd.id + '" ';
}
if( cmd.hidden )
{
html += ' style="display:none" ';
}
html += '><span>' + cc_str(cmd.text) + '</span></a> ';
});
$('commands_' + id).innerHTML = html;
}
});
}
catch (e)
{
alert('cchost.js (4): ' + e);
}
}
}
/*
If the user is logged in, make the appropriate HTML parts interactive
(ratings, topic commands, etc.)
*/
var userHookup = Class.create();
userHookup.prototype = {
req_url: null,
block_parent: null,
initialize: function(req,params,block_parent) {
this.block_parent = block_parent;
this.req_url = home_url + 'user_hook/' + req + q + params;
new Ajax.Request( this.req_url, { method: 'get', onComplete: this.onUserHooks.bind(this) } );
},
onUserHooks: function(resp,json) {
try
{
if( !json )
json = eval( '(' + resp.responseText + ')' );
if( json  )
{
if( json.ok_to_rate && json.ok_to_rate.length )
{
if( json.rate_mode == 'rate' )
{
new ratingsHooks(json.ok_to_rate,this.block_parent);
}
else if( json.rate_mode == 'recommend' )
{
new recommendsHooks(json.ok_to_rate,this.block_parent);
}
else
{
alert('error: unknown rate mode: ' + json.rate_mode );
}
}
else
{
if( json.topic_cmds )
{
new topicHooks(json.topic_cmds,this.block_parent);
}
}
if( json.reviewable )
{
new quickReviewHooks(json.reviewable,this.block_parent);
}
}
}
catch (e)
{
if( !cc_unloading )
alert('cchost.js (5): ' + e);
}
}
}
function cc_str(s)
{
if( !s.match )
{
var template = new Template(cc_str(s[0]));
var args = $A(s);
s = template.evaluate( args );
}
if( s.match(/^str_/) )
return eval( s );
return s;
}
function upload_trackback( upload_id, type )
{
var url = query_url + 'ajax=1&t=trackback&ttype=' + type + '&ids=' + upload_id;
var h = type == 'video' ? 560 : 500;
Modalbox.show( url, {title: str_trackback_title, width: 480, height: h} );
}
function ajax_debug(url) {
if( url.match(/^http:/) )
debug_stuff('<a href="' + url + '">' + url + '</a>');
else
debug_stuff(url);
}
function debug_stuff(str) {
if( !$('debug') )
new Insertion.Top('content','<div id="debug"></div>');
$('debug').style.display = 'block';
$('debug').innerHTML += str;
}
function _d(obj) {
if( !obj )
debug_stuff('empty');
else
debug_stuff( Object.toJSON(obj) + ' ' );
}
var ccPopupManagerMethods = {
openPopup: null,
currX: 0,
currY: 0,
thinkingDiv: null,
thinkingEnabled: false,
msgDiv: null,
prevMsgClass: null,
errCount: 0,
itme: 'hello me',
mode: null,
StartThinking: function(event) {
this.currY  = (parseInt(Event.pointerY(event)) - 5); 
this.currX  = (parseInt(Event.pointerX(event)) + 15); 
if( this.currX > (  document.body.offsetWidth - 50 ) )
this.currX /= 2;
this.thinkingEnabled = true;
},
StopThinking: function(dur) {
if( this.mode && this.mode == 'err' )
return;
if( this.thinkingEnabled )
{
Effect.Fade(this.thinkingDiv, { delay: dur, duration: 0.3 } );
this.thinkingEnabled = false;
}
},
ShowThinking: function(text){
if( this.mode && this.mode == 'err' )
return;
if( !this.thinkingEnabled )
{
this.currY = 20;
this.currX = 300;
this.thinkingEnabled = true;
}
if( !$('cc_thinking') )
{
this.thinkingDiv = document.createElement('div');
this.thinkingDiv.id = 'cc_thinking';
this.thinkingDiv.className = 'light_bg dark_border';
document.body.appendChild(this.thinkingDiv);
}
if( this.prevMsgClass )
{
Element.removeClassName(this.thinkingDiv,this.prevMsgClass);
this.prevMsgClass = null;
}
this.thinkingDiv.innerHTML = text || str_thinking;
this.thinkingDiv.style.top  = this.currY + 'px';
this.thinkingDiv.style.left = this.currX + 'px';
this.thinkingDiv.style.zIndex = '200';
Effect.Appear( this.thinkingDiv, { duration: 0.2 } );
},
onAjaxReturn: function(json) {
if( json )
{
var dur = 4.5;
if( json.message )
{
this.ShowMessage('message',json.message,dur);
}
else if( json.warning )
{
this.ShowMessage('warning',json.warning,dur);
}
else if( json.err )
{
this.ShowMessage('error',json.err,5.0);
}
else
{
if( Ajax.activeRequestCount == 0 )
this.StopThinking(0.2);
}
}
else
{
if( Ajax.activeRequestCount == 0 )
this.StopThinking(0.2);
}
},
ShowMessage: function(type,text,dur)
{
if( this.mode && this.mode == 'err' )
return;
try
{
this.ShowThinking(cc_str(text));
var className = 'ajaxmsg_' + (type == 'exception' ? 'error' : type);
this.prevMsgClass = className;
Element.addClassName(this.thinkingDiv,className);
this.mode = type == 'exception' ? 'err' : null;
this.StopThinking(dur);
}
catch(ex)
{
alert('cchost.js (6): ' +  + ex.message);
}
},
ShowElement: function(id) {
Effect.Appear( id, { duration: 0.5 } );
},
HideElement: function(id) {
Effect.Fade( id, { duration: 0.5 } );
},
/**
*    User clicked something that trigged an ajax call for data
*
*  Put up the little 'thinking' div, wait for response
*/
userClickDataFetch: function(event,id) {
this._close_any_popups();
this.StartThinking(event);
Event.stop(event);
},
/**
*  Data came back from ajax request, open the popup with 'id'
*/
dataFetchedOpenPopup: function(id) {
if( id == this.openPopup )
return;
this._close_any_popups();
this.openPopup = id;
this.ShowElement(id);
this._hook_window();
},
/*
* Data is cached in hidden popup, reopen it now
*/
reopenPopupOrCloseIfOpen: function(event,id) {
if( id == this.openPopup )
{
this._close_any_popups();
}
else
{
this.StartThinking(event);
this.dataFetchedOpenPopup(id);
}
Event.stop(event);
},
/**
* 
*/
clearWindowClick: function(event) {
this._close_any_popups();
},
_close_any_popups: function() {
if( this.openPopup )
{
this.HideElement(this.openPopup);
this.openPopup = null;
}
}
}
var ccPopupManager = Object.extend(
{
bodyHooked: false,
_hook_window: function() {
if( !this.bodyHooked )
{
Event.observe( document.body /* window */, 'click', this.clearWindowClick.bindAsEventListener(this));
this.bodyHooked = true;
}
},
onCreate: function(req){
if( !Prototype.Browser.IE )
{
this.ShowThinking();
}
else
{
if( !this.thinkingEnabled )
{
this.currY = 20;
this.currX = 300;
this.thinkingEnabled = true;
}
}
},
onException: function(req,ex) {
this.ShowMessage( 'exception', ex.toString(), 6.0 );
},
onComplete: function(req,t,json) {
this.onAjaxReturn(json);
}
}, ccPopupManagerMethods );
Ajax.Responders.register(ccPopupManager);
var ccFormMask = Class.create();
ccFormMask.prototype = {
text: null,
title: null,
initialize: function(form_id,msg,hook_submit,title)
{
this.text = msg;
this.title = title;
if( hook_submit )
Event.observe(form_id,'submit', this.dull_screen.bindAsEventListener(this) );
},
dull_screen: function()
{ 
Modalbox.show( this.text, {title: this.title, 
width: 600, height: 400, 
overlayClose: false, 
transitions: false,
slideDownDuration: 0.0 } );
return true;
}
}
var ccReviewFormHook = Class.create();
ccReviewFormHook.prototype = {
initialize: function(form_id) {
Event.observe(form_id,'submit', this.quiet_submit.bindAsEventListener(this,form_id) );
},
quiet_submit: function(event,form_id) {
var url = $(form_id).action;
var params = Form.serialize(form_id);
new Ajax.Request( url, { method: 'post', parameters: params, onComplete: this.form_return.bind(this) } );
Event.stop(event);
return false;
},
form_return: function(resp,json) {
if( json && json.reviews_url )
{
var html = '<a class="upload_review_link" href="' + json.reviews_url + '">(' + json.num_reviews + ')</a>';
var target = $('review_' + json.upload_id);
if( target )
target.innerHTML = html;
Modalbox.hide();
}
}
}
function cc_window_dim() {
var w = window;
var T, L, W, H;
with (w.document) {
if (w.document.documentElement && documentElement.scrollTop) {
T = documentElement.scrollTop;
L = documentElement.scrollLeft;
} else if (w.document.body) {
T = body.scrollTop;
L = body.scrollLeft;
}
if (w.innerWidth) {
W = w.innerWidth;
H = w.innerHeight;
} else if (w.document.documentElement && documentElement.clientWidth) {
W = documentElement.clientWidth;
H = documentElement.clientHeight;
} else {
W = body.offsetWidth;
H = body.offsetHeight
}
}
return { top: T, left: L, width: W, height: H };
}
/**
* DD_roundies, this adds rounded-corner CSS in standard browsers and VML sublayers in IE that accomplish a similar appearance when comparing said browsers.
* Author: Drew Diller
* Email: drew.diller@gmail.com
* URL: http://www.dillerdesign.com/experiment/DD_roundies/
* Version: 0.0.2a
* Licensed under the MIT License: http://dillerdesign.com/experiment/DD_roundies/#license
*
* Usage:
* DD_roundies.addRule('#doc .container', '10px 5px'); // selector and multiple radii
* DD_roundies.addRule('.box', 5, true); // selector, radius, and optional addition of border-radius code for standard browsers.
* 
* Just want the PNG fixing effect for IE6, and don't want to also use the DD_belatedPNG library?  Don't give any additional arguments after the CSS selector.
* DD_roundies.addRule('.your .example img');
**/
var DD_roundies = {
ns: 'DD_roundies',
IE6: false,
IE7: false,
IE8: false,
IEversion: function() {
if (document.documentMode != 8 && document.namespaces && !document.namespaces[this.ns]) {
this.IE6 = true;
this.IE7 = true;
}
else if (document.documentMode == 8) {
this.IE8 = true;
}
},
querySelector: document.querySelectorAll,
selectorsToProcess: [],
imgSize: {},
createVmlNameSpace: function() { /* enable VML */
if (this.IE6 || this.IE7) {
document.namespaces.add(this.ns, 'urn:schemas-microsoft-com:vml');
}
if (this.IE8) {
document.writeln('<?import namespace="' + this.ns + '" implementation="#default#VML" ?>');
}
},
createVmlStyleSheet: function() { /* style VML, enable behaviors */
/*
Just in case lots of other developers have added
lots of other stylesheets using document.createStyleSheet
and hit the 31-limit mark, let's not use that method!
further reading: http://msdn.microsoft.com/en-us/library/ms531194(VS.85).aspx
*/
var style = document.createElement('style');
document.documentElement.firstChild.insertBefore(style, document.documentElement.firstChild.firstChild);
if (style.styleSheet) { /* IE */
try {
var styleSheet = style.styleSheet;
styleSheet.addRule(this.ns + '\\:*', '{behavior:url(#default#VML)}');
this.styleSheet = styleSheet;
} catch(err) {}
}
else {
this.styleSheet = style;
}
},
/**
* Method to use from afar - refer to it whenever.
* Example for IE only: DD_roundies.addRule('div.boxy_box', '10px 5px');
* Example for IE, Firefox, and WebKit: DD_roundies.addRule('div.boxy_box', '10px 5px', true);
* @param {String} selector - REQUIRED - a CSS selector, such as '#doc .container'
* @param {Integer} radius - REQUIRED - the desired radius for the box corners
* @param {Boolean} standards - OPTIONAL - true if you also wish to output -moz-border-radius/-webkit-border-radius/border-radius declarations
**/
addRule: function(selector, rad, standards) {
if (typeof rad == 'undefined' || rad === null) {
rad = 0;
}
if (rad.constructor.toString().search('Array') == -1) {
rad = rad.toString().replace(/[^0-9 ]/g, '').split(' ');
}
for (var i=0; i<4; i++) {
rad[i] = (!rad[i] && rad[i] !== 0) ? rad[Math.max((i-2), 0)] : rad[i];
}
if (this.styleSheet) {
if (this.styleSheet.addRule) { /* IE */
var selectors = selector.split(','); /* multiple selectors supported, no need for multiple calls to this anymore */
for (var i=0; i<selectors.length; i++) {
this.styleSheet.addRule(selectors[i], 'behavior:expression(DD_roundies.roundify.call(this, [' + rad.join(',') + ']))'); /* seems to execute the function without adding it to the stylesheet - interesting... */
}
}
else if (standards) {
var moz_implementation = rad.join('px ') + 'px';
this.styleSheet.appendChild(document.createTextNode(selector + ' {border-radius:' + moz_implementation + '; -moz-border-radius:' + moz_implementation + ';}'));
this.styleSheet.appendChild(document.createTextNode(selector + ' {-webkit-border-top-left-radius:' + rad[0] + 'px ' + rad[0] + 'px; -webkit-border-top-right-radius:' + rad[1] + 'px ' + rad[1] + 'px; -webkit-border-bottom-right-radius:' + rad[2] + 'px ' + rad[2] + 'px; -webkit-border-bottom-left-radius:' + rad[3] + 'px ' + rad[3] + 'px;}'));
}
}
else if (this.IE8) {
this.selectorsToProcess.push({'selector':selector, 'radii':rad});
}
},
readPropertyChanges: function(el) {
switch (event.propertyName) {
case 'style.border':
case 'style.borderWidth':
case 'style.padding':
this.applyVML(el);
break;
case 'style.borderColor':
this.vmlStrokeColor(el);
break;
case 'style.backgroundColor':
case 'style.backgroundPosition':
case 'style.backgroundRepeat':
this.applyVML(el);
break;
case 'style.display':
el.vmlBox.style.display = (el.style.display == 'none') ? 'none' : 'block';
break;
case 'style.filter':
this.vmlOpacity(el);
break;
case 'style.zIndex':
el.vmlBox.style.zIndex = el.style.zIndex;
break;
}
},
applyVML: function(el) {
el.runtimeStyle.cssText = '';
this.vmlFill(el);
this.vmlStrokeColor(el);
this.vmlStrokeWeight(el);
this.vmlOffsets(el);
this.vmlPath(el);
this.nixBorder(el);
this.vmlOpacity(el);
},
vmlOpacity: function(el) {
if (el.currentStyle.filter.search('lpha') != -1) {
var trans = el.currentStyle.filter;
trans = parseInt(trans.substring(trans.lastIndexOf('=')+1, trans.lastIndexOf(')')), 10)/100;
for (var v in el.vml) {
el.vml[v].filler.opacity = trans;
}
}
},
vmlFill: function(el) {
if (!el.currentStyle) {
return;
} else {
var elStyle = el.currentStyle;
}
el.runtimeStyle.backgroundColor = '';
el.runtimeStyle.backgroundImage = '';
var noColor = (elStyle.backgroundColor == 'transparent');
var noImg = true;
if (elStyle.backgroundImage != 'none' || el.isImg) {
if (!el.isImg) {
el.vmlBg = elStyle.backgroundImage;
el.vmlBg = el.vmlBg.substr(5, el.vmlBg.lastIndexOf('")')-5);
}
else {
el.vmlBg = el.src;
}
var lib = this;
if (!lib.imgSize[el.vmlBg]) { /* determine size of loaded image */
var img = document.createElement('img');
img.attachEvent('onload', function() {
this.width = this.offsetWidth; /* weird cache-busting requirement! */
this.height = this.offsetHeight;
lib.vmlOffsets(el);
});
img.className = lib.ns + '_sizeFinder';
img.runtimeStyle.cssText = 'behavior:none; position:absolute; top:-10000px; left:-10000px; border:none;'; /* make sure to set behavior to none to prevent accidental matching of the helper elements! */
img.src = el.vmlBg;
img.removeAttribute('width');
img.removeAttribute('height');
document.body.insertBefore(img, document.body.firstChild);
lib.imgSize[el.vmlBg] = img;
}
el.vml.image.filler.src = el.vmlBg;
noImg = false;
}
el.vml.image.filled = !noImg;
el.vml.image.fillcolor = 'none';
el.vml.color.filled = !noColor;
el.vml.color.fillcolor = elStyle.backgroundColor;
el.runtimeStyle.backgroundImage = 'none';
el.runtimeStyle.backgroundColor = 'transparent';
},
vmlStrokeColor: function(el) {
el.vml.stroke.fillcolor = el.currentStyle.borderColor;
},
vmlStrokeWeight: function(el) {
var borders = ['Top', 'Right', 'Bottom', 'Left'];
el.bW = {};
for (var b=0; b<4; b++) {
el.bW[borders[b]] = parseInt(el.currentStyle['border' + borders[b] + 'Width'], 10) || 0;
}
},
vmlOffsets: function(el) {
var dims = ['Left', 'Top', 'Width', 'Height'];
for (var d=0; d<4; d++) {
el.dim[dims[d]] = el['offset'+dims[d]];
}
var assign = function(obj, topLeft) {
obj.style.left = (topLeft ? 0 : el.dim.Left) + 'px';
obj.style.top = (topLeft ? 0 : el.dim.Top) + 'px';
obj.style.width = el.dim.Width + 'px';
obj.style.height = el.dim.Height + 'px';
};
for (var v in el.vml) {
var mult = (v == 'image') ? 1 : 2;
el.vml[v].coordsize = (el.dim.Width*mult) + ', ' + (el.dim.Height*mult);
assign(el.vml[v], true);
}
assign(el.vmlBox, false);
if (DD_roundies.IE8) {
el.vml.stroke.style.margin = '-1px';
if (typeof el.bW == 'undefined') {
this.vmlStrokeWeight(el);
}
el.vml.color.style.margin = (el.bW.Top-1) + 'px ' + (el.bW.Left-1) + 'px';
}
},
vmlPath: function(el) {
var coords = function(direction, w, h, r, aL, aT, mult) {
var cmd = direction ? ['m', 'qy', 'l', 'qx', 'l', 'qy', 'l', 'qx', 'l'] : ['qx', 'l', 'qy', 'l', 'qx', 'l', 'qy', 'l', 'm']; /* whoa */
aL *= mult;
aT *= mult;
w *= mult;
h *= mult;
var R = r.slice(); /* do not affect original array */
for (var i=0; i<4; i++) {
R[i] *= mult;
R[i] = Math.min(w/2, h/2, R[i]); /* make sure you do not get funky shapes - pick the smallest: half of the width, half of the height, or current value */
}
var coords = [
cmd[0] + Math.floor(0+aL) +','+ Math.floor(R[0]+aT),
cmd[1] + Math.floor(R[0]+aL) +','+ Math.floor(0+aT),
cmd[2] + Math.ceil(w-R[1]+aL) +','+ Math.floor(0+aT),
cmd[3] + Math.ceil(w+aL) +','+ Math.floor(R[1]+aT),
cmd[4] + Math.ceil(w+aL) +','+ Math.ceil(h-R[2]+aT),
cmd[5] + Math.ceil(w-R[2]+aL) +','+ Math.ceil(h+aT),
cmd[6] + Math.floor(R[3]+aL) +','+ Math.ceil(h+aT),
cmd[7] + Math.floor(0+aL) +','+ Math.ceil(h-R[3]+aT),
cmd[8] + Math.floor(0+aL) +','+ Math.floor(R[0]+aT)
];
if (!direction) {
coords.reverse();
}
var path = coords.join('');
return path;
};
if (typeof el.bW == 'undefined') {
this.vmlStrokeWeight(el);
}
var bW = el.bW;
var rad = el.DD_radii.slice();
/* determine outer curves */
var outer = coords(true, el.dim.Width, el.dim.Height, rad, 0, 0, 2);
/* determine inner curves */
rad[0] -= Math.max(bW.Left, bW.Top);
rad[1] -= Math.max(bW.Top, bW.Right);
rad[2] -= Math.max(bW.Right, bW.Bottom);
rad[3] -= Math.max(bW.Bottom, bW.Left);
for (var i=0; i<4; i++) {
rad[i] = Math.max(rad[i], 0);
}
var inner = coords(false, el.dim.Width-bW.Left-bW.Right, el.dim.Height-bW.Top-bW.Bottom, rad, bW.Left, bW.Top, 2);
var image = coords(true, el.dim.Width-bW.Left-bW.Right+1, el.dim.Height-bW.Top-bW.Bottom+1, rad, bW.Left, bW.Top, 1);
/* apply huge path string */
el.vml.color.path = inner;
el.vml.image.path = image;
el.vml.stroke.path = outer + inner;
this.clipImage(el);
},
nixBorder: function(el) {
var s = el.currentStyle;
var sides = ['Top', 'Left', 'Right', 'Bottom'];
for (var i=0; i<4; i++) {
el.runtimeStyle['padding' + sides[i]] = (parseInt(s['padding' + sides[i]], 10) || 0) + (parseInt(s['border' + sides[i] + 'Width'], 10) || 0) + 'px';
}
el.runtimeStyle.border = 'none';
},
clipImage: function(el) {
var lib = DD_roundies;
if (!el.vmlBg || !lib.imgSize[el.vmlBg]) {
return;
}
var thisStyle = el.currentStyle;
var bg = {'X':0, 'Y':0};
var figurePercentage = function(axis, position) {
var fraction = true;
switch(position) {
case 'left':
case 'top':
bg[axis] = 0;
break;
case 'center':
bg[axis] = 0.5;
break;
case 'right':
case 'bottom':
bg[axis] = 1;
break;
default:
if (position.search('%') != -1) {
bg[axis] = parseInt(position, 10) * 0.01;
}
else {
fraction = false;
}
}
var horz = (axis == 'X');
bg[axis] = Math.ceil(fraction ? (( el.dim[horz ? 'Width' : 'Height'] - (el.bW[horz ? 'Left' : 'Top'] + el.bW[horz ? 'Right' : 'Bottom']) ) * bg[axis]) - (lib.imgSize[el.vmlBg][horz ? 'width' : 'height'] * bg[axis]) : parseInt(position, 10));
bg[axis] += 1;
};
for (var b in bg) {
figurePercentage(b, thisStyle['backgroundPosition'+b]);
}
el.vml.image.filler.position = (bg.X/(el.dim.Width-el.bW.Left-el.bW.Right+1)) + ',' + (bg.Y/(el.dim.Height-el.bW.Top-el.bW.Bottom+1));
var bgR = thisStyle.backgroundRepeat;
var c = {'T':1, 'R':el.dim.Width+1, 'B':el.dim.Height+1, 'L':1}; /* these are defaults for repeat of any kind */
var altC = { 'X': {'b1': 'L', 'b2': 'R', 'd': 'Width'}, 'Y': {'b1': 'T', 'b2': 'B', 'd': 'Height'} };
if (bgR != 'repeat') {
c = {'T':(bg.Y), 'R':(bg.X+lib.imgSize[el.vmlBg].width), 'B':(bg.Y+lib.imgSize[el.vmlBg].height), 'L':(bg.X)}; /* these are defaults for no-repeat - clips down to the image location */
if (bgR.search('repeat-') != -1) { /* now let's revert to dC for repeat-x or repeat-y */
var v = bgR.split('repeat-')[1].toUpperCase();
c[altC[v].b1] = 1;
c[altC[v].b2] = el.dim[altC[v].d]+1;
}
if (c.B > el.dim.Height) {
c.B = el.dim.Height+1;
}
}
el.vml.image.style.clip = 'rect('+c.T+'px '+c.R+'px '+c.B+'px '+c.L+'px)';
},
pseudoClass: function(el) {
var self = this;
setTimeout(function() { /* would not work as intended without setTimeout */
self.applyVML(el);
}, 1);
},
reposition: function(el) {
this.vmlOffsets(el);
this.vmlPath(el);
},
roundify: function(rad) {
this.style.behavior = 'none';
if (!this.currentStyle) {
return;
}
else {
var thisStyle = this.currentStyle;
}
var allowed = {BODY: false, TABLE: false, TR: false, TD: false, SELECT: false, OPTION: false, TEXTAREA: false};
if (allowed[this.nodeName] === false) { /* elements not supported yet */
return;
}
var self = this; /* who knows when you might need a setTimeout */
var lib = DD_roundies;
this.DD_radii = rad;
this.dim = {};
/* attach handlers */
var handlers = {resize: 'reposition', move: 'reposition'};
if (this.nodeName == 'A') {
var moreForAs = {mouseleave: 'pseudoClass', mouseenter: 'pseudoClass', focus: 'pseudoClass', blur: 'pseudoClass'};
for (var a in moreForAs) {
handlers[a] = moreForAs[a];
}
}
for (var h in handlers) {
this.attachEvent('on' + h, function() {
lib[handlers[h]](self);
});
}
this.attachEvent('onpropertychange', function() {
lib.readPropertyChanges(self);
});
/* ensure that this elent and its parent is given hasLayout (needed for accurate positioning) */
var giveLayout = function(el) {
el.style.zoom = 1;
if (el.currentStyle.position == 'static') {
el.style.position = 'relative';
}
};
giveLayout(this.offsetParent);
giveLayout(this);
/* create vml elements */
this.vmlBox = document.createElement('ignore'); /* IE8 really wants to be encased in a wrapper element for the VML to work, and I don't want to disturb getElementsByTagName('div') - open to suggestion on how to do this differently */
this.vmlBox.runtimeStyle.cssText = 'behavior:none; position:absolute; margin:0; padding:0; border:0; background:none;'; /* super important - if something accidentally matches this (you yourseld did this once, Drew), you'll get infinitely-created elements and a frozen browser! */
this.vmlBox.style.zIndex = thisStyle.zIndex;
this.vml = {'color':true, 'image':true, 'stroke':true};
for (var v in this.vml) {
this.vml[v] = document.createElement(lib.ns + ':shape');
this.vml[v].filler = document.createElement(lib.ns + ':fill');
this.vml[v].appendChild(this.vml[v].filler);
this.vml[v].stroked = false;
this.vml[v].style.position = 'absolute';
this.vml[v].style.zIndex = thisStyle.zIndex;
this.vml[v].coordorigin = '1,1';
this.vmlBox.appendChild(this.vml[v]);
}
this.vml.image.fillcolor = 'none';
this.vml.image.filler.type = 'tile';
this.parentNode.insertBefore(this.vmlBox, this);
this.isImg = false;
if (this.nodeName == 'IMG') {
this.isImg = true;
this.style.visibility = 'hidden';
}
setTimeout(function() {
lib.applyVML(self);
}, 1);
}
};
try {
document.execCommand("BackgroundImageCache", false, true);
} catch(err) {}
DD_roundies.IEversion();
DD_roundies.createVmlNameSpace();
DD_roundies.createVmlStyleSheet();
if (DD_roundies.IE8 && document.attachEvent && DD_roundies.querySelector) {
document.attachEvent('onreadystatechange', function() {
if (document.readyState == 'complete') {
var selectors = DD_roundies.selectorsToProcess;
var length = selectors.length;
var delayedCall = function(node, radii, index) {
setTimeout(function() {
DD_roundies.roundify.call(node, radii);
}, index*100);
};
for (var i=0; i<length; i++) {
var results = document.querySelectorAll(selectors[i].selector);
var rLength = results.length;
for (var r=0; r<rLength; r++) {
if (results[r].nodeName != 'INPUT') { /* IE8 doesn't like to do this to inputs yet */
delayedCall(results[r], selectors[i].radii, r);
}
}
}
}
});
}
DD_roundies.addRule('div.box', '8px',true);
DD_roundies.addRule('a.cc_gen_button', '4px',true);DD_roundies.addRule('a.small_button', '4px',true);
