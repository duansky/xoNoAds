/**
 * select.js v0.2.0
 * @author: flfwzgl https://github.com/flfwzgl/select
 * @copyright: MIT license 
 */
!function(window){
	var doc = window.document,
			ua = navigator.userAgent

	var isOld = !!ua.match(/msie\s[5678]/i);
	var isLtIE8 = !!ua.match(/msie\s[567]/i);

	function _id(id){
		return id ? doc.getElementById(id) : '';
	}

	function _tag(tag, e){
		var res = (e && (e.nodeType === 1 || e.nodeType === 9) ? e : doc).getElementsByTagName(tag);
		return res;
	}

	function _q(str, e) {
		return (e || doc).querySelector(str);
	}

	function _qa(str, e) {
		return (e || doc).querySelectorAll(str);
	}

	function _cls(cls, e) {
		if(isOld) {
			var tmp = (e || doc).getElementsByTagName('*');
			return _filter(tmp, function(i, e) { return _hasCls(e, cls); })
		} else {
			return (e || doc).getElementsByClassName(cls);
		}
	}


	function _hasCls(e, cls){
		var tmp = e.className.split(/\s+/);
		for(var i=0, m=tmp.length; i<m; i++) if(cls === tmp[i]) return true;
		return false;
	}

	/**
	 * @param  {Array-like} arr
	 * @param  {Function} fn
	 * @return {[type]}
	 */
	function _each(arr, fn){
		if(isOld) {
			for(var i=0, m=arr.length; i<m; i++) fn.call(arr[i], i, arr[i]);
			return arr;
		} else (_isArr(arr) ? arr : _toArr(arr)).forEach(function(e, i) { fn.call(e, i, e); });
	}

	/**
	 * @param  {Array-like}   arr
	 * @param  {Function} fn
	 * @return {Array}       [description]
	 */
	function _filter(arr, fn){
		if(isOld) {
			for(var i=0, m=arr.length, res=[]; i<m; i++)
				if(fn.call(arr[i], i, arr[i])) res.push(arr[i]);
			return res;
		} else return (_isArr(arr) ? arr : _toArr(arr)).filter(function(e, i) { return fn.call(e, i, e); });
	}

	var _proto_toString = Object.prototype.toString;
	function _isArr(e) {
		return _proto_toString.call(e) === '[object Array]';
	}

	/**
	 * @param  {anything} e
	 * @param  {Array-like} arr
	 * @return {Number}
	 */
	function _inArr(e, arr){
		if(isOld) {
			for(var i=0, m=arr.length; i<m; i++) if(e === arr[i]) return i;
			return -1;
		} else return arr.indexOf(e);
	}

	var _proto_slice = Array.prototype.slice;
	function _slice(arr, a, b) {
		if(isOld) {
			var res = [];
			if(b && b <= a) b = arr.length;
			for(var i=0, m=arr.length; i<m; i++) {
				if(i >= a) res.push(arr[i]);
				if(i === b) break;
			}
			return res;
		} else {
			return _proto_slice.call(arr, a, b);
		}
	}

	function _toArr(e) {
		return e && e.length ? _slice(e, 0) : [];
	}

	function _get(e, attr){
		// fuck ie
		if(e) {
			if(isLtIE8) {
				return e[attr] || '';
			} else {
				return e.getAttribute && e.getAttribute(attr) || '';
			}
		} else return '';
	}

	/**
	 * 数组去重
	 * @param  {Array}
	 * @return {Array}
	 */
	function _uniq(arr){
		if(arr.length === 0) return arr;
		var res = [];
		_each(arr, function(i, e) {
			if(_inArr(arr[i], res) === -1 && arr[i] != null) res.push(arr[i]);
		})
		return res;
	}

	var _proto_concat = Array.prototype.concat;
	function _concat() {
		var args = arguments;
		if(args.length === 0) return _toArr(args[0]);
		return _proto_concat.apply([], args);
	}

	function _isElement(e) {
		return e == window || e == doc || e.nodeType === 1;
	}

	function _trim(str) {
		// s = s || ' ';
		// var reg = new RegExp('^'+ s +'+|'+ s +'+$', 'gi');
		return str.replace(/^\s+|\s+$/g, '');
	}

	/**
	 * 格式化并且断开字符串 " #nav  > ul.item ,#form   input[value=abc]", 得到 ['#nav>ul.item', '#form input[value=abc]']
	 * 然后将数组中每个元素传入choose, 将choose返回的数组concat成一个新数组返回
	 * @param  {String} sel
	 * @return {Array}
	 */
	function select(sel){
		if(_isElement(sel)) return [sel];
		if(typeof sel !== 'string' || !sel) return [];

		if(sel === 'window') return [window];
		if(sel === 'document') return [doc];
		if(sel === 'html') return [doc.documentElement];

		//将" #nav  > ul.item ,#form   input[value=abc]" 变成 "#nav>ul.item,#form input[value=abc]", 并用","断开
		sel = sel.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ').replace(/\s*([\,>])\s*/g, '$1').split(',');

		var tmp = [];
		_each(sel, function(i, selector) {
			tmp.push(_choose(selector));
		});
		tmp = _concat.apply([], tmp);
		return _uniq(tmp);
	}

	/**
	 * 首先将 '.w .dd div.item a:odd input:eq(5)' 转换成 [".w", " .dd", " div", ".item", " a", ":odd", " input", ":eq(5)"]
	 * 由于querySelectorAll(简称qa)无法识别整个'.w .dd div.item a:odd input:eq(5)', 所以断开放在数组中.
	 * 然后一层一层地脱, 比如, 先用qa 查询 '.w .dd div.item a:odd input' , 此时将rest数组为 [':eq(5)'], 但qa查询依旧出错
	 * 然后使用qa查询  '.w .dd div.item a:odd' , rest数组中是[' input', ':eq(5)']
	 * 以此类推, 直到遇到第一个可以qa查询的字符串, 结果保存在tmp, rest中剩下的字符串使用普通方法迭代和过滤
	 *  
	 * @param {String} sel
	 * @return {Array} 
	 */
	function _choose(sel) {
		if(!sel) return [];
		var sel = sel.match(/[\s>]?\[[a-z][\w\-]*?([!\^\$]?=.+?)?\]|[\s>]?#?[a-z][\w\-]*|[\s>]?\.[a-z][\w\-]*|\*|[\s>]?:[a-z][\w\-]*(\(\d+?\))?|[\s>]?\*/gi);
		var rest = [];
		var tmp = [];

		while(sel.length > 0) {
			try {
				tmp = _toArr( _qa( sel.join('') ) );
				break;
			}
			catch(e) {
				rest.unshift(sel.pop());
			}
		}
		// if(window.console) {
		//   console.log('querySelectorAll for: "' + sel + '"');
		//   console.log('custom selector for: "' + rest + '"');
		// }
		
		if(rest.length > 0) {
			// querySelectorAll 无法识别的选择器
			_each(rest, function(i, e) {
				tmp = _decide(tmp, e, i);
			})
		}
		return tmp;
	}

	function _decide(arr, sel, i) {
		//如果是第一次, 如果是#或纯字母, 利用自带的 getElementById 和 getElementsByTagName
		//如果不是#或字母, 且arr是空数组, 则获取整个body中的元素再进行过滤或迭代
		if(i === 0) {
			var c = sel.charAt(0);
			if(c === '#') return [_id(sel.substring(0))];
			if(/^[a-z][a-z0-6]*$/i.test(sel)) return _toArr(_tag(sel, doc.body));
			if(arr.length === 0) arr = _tag('*', doc.body);
		} else {
			if(arr.length === 0) return arr;
		}
		if( _inArr(sel.charAt(0), [' ', '>']) > -1 || _inArr(sel, [':firstChild', ':lastChild', ':child']) > -1) {
			return _iterateNode(arr, sel);
		} else {
			return _filterNode(arr, sel);
		}

	}

	function _iterateNode(arr, sel) {
		//空格, >开头或, :parent, :child
		var tmp = [];
		var c = sel.charAt(0);
		sel = sel.substring(1);
		if(c === ':') {
			switch(sel) {
				case 'parent':
					_each(arr, function(i, e) { if(e = e.parentNode) tmp.push(e); });
					return tmp;
				case 'child':
					_each(arr, function(i, e) {
						var ttt = _getChild(e);
						tmp.push(_toArr(ttt));
					});
					return _concat.apply([], tmp);
				case 'firstChild':
					_each(arr, function(i, e) { tmp.push(_getChild(e, 0)); });
					return tmp;
				case 'lastChild':
					_each(arr, function(i, e) { tmp.push(_lastChild(e)); });
					return tmp;
			}
			if(sel.indexOf('child(') > -1) {
				var n = +sel.replace(/^child\(|\)$/g, '') || 0;
				_each(arr, function(i, e) { tmp.push(_getChild(e, n)); });
				return tmp;
			}
		} else if(c === ' ') {
			//只有 class 和 tag 有对应的api(getElementsByClassName, getElementsByTagName)
			//因此单独讨论
			if(sel.charAt(0) === '.') {
				_each(arr, function(i, e) {
					tmp.push( _toArr(_cls(sel.substring(1), e)) );
				})
				return _concat.apply([], tmp);
			}

			if(/^[a-z]+[0-6]?$/gi.test(sel)) {
				_each(arr, function(i, e) {
					tmp.push(_toArr(_tag(sel, e)));
				});
				return _concat.apply([], tmp);
			}

			//必须进入 空格才能调用过滤器
			_each(arr, function(i, e) {
				tmp.push( _toArr(_tag('*', e)) );
			});
			tmp = _concat.apply([], tmp);
			return _filterNode(tmp, sel);

		} else if(c === '>') {
			_each(arr, function(i, e) {
				tmp.push( _toArr(_getChild(e)) );
			});
			tmp = _concat.apply([], tmp);
			return _filterNode(tmp, sel);
		}
	}

	function _filterNode(arr, sel) {
		if(sel === '*') return arr;
		if(/^[a-z]+[0-6]?$/gi.test(sel)) {
			return _filter(arr, function(i, e) {
				return e.nodeName === sel.toUpperCase();
			});
		}

		//前方的正则已经严格做了匹配, 此处只需判断[即可
		if(sel.charAt(0) === '[') {
			sel = sel.replace(/^\[|\]$/g, '');
			if(/^[a-z][\w\-]*$/gi.test(sel)) {
				return _filter(arr, function(i, e) { return !!_get(e, sel); });
			} else {
				sel = /^([a-z][\w\-]*)([!\^\$]?)=(.+)$/gi.exec(sel);
				var s = sel[2], k = sel[1], v = sel[3].replace(/^['"]+|['"]+$/g, '');
				switch(s) {
					case '':
						return _filter(arr, function(i, e) { return _get(e, k) == v; });
					case '!':
						return _filter(arr, function(i, e) { return _get(e, k) != v; });
					case '^':
						return _filter(arr, function(i, e) { return String(_get(e, k)).indexOf(v) === 0; });
					case '$':
						return _filter(arr, function(i, e) {
							var attr = _get(e, k);
							if(attr) {
								if(k === 'href' || k === 'src') attr = attr.replace(/\/+$/, '');
								return attr.lastIndexOf(v) + v.length === attr.length;
							} else return false;
						});
				}
			}
		}

		var c = sel.charAt(0);
		sel = sel.substring(1);
		if(c === '#') return _id(sel);
		if(c === '.') {
			return _filter(arr, function(i, e) {
				return e.className && _hasCls(e, sel);
			});
		}
		if(c === ':') {
			if(sel.indexOf('eq(') === 0) {
				return arr[+str.substring(3, str.length-1)] || [];
			}
			if(sel.indexOf('gt(') === 0) {
				return _slice(arr, +str.substring(3, str.length-1));
			}
			if(sel.indexOf('lt(') === 0) {
				return _slice(arr, 0, +str.substring(3, str.length-1));
			}
			switch(sel) {
				case 'header':
					return _filter(arr, function(i, e) { return /^H[0-6]$/.test(e.nodeName); });
				case 'first':
					return [arr[0]];
				case 'last':
					return [arr.pop()];
				case 'even':
					// for(var i = 0, m = arr.length, res = []; i < m; i+=2) res.push(arr[i]);
					// return res;
					return _filter(arr, function(i, e) { return i + 1 & 1; });
				case 'odd':
					return _filter(arr, function(i, e) { return i & 1; });
				case 'input':
					return _filter(arr, function(i, e) { return e.nodeName === 'INPUT'; });
				case 'selected':
					return _filter(arr, function(i, e) { return e.nodeName === 'INPUT' && e.selected; });
				case 'checked':
					return _filter(arr, function(i, e) { return e.nodeName === 'INPUT' && e.checked; });
				case 'enabled':
					return _filter(arr, function(i, e) { return e.nodeName === 'INPUT' && !e.disabled; });
				case 'disabled':
					return _filter(arr, function(i, e) { return e.nodeName === 'INPUT' && e.disabled; });
			}
			if( _inArr(sel, ['text', 'button', 'radio', 'checkbox', 'file', 'hidden', 'image', 'password', 'reset', 'submit']) > -1) {
				return _filter(arr, function(i, e) { return e.nodeName === 'INPUT' && e.type === sel; })
			}

		}
	}

	/**
	 * 如果传入n,则返回子节点中第n个, 如果n超出子节点个数, 返回null
	 * 没有传入n,则返回所有子节点集合
	 * @param  {Element} e
	 * @param  {Number} n
	 * @return {Array}  子节点集合
	 */
	function _getChild(e, n) {
		if(isOld) {
			//在ie6,7中nextSibling性能远高于childNodes, 而且就算获得childNodes也要过滤掉text节点.
			var e = e.firstChild, res = [], i = 0;
			while(e) {
				if(e.nodeType === 0) {
					if(i === n) return e;
					res.push(e);
					i++;
				}
				e = e.nextSibling;
			}
			return n == null ? res : null;
		} else {
			return n == null ? e.children : (e.children[n] || null);
		}
	}

	function _lastChild(e) {
		if(isOld) {
			e = e.lastChild;
			while(e) {
				if(e.nodeType === 1) return e;
				e = e.previousSibling;
			}
			return null;
		} else {
			return e.lastElementChild;
		}
	}


	if(typeof module === 'string' && module.exports) {
		module.exports = select;
	} else {
		window.s = select;
	}
	
}(window);