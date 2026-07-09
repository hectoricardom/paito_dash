import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { sharedConfig, lazy, createComponent, catchError, onCleanup } from 'solid-js';
import { renderToString, isServer, getRequestEvent, ssrElement, escape, mergeProps, ssr, createComponent as createComponent$1, ssrHydrationKey, NoHydration, ssrAttribute } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$1(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m$2(e._destroy,t._destroy);}};function _$1(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$2.prototype),c}function m$2(...n){return function(...e){for(const t of n)t(...e);}}const g$1=_$1();let A$1 = class A extends g$1{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$1 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}};function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$2(n={}){const e=new E,t=Array.isArray(n)||H$2(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$2(n){return typeof n?.entries=="function"}function v$1(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$2=new Set([101,204,205,304]);async function b$2(n,e){const t=new y$1,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$2(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$2.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$2(n,e,t={}){try{const r=await b$2(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$1(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$1(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$2=globalThis.Headers,i=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$2;
const AbortController$1 = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController: AbortController$1 });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s$1="base64url";function digest(t){if(e)return e(r,t,s$1);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s$1):o.digest(s$1)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/hector/Documents/AIProjects/YABA","order":0,"outDir":"/Users/hector/Documents/AIProjects/YABA/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/hector/Documents/AIProjects/YABA","base":"/","outDir":"/Users/hector/Documents/AIProjects/YABA/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/hector/Documents/AIProjects/YABA","outDir":"/Users/hector/Documents/AIProjects/YABA/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"node_modules/.pnpm/@solidjs+start@1.3.2_solid-js@1.9.13_vinxi@0.5.11_@types+node@25.9.1_db0@0.3.4_ioredis@_b9390d6dbb0946db2165f65dd85a2338/node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/hector/Documents/AIProjects/YABA","outDir":"/Users/hector/Documents/AIProjects/YABA/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"prerender":{}},"root":"/Users/hector/Documents/AIProjects/YABA"};
					const buildManifest = {"ssr":{"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true}},"client":{"_BoxDetailModal-1UrNqsl6.js":{"file":"assets/BoxDetailModal-1UrNqsl6.js","name":"BoxDetailModal","imports":["_web-Br4MVSxL.js","_kit-2clcu5wE.js","_opsApi-USmtUle1.js","_StateBadge-xft7AthD.js","_utils-NWvMQ7Y7.js","_user-C-6caAK2.js","_boxes-DBOh4gSd.js","_clock-D8b1lOEC.js","_dollar-sign-n7q7l7RZ.js","_file-text-BtXmJjSV.js","_map-pin-DbPzQlpi.js","_route-Cc9XYK9u.js"]},"_BoxLabel-DJK9PnB4.js":{"file":"assets/BoxLabel-DJK9PnB4.js","name":"BoxLabel","imports":["_web-Br4MVSxL.js","_browser-BHXLhbL5.js"]},"_BoxScanItem-GSrrtK1U.js":{"file":"assets/BoxScanItem-GSrrtK1U.js","name":"BoxScanItem","imports":["_web-Br4MVSxL.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_check-Q-ehJbuO.js"]},"_Card-DxJfzl8O.js":{"file":"assets/Card-DxJfzl8O.js","name":"Card","imports":["_web-Br4MVSxL.js"]},"_ExpiryDashboardView-C91BEQcP.js":{"file":"assets/ExpiryDashboardView-C91BEQcP.js","name":"ExpiryDashboardView","imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_boxes-DBOh4gSd.js","_triangle-alert-DqC7VkMq.js"]},"_PageHeader-DCseRZAi.js":{"file":"assets/PageHeader-DCseRZAi.js","name":"PageHeader","imports":["_web-Br4MVSxL.js"]},"_ReceivingView-BBPCKzbH.js":{"file":"assets/ReceivingView-BBPCKzbH.js","name":"ReceivingView","imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_inventoryStore-C7PM2MGM.js","_store-DzdKpxap.js","_search-DL_in37x.js","_circle-check-DLWZK-4D.js","_package-plus-DG8BWOdj.js","_scan-line-BkkbALDz.js","_trash-2-eKau8bUg.js"]},"_Spinner-B83-KybF.js":{"file":"assets/Spinner-B83-KybF.js","name":"Spinner","imports":["_web-Br4MVSxL.js"]},"_StateBadge-xft7AthD.js":{"file":"assets/StateBadge-xft7AthD.js","name":"StateBadge","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"__commonjsHelpers-Cpj98o6Y.js":{"file":"assets/_commonjsHelpers-Cpj98o6Y.js","name":"_commonjsHelpers"},"_activeOffersService-yI_-GJxd.js":{"file":"assets/activeOffersService-yI_-GJxd.js","name":"activeOffersService","imports":["_web-Br4MVSxL.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js"]},"_auth-aGgy2W97.js":{"file":"assets/auth-aGgy2W97.js","name":"auth","imports":["_web-Br4MVSxL.js"]},"_boxLabelPdf-enPRriP2.js":{"file":"assets/boxLabelPdf-enPRriP2.js","name":"boxLabelPdf","imports":["_jspdf.es.min-fClK7Czv.js","_browser-BHXLhbL5.js"]},"_boxes-DBOh4gSd.js":{"file":"assets/boxes-DBOh4gSd.js","name":"boxes","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_browser-BHXLhbL5.js":{"file":"assets/browser-BHXLhbL5.js","name":"browser","imports":["__commonjsHelpers-Cpj98o6Y.js"]},"_check-Q-ehJbuO.js":{"file":"assets/check-Q-ehJbuO.js","name":"check","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_chevron-right-DtDU7Jd2.js":{"file":"assets/chevron-right-DtDU7Jd2.js","name":"chevron-right","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_circle-check-DLWZK-4D.js":{"file":"assets/circle-check-DLWZK-4D.js","name":"circle-check","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_clock-D8b1lOEC.js":{"file":"assets/clock-D8b1lOEC.js","name":"clock","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_commitInputs-9mhp6919.js":{"file":"assets/commitInputs-9mhp6919.js","name":"commitInputs","imports":["_web-Br4MVSxL.js","_kit-2clcu5wE.js"]},"_components-BaoDfp3E.js":{"file":"assets/components-BaoDfp3E.js","name":"components","imports":["_web-Br4MVSxL.js","_routing-CHVOqQEM.js"]},"_dollar-sign-n7q7l7RZ.js":{"file":"assets/dollar-sign-n7q7l7RZ.js","name":"dollar-sign","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_file-text-BtXmJjSV.js":{"file":"assets/file-text-BtXmJjSV.js","name":"file-text","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_inventoryStore-C7PM2MGM.js":{"file":"assets/inventoryStore-C7PM2MGM.js","name":"inventoryStore","imports":["_web-Br4MVSxL.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js"]},"_invoiceStore-DsKkuxWZ.js":{"file":"assets/invoiceStore-DsKkuxWZ.js","name":"invoiceStore","imports":["_store-DzdKpxap.js","_web-Br4MVSxL.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js"]},"_invoiceStyledFormStore-D8Hdf6jE.js":{"file":"assets/invoiceStyledFormStore-D8Hdf6jE.js","name":"invoiceStyledFormStore","imports":["_preload-helper-ug3pwPZ1.js","_web-Br4MVSxL.js","_utils-NWvMQ7Y7.js","_activeOffersService-yI_-GJxd.js","_auth-aGgy2W97.js","_tariffConfigService-B4CQUZgr.js"],"dynamicImports":["src/services/apiAdapter.ts"]},"_jspdf.es.min-fClK7Czv.js":{"file":"assets/jspdf.es.min-fClK7Czv.js","name":"jspdf.es.min","imports":["_preload-helper-ug3pwPZ1.js"],"dynamicImports":["node_modules/.pnpm/html2canvas@1.4.1/node_modules/html2canvas/dist/html2canvas.esm.js","node_modules/.pnpm/dompurify@3.4.7/node_modules/dompurify/dist/purify.es.mjs","node_modules/.pnpm/canvg@3.0.11/node_modules/canvg/lib/index.es.js"]},"_kit-2clcu5wE.js":{"file":"assets/kit-2clcu5wE.js","name":"kit","imports":["_web-Br4MVSxL.js"]},"_layers-9FZittZH.js":{"file":"assets/layers-9FZittZH.js","name":"layers","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_map-pin-DbPzQlpi.js":{"file":"assets/map-pin-DbPzQlpi.js","name":"map-pin","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_opsApi-USmtUle1.js":{"file":"assets/opsApi-USmtUle1.js","name":"opsApi","imports":["_utils-NWvMQ7Y7.js"]},"_package-CIpbQG3v.js":{"file":"assets/package-CIpbQG3v.js","name":"package","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_package-plus-DG8BWOdj.js":{"file":"assets/package-plus-DG8BWOdj.js","name":"package-plus","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_pencil-DKpYwLJl.js":{"file":"assets/pencil-DKpYwLJl.js","name":"pencil","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_plus-DeDz2Vv9.js":{"file":"assets/plus-DeDz2Vv9.js","name":"plus","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_posReceiptPdf-C7bN3i4a.js":{"file":"assets/posReceiptPdf-C7bN3i4a.js","name":"posReceiptPdf","imports":["_web-Br4MVSxL.js","_kit-2clcu5wE.js","_tariffConfigService-B4CQUZgr.js","_jspdf.es.min-fClK7Czv.js"]},"_preload-helper-ug3pwPZ1.js":{"file":"assets/preload-helper-ug3pwPZ1.js","name":"preload-helper"},"_printer-Cf1ZPyaN.js":{"file":"assets/printer-Cf1ZPyaN.js","name":"printer","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_route-Cc9XYK9u.js":{"file":"assets/route-Cc9XYK9u.js","name":"route","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_routing-CHVOqQEM.js":{"file":"assets/routing-CHVOqQEM.js","name":"routing","imports":["_web-Br4MVSxL.js"]},"_save-CTI5JQJX.js":{"file":"assets/save-CTI5JQJX.js","name":"save","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_scan-line-BkkbALDz.js":{"file":"assets/scan-line-BkkbALDz.js","name":"scan-line","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_search-DL_in37x.js":{"file":"assets/search-DL_in37x.js","name":"search","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_sso-rnVQVqKt.js":{"file":"assets/sso-rnVQVqKt.js","name":"sso","imports":["_auth-aGgy2W97.js"]},"_store-DzdKpxap.js":{"file":"assets/store-DzdKpxap.js","name":"store","imports":["_web-Br4MVSxL.js"]},"_tariffConfigService-B4CQUZgr.js":{"file":"assets/tariffConfigService-B4CQUZgr.js","name":"tariffConfigService","imports":["_web-Br4MVSxL.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js"]},"_trash-2-eKau8bUg.js":{"file":"assets/trash-2-eKau8bUg.js","name":"trash-2","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_triangle-alert-DqC7VkMq.js":{"file":"assets/triangle-alert-DqC7VkMq.js","name":"triangle-alert","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_truck-BIb1XJQQ.js":{"file":"assets/truck-BIb1XJQQ.js","name":"truck","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_user-C-6caAK2.js":{"file":"assets/user-C-6caAK2.js","name":"user","imports":["_kit-2clcu5wE.js","_web-Br4MVSxL.js"]},"_utils-NWvMQ7Y7.js":{"file":"assets/utils-NWvMQ7Y7.js","name":"utils","imports":["_auth-aGgy2W97.js","_web-Br4MVSxL.js"]},"_web-Br4MVSxL.js":{"file":"assets/web-Br4MVSxL.js","name":"web"},"node_modules/.pnpm/canvg@3.0.11/node_modules/canvg/lib/index.es.js":{"file":"assets/index.es-Bibbuyuc.js","name":"index.es","src":"node_modules/.pnpm/canvg@3.0.11/node_modules/canvg/lib/index.es.js","isDynamicEntry":true,"imports":["__commonjsHelpers-Cpj98o6Y.js","_jspdf.es.min-fClK7Czv.js","_preload-helper-ug3pwPZ1.js"]},"node_modules/.pnpm/dompurify@3.4.7/node_modules/dompurify/dist/purify.es.mjs":{"file":"assets/purify.es-BSKMTLSQ.js","name":"purify.es","src":"node_modules/.pnpm/dompurify@3.4.7/node_modules/dompurify/dist/purify.es.mjs","isDynamicEntry":true},"node_modules/.pnpm/html2canvas@1.4.1/node_modules/html2canvas/dist/html2canvas.esm.js":{"file":"assets/html2canvas.esm-B0tyYwQk.js","name":"html2canvas.esm","src":"node_modules/.pnpm/html2canvas@1.4.1/node_modules/html2canvas/dist/html2canvas.esm.js","isDynamicEntry":true},"src/routes/admin.tsx?pick=default&pick=$css":{"file":"assets/admin-BuYDihb7.js","name":"admin","src":"src/routes/admin.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","src/services/apiAdapter.ts","_auth-aGgy2W97.js","_kit-2clcu5wE.js","_check-Q-ehJbuO.js","_map-pin-DbPzQlpi.js","_save-CTI5JQJX.js","_search-DL_in37x.js","_utils-NWvMQ7Y7.js"]},"src/routes/bultos.tsx?pick=default&pick=$css":{"file":"assets/bultos-B3AkQI5I.js","name":"bultos","src":"src/routes/bultos.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","src/services/apiAdapter.ts","_kit-2clcu5wE.js","_boxLabelPdf-enPRriP2.js","_BoxDetailModal-1UrNqsl6.js","_boxes-DBOh4gSd.js","_circle-check-DLWZK-4D.js","_package-CIpbQG3v.js","_printer-Cf1ZPyaN.js","_user-C-6caAK2.js","_search-DL_in37x.js","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_jspdf.es.min-fClK7Czv.js","_preload-helper-ug3pwPZ1.js","_browser-BHXLhbL5.js","__commonjsHelpers-Cpj98o6Y.js","_opsApi-USmtUle1.js","_StateBadge-xft7AthD.js","_clock-D8b1lOEC.js","_dollar-sign-n7q7l7RZ.js","_file-text-BtXmJjSV.js","_map-pin-DbPzQlpi.js","_route-Cc9XYK9u.js"]},"src/routes/callback.tsx?pick=default&pick=$css":{"file":"assets/callback-DMM4bifN.js","name":"callback","src":"src/routes/callback.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_auth-aGgy2W97.js","_Spinner-B83-KybF.js","_routing-CHVOqQEM.js","_sso-rnVQVqKt.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-C73be1ng.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_PageHeader-DCseRZAi.js","_web-Br4MVSxL.js","_Card-DxJfzl8O.js"]},"src/routes/inventory/expiry.tsx?pick=default&pick=$css":{"file":"assets/expiry-BHKLkZHY.js","name":"expiry","src":"src/routes/inventory/expiry.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_ExpiryDashboardView-C91BEQcP.js","_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_boxes-DBOh4gSd.js","_triangle-alert-DqC7VkMq.js"]},"src/routes/inventory/index.tsx?pick=default&pick=$css":{"file":"assets/index-B5Njxpm-.js","name":"index","src":"src/routes/inventory/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_store-DzdKpxap.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_inventoryStore-C7PM2MGM.js","_ReceivingView-BBPCKzbH.js","_boxes-DBOh4gSd.js","_ExpiryDashboardView-C91BEQcP.js","_trash-2-eKau8bUg.js","_plus-DeDz2Vv9.js","_dollar-sign-n7q7l7RZ.js","_package-plus-DG8BWOdj.js","_package-CIpbQG3v.js","_pencil-DKpYwLJl.js","_search-DL_in37x.js","_triangle-alert-DqC7VkMq.js","_auth-aGgy2W97.js","_circle-check-DLWZK-4D.js","_scan-line-BkkbALDz.js"]},"src/routes/inventory/receiving.tsx?pick=default&pick=$css":{"file":"assets/receiving-COVO3T_R.js","name":"receiving","src":"src/routes/inventory/receiving.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_ReceivingView-BBPCKzbH.js","_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_inventoryStore-C7PM2MGM.js","_store-DzdKpxap.js","_search-DL_in37x.js","_circle-check-DLWZK-4D.js","_package-plus-DG8BWOdj.js","_scan-line-BkkbALDz.js","_trash-2-eKau8bUg.js"]},"src/routes/invoices/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-DMSRyfSW.js","name":"_id_","src":"src/routes/invoices/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_invoiceStore-DsKkuxWZ.js","_invoiceStyledFormStore-D8Hdf6jE.js","_kit-2clcu5wE.js","_opsApi-USmtUle1.js","_BoxLabel-DJK9PnB4.js","_StateBadge-xft7AthD.js","_BoxDetailModal-1UrNqsl6.js","_boxLabelPdf-enPRriP2.js","_jspdf.es.min-fClK7Czv.js","_browser-BHXLhbL5.js","_posReceiptPdf-C7bN3i4a.js","_tariffConfigService-B4CQUZgr.js","_routing-CHVOqQEM.js","_file-text-BtXmJjSV.js","_map-pin-DbPzQlpi.js","_package-plus-DG8BWOdj.js","_package-CIpbQG3v.js","_pencil-DKpYwLJl.js","_user-C-6caAK2.js","_truck-BIb1XJQQ.js","_store-DzdKpxap.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_preload-helper-ug3pwPZ1.js","_activeOffersService-yI_-GJxd.js","_boxes-DBOh4gSd.js","_clock-D8b1lOEC.js","_dollar-sign-n7q7l7RZ.js","_route-Cc9XYK9u.js","__commonjsHelpers-Cpj98o6Y.js"]},"src/routes/invoices/index.tsx?pick=default&pick=$css":{"file":"assets/index-Dpb9b6Xz.js","name":"index","src":"src/routes/invoices/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_invoiceStore-DsKkuxWZ.js","_invoiceStyledFormStore-D8Hdf6jE.js","_kit-2clcu5wE.js","_routing-CHVOqQEM.js","_plus-DeDz2Vv9.js","_boxes-DBOh4gSd.js","_chevron-right-DtDU7Jd2.js","_circle-check-DLWZK-4D.js","_clock-D8b1lOEC.js","_dollar-sign-n7q7l7RZ.js","_file-text-BtXmJjSV.js","_package-CIpbQG3v.js","_search-DL_in37x.js","_trash-2-eKau8bUg.js","_store-DzdKpxap.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_preload-helper-ug3pwPZ1.js","_activeOffersService-yI_-GJxd.js","_tariffConfigService-B4CQUZgr.js"]},"src/routes/invoices/new.tsx?pick=default&pick=$css":{"file":"assets/new-Cghoz_Dk.js","name":"new","src":"src/routes/invoices/new.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_utils-NWvMQ7Y7.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","_invoiceStyledFormStore-D8Hdf6jE.js","_invoiceStore-DsKkuxWZ.js","_tariffConfigService-B4CQUZgr.js","_package-CIpbQG3v.js","_triangle-alert-DqC7VkMq.js","_truck-BIb1XJQQ.js","_layers-9FZittZH.js","_chevron-right-DtDU7Jd2.js","_plus-DeDz2Vv9.js","_user-C-6caAK2.js","_search-DL_in37x.js","_routing-CHVOqQEM.js","_save-CTI5JQJX.js","_circle-check-DLWZK-4D.js","_file-text-BtXmJjSV.js","_map-pin-DbPzQlpi.js","_package-plus-DG8BWOdj.js","_trash-2-eKau8bUg.js","_auth-aGgy2W97.js","_preload-helper-ug3pwPZ1.js","_activeOffersService-yI_-GJxd.js","src/services/apiAdapter.ts","_store-DzdKpxap.js"]},"src/routes/invoices/offers.tsx?pick=default&pick=$css":{"file":"assets/offers-BIBRCYbM.js","name":"offers","src":"src/routes/invoices/offers.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_activeOffersService-yI_-GJxd.js","_layers-9FZittZH.js","_circle-check-DLWZK-4D.js","_pencil-DKpYwLJl.js","_plus-DeDz2Vv9.js","_trash-2-eKau8bUg.js","_auth-aGgy2W97.js"]},"src/routes/invoices/pos.tsx?pick=default&pick=$css":{"file":"assets/pos-B2b0P2eU.js","name":"pos","src":"src/routes/invoices/pos.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","_posReceiptPdf-C7bN3i4a.js","_tariffConfigService-B4CQUZgr.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_inventoryStore-C7PM2MGM.js","_invoiceStore-DsKkuxWZ.js","_routing-CHVOqQEM.js","_search-DL_in37x.js","_circle-check-DLWZK-4D.js","_scan-line-BkkbALDz.js","_trash-2-eKau8bUg.js","_jspdf.es.min-fClK7Czv.js","_preload-helper-ug3pwPZ1.js","_auth-aGgy2W97.js","_store-DzdKpxap.js"]},"src/routes/loans.tsx?pick=default&pick=$css":{"file":"assets/loans-B2jYBNcR.js","name":"loans","src":"src/routes/loans.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_plus-DeDz2Vv9.js","_chevron-right-DtDU7Jd2.js","_dollar-sign-n7q7l7RZ.js","_file-text-BtXmJjSV.js","_auth-aGgy2W97.js"]},"src/routes/login.tsx?pick=default&pick=$css":{"file":"assets/login-B6B_LhC7.js","name":"login","src":"src/routes/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_auth-aGgy2W97.js","_Card-DxJfzl8O.js","_Spinner-B83-KybF.js","_routing-CHVOqQEM.js","_sso-rnVQVqKt.js"]},"src/routes/ops/consolidate.tsx?pick=default&pick=$css":{"file":"assets/consolidate-NQ7QUAdo.js","name":"consolidate","src":"src/routes/ops/consolidate.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_opsApi-USmtUle1.js","_BoxLabel-DJK9PnB4.js","_boxLabelPdf-enPRriP2.js","_utils-NWvMQ7Y7.js","_boxes-DBOh4gSd.js","_circle-check-DLWZK-4D.js","_package-plus-DG8BWOdj.js","_plus-DeDz2Vv9.js","_triangle-alert-DqC7VkMq.js","_browser-BHXLhbL5.js","__commonjsHelpers-Cpj98o6Y.js","_jspdf.es.min-fClK7Czv.js","_preload-helper-ug3pwPZ1.js","_auth-aGgy2W97.js"]},"src/routes/ops/index.tsx?pick=default&pick=$css":{"file":"assets/index-DzXKVbrF.js","name":"index","src":"src/routes/ops/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_opsApi-USmtUle1.js","_utils-NWvMQ7Y7.js","_routing-CHVOqQEM.js","_scan-line-BkkbALDz.js","_boxes-DBOh4gSd.js","_map-pin-DbPzQlpi.js","_package-plus-DG8BWOdj.js","_route-Cc9XYK9u.js","_search-DL_in37x.js","_truck-BIb1XJQQ.js","_components-BaoDfp3E.js","_auth-aGgy2W97.js"]},"src/routes/ops/intake.tsx?pick=default&pick=$css":{"file":"assets/intake-CBLnt3gN.js","name":"intake","src":"src/routes/ops/intake.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_store-DzdKpxap.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","_opsApi-USmtUle1.js","_BoxLabel-DJK9PnB4.js","_boxLabelPdf-enPRriP2.js","_package-plus-DG8BWOdj.js","_circle-check-DLWZK-4D.js","_printer-Cf1ZPyaN.js","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_browser-BHXLhbL5.js","__commonjsHelpers-Cpj98o6Y.js","_jspdf.es.min-fClK7Czv.js","_preload-helper-ug3pwPZ1.js"]},"src/routes/ops/locations.tsx?pick=default&pick=$css":{"file":"assets/locations-8IolOmMk.js","name":"locations","src":"src/routes/ops/locations.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_commitInputs-9mhp6919.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_map-pin-DbPzQlpi.js","_plus-DeDz2Vv9.js","_auth-aGgy2W97.js"]},"src/routes/ops/manifest.tsx?pick=default&pick=$css":{"file":"assets/manifest-Bd95Vycz.js","name":"manifest","src":"src/routes/ops/manifest.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_routing-CHVOqQEM.js","_map-pin-DbPzQlpi.js","_check-Q-ehJbuO.js","_chevron-right-DtDU7Jd2.js","_package-plus-DG8BWOdj.js","_triangle-alert-DqC7VkMq.js","_auth-aGgy2W97.js"]},"src/routes/ops/manifests.tsx?pick=default&pick=$css":{"file":"assets/manifests-B8On4Fma.js","name":"manifests","src":"src/routes/ops/manifests.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_BoxScanItem-GSrrtK1U.js","_map-pin-DbPzQlpi.js","_chevron-right-DtDU7Jd2.js","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_check-Q-ehJbuO.js"]},"src/routes/ops/route.tsx?pick=default&pick=$css":{"file":"assets/route-BTCqJtyu.js","name":"route","src":"src/routes/ops/route.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_browser-BHXLhbL5.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js","_BoxScanItem-GSrrtK1U.js","_route-Cc9XYK9u.js","_check-Q-ehJbuO.js","_chevron-right-DtDU7Jd2.js","_map-pin-DbPzQlpi.js","_truck-BIb1XJQQ.js","__commonjsHelpers-Cpj98o6Y.js","_auth-aGgy2W97.js"]},"src/routes/ops/track.tsx?pick=default&pick=$css":{"file":"assets/track-D__Ngse5.js","name":"track","src":"src/routes/ops/track.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_StateBadge-xft7AthD.js","_opsApi-USmtUle1.js","_utils-NWvMQ7Y7.js","_routing-CHVOqQEM.js","_search-DL_in37x.js","_map-pin-DbPzQlpi.js","_auth-aGgy2W97.js"]},"src/routes/ops/transit.tsx?pick=default&pick=$css":{"file":"assets/transit-81KOEFnY.js","name":"transit","src":"src/routes/ops/transit.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_PageHeader-DCseRZAi.js","_kit-2clcu5wE.js","_opsApi-USmtUle1.js","_circle-check-DLWZK-4D.js","_triangle-alert-DqC7VkMq.js","_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js"]},"src/routes/tariffs/index.tsx?pick=default&pick=$css":{"file":"assets/index-DE6pPXWl.js","name":"index","src":"src/routes/tariffs/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-Br4MVSxL.js","_store-DzdKpxap.js","_kit-2clcu5wE.js","_PageHeader-DCseRZAi.js","_commitInputs-9mhp6919.js","_tariffConfigService-B4CQUZgr.js","_utils-NWvMQ7Y7.js","_plus-DeDz2Vv9.js","_circle-check-DLWZK-4D.js","_file-text-BtXmJjSV.js","_save-CTI5JQJX.js","_trash-2-eKau8bUg.js","src/services/apiAdapter.ts","_auth-aGgy2W97.js"]},"src/services/apiAdapter.ts":{"file":"assets/apiAdapter-CetL3odT.js","name":"apiAdapter","src":"src/services/apiAdapter.ts","isDynamicEntry":true,"imports":["_utils-NWvMQ7Y7.js","_auth-aGgy2W97.js","_web-Br4MVSxL.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-CzsJzvoi.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-Br4MVSxL.js","_preload-helper-ug3pwPZ1.js","_auth-aGgy2W97.js","_routing-CHVOqQEM.js","_components-BaoDfp3E.js","_tariffConfigService-B4CQUZgr.js","_Spinner-B83-KybF.js","src/services/apiAdapter.ts","_utils-NWvMQ7Y7.js"],"dynamicImports":["src/routes/admin.tsx?pick=default&pick=$css","src/routes/bultos.tsx?pick=default&pick=$css","src/routes/callback.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/inventory/expiry.tsx?pick=default&pick=$css","src/routes/inventory/index.tsx?pick=default&pick=$css","src/routes/inventory/receiving.tsx?pick=default&pick=$css","src/routes/invoices/[id].tsx?pick=default&pick=$css","src/routes/invoices/index.tsx?pick=default&pick=$css","src/routes/invoices/new.tsx?pick=default&pick=$css","src/routes/invoices/offers.tsx?pick=default&pick=$css","src/routes/invoices/pos.tsx?pick=default&pick=$css","src/routes/loans.tsx?pick=default&pick=$css","src/routes/login.tsx?pick=default&pick=$css","src/routes/ops/consolidate.tsx?pick=default&pick=$css","src/routes/ops/index.tsx?pick=default&pick=$css","src/routes/ops/intake.tsx?pick=default&pick=$css","src/routes/ops/locations.tsx?pick=default&pick=$css","src/routes/ops/manifest.tsx?pick=default&pick=$css","src/routes/ops/manifests.tsx?pick=default&pick=$css","src/routes/ops/route.tsx?pick=default&pick=$css","src/routes/ops/track.tsx?pick=default&pick=$css","src/routes/ops/transit.tsx?pick=default&pick=$css","src/routes/tariffs/index.tsx?pick=default&pick=$css"],"css":["assets/client-Dusn-yFK.css"]}},"server-fns":{"_server-fns-DlSHfPuK.js":{"file":"assets/server-fns-DlSHfPuK.js","name":"server-fns","dynamicImports":["src/app.tsx"]},"src/app.tsx":{"file":"assets/app-BsvTInn6.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-DlSHfPuK.js"],"css":["assets/app-Dusn-yFK.css"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-DlSHfPuK.js"]}}};

					const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

const assets = {
  "/index.html": {
    "type": "text/html; charset=utf-8",
    "encoding": null,
    "etag": "\"d764-HoEZMpLXytFW8vjhrmc7agfJ0gE\"",
    "mtime": "2026-07-09T19:46:31.667Z",
    "size": 55140,
    "path": "../public/index.html"
  },
  "/index.html.br": {
    "type": "text/html; charset=utf-8",
    "encoding": "br",
    "etag": "\"9f1-lTkR5pokWsyai9+bJy/PpLTAhvs\"",
    "mtime": "2026-07-09T19:46:31.700Z",
    "size": 2545,
    "path": "../public/index.html.br"
  },
  "/index.html.gz": {
    "type": "text/html; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bfd-+AuaEacL4SxrlnE9qZv8hyBUU2I\"",
    "mtime": "2026-07-09T19:46:31.669Z",
    "size": 3069,
    "path": "../public/index.html.gz"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "encoding": null,
    "etag": "\"7733-2et/IqbzJhsZTB5lmTsgO4ODkxc\"",
    "mtime": "2026-07-09T19:46:30.713Z",
    "size": 30515,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"bab-2u/gwiTqNXQeQ8xweHqrscSrDEY\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 2987,
    "path": "../public/_build/.vite/manifest.json.br"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"cfc-zMsoiWfnQfyDFJck+Kn/ETs4+88\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 3324,
    "path": "../public/_build/.vite/manifest.json.gz"
  },
  "/_server/assets/app-Dusn-yFK.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1b9d-lenjiFV4nWre0aQG4ntvbhqyeEU\"",
    "mtime": "2026-07-09T19:46:30.754Z",
    "size": 7069,
    "path": "../public/_server/assets/app-Dusn-yFK.css.br"
  },
  "/_server/assets/app-Dusn-yFK.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"b02b-AJ82cTvnBcpP6iAk2PEoRECG4A4\"",
    "mtime": "2026-07-09T19:46:30.719Z",
    "size": 45099,
    "path": "../public/_server/assets/app-Dusn-yFK.css"
  },
  "/_server/assets/app-Dusn-yFK.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"201f-ZYXJ93goco+6HxI8hRx9RoXo8mY\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 8223,
    "path": "../public/_server/assets/app-Dusn-yFK.css.gz"
  },
  "/_build/assets/BoxDetailModal-1UrNqsl6.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1f46-mB+GqXgwTDEzW8tLQaFOA7jNx3A\"",
    "mtime": "2026-07-09T19:46:30.713Z",
    "size": 8006,
    "path": "../public/_build/assets/BoxDetailModal-1UrNqsl6.js"
  },
  "/_build/assets/BoxDetailModal-1UrNqsl6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bcf-UegCWkjOdGWOrvJr3nqjGvrKjo0\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 3023,
    "path": "../public/_build/assets/BoxDetailModal-1UrNqsl6.js.gz"
  },
  "/_build/assets/BoxDetailModal-1UrNqsl6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ab0-w0356auwfuHzGoTm74FbvcB8FiY\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 2736,
    "path": "../public/_build/assets/BoxDetailModal-1UrNqsl6.js.br"
  },
  "/_build/assets/BoxLabel-DJK9PnB4.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"93b-4HexrlUU77ttIVQQ9+8G3/vzvbE\"",
    "mtime": "2026-07-09T19:46:30.713Z",
    "size": 2363,
    "path": "../public/_build/assets/BoxLabel-DJK9PnB4.js"
  },
  "/_build/assets/BoxLabel-DJK9PnB4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"324-IcovtV9RlgdhO+/kYosSoEvVV0k\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 804,
    "path": "../public/_build/assets/BoxLabel-DJK9PnB4.js.br"
  },
  "/_build/assets/BoxLabel-DJK9PnB4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"39e-anTEnbghxrQu7W7pQsbVsGW6GTw\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 926,
    "path": "../public/_build/assets/BoxLabel-DJK9PnB4.js.gz"
  },
  "/_build/assets/BoxScanItem-GSrrtK1U.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"c09-jAjFG3gZE8WwFss24n/W/eYIZvY\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 3081,
    "path": "../public/_build/assets/BoxScanItem-GSrrtK1U.js"
  },
  "/_build/assets/BoxScanItem-GSrrtK1U.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"571-uEhkTrivhV2BH7ZeuYlZ4B+Qkcg\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 1393,
    "path": "../public/_build/assets/BoxScanItem-GSrrtK1U.js.br"
  },
  "/_build/assets/Card-DxJfzl8O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc-84RHvTTMficlBl+ODp0Sz9n/MQ0\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 252,
    "path": "../public/_build/assets/Card-DxJfzl8O.js"
  },
  "/_build/assets/BoxScanItem-GSrrtK1U.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"62a-8JSZqXSS3durKnmV8vjkima8gP4\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 1578,
    "path": "../public/_build/assets/BoxScanItem-GSrrtK1U.js.gz"
  },
  "/_build/assets/ExpiryDashboardView-C91BEQcP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1336-I6RCFQkhDktZ3sX02XBEQkXYZpA\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 4918,
    "path": "../public/_build/assets/ExpiryDashboardView-C91BEQcP.js"
  },
  "/_build/assets/ExpiryDashboardView-C91BEQcP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"733-qSNSD5WQwPcRvFBWJH1XaKr24IY\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 1843,
    "path": "../public/_build/assets/ExpiryDashboardView-C91BEQcP.js.br"
  },
  "/_build/assets/ExpiryDashboardView-C91BEQcP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7fc-kb+BxTdmmiykhCovBmxjO4k55vA\"",
    "mtime": "2026-07-09T19:46:30.753Z",
    "size": 2044,
    "path": "../public/_build/assets/ExpiryDashboardView-C91BEQcP.js.gz"
  },
  "/_build/assets/PageHeader-DCseRZAi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"263-4CJ+pG0Rj12O4cxM7qn8YncT7i8\"",
    "mtime": "2026-07-09T19:46:30.713Z",
    "size": 611,
    "path": "../public/_build/assets/PageHeader-DCseRZAi.js"
  },
  "/_build/assets/ReceivingView-BBPCKzbH.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3e52-KlkG5pFn3fWMgsty+t6yq1MZsGU\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 15954,
    "path": "../public/_build/assets/ReceivingView-BBPCKzbH.js"
  },
  "/_build/assets/ReceivingView-BBPCKzbH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1519-KMBP0Cot0SIuYTCNcDnkc2V7Yhc\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 5401,
    "path": "../public/_build/assets/ReceivingView-BBPCKzbH.js.br"
  },
  "/_build/assets/ReceivingView-BBPCKzbH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"17bb-5rF+JXo6GgfnPz0UWeDOrlCXZ7M\"",
    "mtime": "2026-07-09T19:46:30.754Z",
    "size": 6075,
    "path": "../public/_build/assets/ReceivingView-BBPCKzbH.js.gz"
  },
  "/_build/assets/Spinner-B83-KybF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19a-sPnvNmGqz9qgT6ZhesIj8Xos+Q4\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 410,
    "path": "../public/_build/assets/Spinner-B83-KybF.js"
  },
  "/_build/assets/StateBadge-xft7AthD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19c-LJK3CHGpDjCWPydajSK65r2wbLM\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 412,
    "path": "../public/_build/assets/StateBadge-xft7AthD.js"
  },
  "/_build/assets/_commonjsHelpers-Cpj98o6Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec-QtY1KaLA8vnMK3l2IvajpxyuPmY\"",
    "mtime": "2026-07-09T19:46:30.713Z",
    "size": 236,
    "path": "../public/_build/assets/_commonjsHelpers-Cpj98o6Y.js"
  },
  "/_build/assets/_id_-DMSRyfSW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2975-lcnE2CjykD3GAWPVBqIm6HT593Y\"",
    "mtime": "2026-07-09T19:46:30.786Z",
    "size": 10613,
    "path": "../public/_build/assets/_id_-DMSRyfSW.js.br"
  },
  "/_build/assets/_id_-DMSRyfSW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a1f8-jRjztj+s/FW74LEnujLgIEHlHWs\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 41464,
    "path": "../public/_build/assets/_id_-DMSRyfSW.js"
  },
  "/_build/assets/_id_-DMSRyfSW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2e43-IPMD4CrwClwI90xmITn3c62rD94\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 11843,
    "path": "../public/_build/assets/_id_-DMSRyfSW.js.gz"
  },
  "/_build/assets/activeOffersService-yI_-GJxd.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"521-5RsDC3ai8ynagU2qt+9dFSZvhu8\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 1313,
    "path": "../public/_build/assets/activeOffersService-yI_-GJxd.js"
  },
  "/_build/assets/activeOffersService-yI_-GJxd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"29f-8cMUrnm3Tavxlc/BHCjZVMJVmek\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 671,
    "path": "../public/_build/assets/activeOffersService-yI_-GJxd.js.br"
  },
  "/_build/assets/activeOffersService-yI_-GJxd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2f6-LzP7vfquq9LCMZyzo4DFt5CCVhg\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 758,
    "path": "../public/_build/assets/activeOffersService-yI_-GJxd.js.gz"
  },
  "/_build/assets/admin-BuYDihb7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2ab4-H+aDR31334IN3lTWNpPtyDwIlO4\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 10932,
    "path": "../public/_build/assets/admin-BuYDihb7.js"
  },
  "/_build/assets/admin-BuYDihb7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e33-+nRrHDVhPty/n3p/4k1oGpO1wm0\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 3635,
    "path": "../public/_build/assets/admin-BuYDihb7.js.br"
  },
  "/_build/assets/admin-BuYDihb7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"fb5-e69l4H0jGwjV8AaDfkYhEY0fI7s\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 4021,
    "path": "../public/_build/assets/admin-BuYDihb7.js.gz"
  },
  "/_build/assets/apiAdapter-CetL3odT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f6e-bKrzg9GwGmwxpEGW9ctYT4Fvum4\"",
    "mtime": "2026-07-09T19:46:30.777Z",
    "size": 3950,
    "path": "../public/_build/assets/apiAdapter-CetL3odT.js.br"
  },
  "/_build/assets/apiAdapter-CetL3odT.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4446-6d0ONd5mc/vdutN8oiQKtaZJGr4\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 17478,
    "path": "../public/_build/assets/apiAdapter-CetL3odT.js"
  },
  "/_build/assets/apiAdapter-CetL3odT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"10fa-dDXx9NskrAyi84C2hB8s11w5w/8\"",
    "mtime": "2026-07-09T19:46:30.765Z",
    "size": 4346,
    "path": "../public/_build/assets/apiAdapter-CetL3odT.js.gz"
  },
  "/_build/assets/auth-aGgy2W97.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1020-JA4wq47llJNKBhS9myp9Ad0/Wyk\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 4128,
    "path": "../public/_build/assets/auth-aGgy2W97.js"
  },
  "/_build/assets/auth-aGgy2W97.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6b9-kvFYyqu3QGiLvGqYa1wAEXOf/Iw\"",
    "mtime": "2026-07-09T19:46:30.777Z",
    "size": 1721,
    "path": "../public/_build/assets/auth-aGgy2W97.js.br"
  },
  "/_build/assets/auth-aGgy2W97.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"763-u1+xO5aHhK6SfxQc9zD9JJmLzh4\"",
    "mtime": "2026-07-09T19:46:30.767Z",
    "size": 1891,
    "path": "../public/_build/assets/auth-aGgy2W97.js.gz"
  },
  "/_build/assets/boxLabelPdf-enPRriP2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"784-OSOg3pGRh/IKOD6g6npjOx6aACs\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 1924,
    "path": "../public/_build/assets/boxLabelPdf-enPRriP2.js"
  },
  "/_build/assets/boxLabelPdf-enPRriP2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3f5-FyqRtATHdIWLE1eq/ouHsVZMQD4\"",
    "mtime": "2026-07-09T19:46:30.767Z",
    "size": 1013,
    "path": "../public/_build/assets/boxLabelPdf-enPRriP2.js.gz"
  },
  "/_build/assets/boxLabelPdf-enPRriP2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"38c-SNTvaDjq5yljP/PbSandhdUyRwI\"",
    "mtime": "2026-07-09T19:46:30.767Z",
    "size": 908,
    "path": "../public/_build/assets/boxLabelPdf-enPRriP2.js.br"
  },
  "/_build/assets/boxes-DBOh4gSd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39b-CATp1C034yjwSFvCBiU2C2jHN4c\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 923,
    "path": "../public/_build/assets/boxes-DBOh4gSd.js"
  },
  "/_build/assets/browser-BHXLhbL5.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"633c-fh2D8WREaKpIQryEfG8MPZ7OVHA\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 25404,
    "path": "../public/_build/assets/browser-BHXLhbL5.js"
  },
  "/_build/assets/browser-BHXLhbL5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"21dc-yY7sCYyIfqE6ls8yYzHWeK9fM6s\"",
    "mtime": "2026-07-09T19:46:30.787Z",
    "size": 8668,
    "path": "../public/_build/assets/browser-BHXLhbL5.js.br"
  },
  "/_build/assets/browser-BHXLhbL5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"26ea-ymhD/d5ng2+eKW75xDRoe9FrPjs\"",
    "mtime": "2026-07-09T19:46:30.776Z",
    "size": 9962,
    "path": "../public/_build/assets/browser-BHXLhbL5.js.gz"
  },
  "/_build/assets/bultos-B3AkQI5I.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"27ad-gkvlJf3fR+Ljqw93EW9Nd30Te5E\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 10157,
    "path": "../public/_build/assets/bultos-B3AkQI5I.js"
  },
  "/_build/assets/bultos-B3AkQI5I.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"db2-6A3dscjjiKqIPFxEuqamQYlJF24\"",
    "mtime": "2026-07-09T19:46:30.777Z",
    "size": 3506,
    "path": "../public/_build/assets/bultos-B3AkQI5I.js.br"
  },
  "/_build/assets/bultos-B3AkQI5I.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f49-o0qTxZ5da0UdRVy/SrXoKAkNd5s\"",
    "mtime": "2026-07-09T19:46:30.777Z",
    "size": 3913,
    "path": "../public/_build/assets/bultos-B3AkQI5I.js.gz"
  },
  "/_build/assets/callback-DMM4bifN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4ab-eU3caSuV0bFHszEfLvPBkrtjlL8\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 1195,
    "path": "../public/_build/assets/callback-DMM4bifN.js"
  },
  "/_build/assets/callback-DMM4bifN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"25a-kqO4pIO1bkm2c3rJBcgvM3NOHlw\"",
    "mtime": "2026-07-09T19:46:30.786Z",
    "size": 602,
    "path": "../public/_build/assets/callback-DMM4bifN.js.br"
  },
  "/_build/assets/callback-DMM4bifN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2bc-G3vaY4o1XwEL3w+hkYkqn9igLxY\"",
    "mtime": "2026-07-09T19:46:30.777Z",
    "size": 700,
    "path": "../public/_build/assets/callback-DMM4bifN.js.gz"
  },
  "/_build/assets/check-Q-ehJbuO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c4-/CjQ7/sBMOiGjFvwK+8dcC2cqsk\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 196,
    "path": "../public/_build/assets/check-Q-ehJbuO.js"
  },
  "/_build/assets/chevron-right-DtDU7Jd2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c5-iXrSDWZjkhLH8T17L4zhh4y7ug0\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 197,
    "path": "../public/_build/assets/chevron-right-DtDU7Jd2.js"
  },
  "/_build/assets/circle-check-DLWZK-4D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fa-MgIAreioWlMFcnLvgkNgPya7ifo\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 250,
    "path": "../public/_build/assets/circle-check-DLWZK-4D.js"
  },
  "/_build/assets/client-CzsJzvoi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"749f-7CE2Wa5+G39xsuyDRsYIUvQ8NkA\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 29855,
    "path": "../public/_build/assets/client-CzsJzvoi.js"
  },
  "/_build/assets/client-CzsJzvoi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"20d9-n4ekBfnpfgzwoCWcsqwwPBFlnLw\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 8409,
    "path": "../public/_build/assets/client-CzsJzvoi.js.br"
  },
  "/_build/assets/client-CzsJzvoi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2537-gs+h78HV9gARyPq/ZTDeqDnKqqM\"",
    "mtime": "2026-07-09T19:46:30.786Z",
    "size": 9527,
    "path": "../public/_build/assets/client-CzsJzvoi.js.gz"
  },
  "/_build/assets/client-Dusn-yFK.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"b02b-AJ82cTvnBcpP6iAk2PEoRECG4A4\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 45099,
    "path": "../public/_build/assets/client-Dusn-yFK.css"
  },
  "/_build/assets/client-Dusn-yFK.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1b9d-lenjiFV4nWre0aQG4ntvbhqyeEU\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 7069,
    "path": "../public/_build/assets/client-Dusn-yFK.css.br"
  },
  "/_build/assets/client-Dusn-yFK.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"201f-ZYXJ93goco+6HxI8hRx9RoXo8mY\"",
    "mtime": "2026-07-09T19:46:30.786Z",
    "size": 8223,
    "path": "../public/_build/assets/client-Dusn-yFK.css.gz"
  },
  "/_build/assets/clock-D8b1lOEC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f1-XAC8SZZ9E9oqlIywOEnGlMeXo4U\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 241,
    "path": "../public/_build/assets/clock-D8b1lOEC.js"
  },
  "/_build/assets/commitInputs-9mhp6919.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23c-+B6A7EqFy5VwWxBDJLxWMYeWvJU\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 572,
    "path": "../public/_build/assets/commitInputs-9mhp6919.js"
  },
  "/_build/assets/components-BaoDfp3E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33a-iE5DZD2bus/Fck7mI8LbuCozNEc\"",
    "mtime": "2026-07-09T19:46:30.714Z",
    "size": 826,
    "path": "../public/_build/assets/components-BaoDfp3E.js"
  },
  "/_build/assets/consolidate-NQ7QUAdo.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ba2-7p3EmtrmGgOmRlyHXJu2OulGXfo\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 7074,
    "path": "../public/_build/assets/consolidate-NQ7QUAdo.js"
  },
  "/_build/assets/consolidate-NQ7QUAdo.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"98c-xf0oH8FL0ChtOlIKUEF4vd1I0Aw\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 2444,
    "path": "../public/_build/assets/consolidate-NQ7QUAdo.js.br"
  },
  "/_build/assets/consolidate-NQ7QUAdo.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a9e-zWjaKcJ9ochy5570D57efUebxTM\"",
    "mtime": "2026-07-09T19:46:30.787Z",
    "size": 2718,
    "path": "../public/_build/assets/consolidate-NQ7QUAdo.js.gz"
  },
  "/_build/assets/dollar-sign-n7q7l7RZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11e-Jy/lqDml3rsnLiWtYFD0TUckJpg\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 286,
    "path": "../public/_build/assets/dollar-sign-n7q7l7RZ.js"
  },
  "/_build/assets/expiry-BHKLkZHY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"162-w/yQqerW7A5hBG+oeg0npMLf+Qk\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 354,
    "path": "../public/_build/assets/expiry-BHKLkZHY.js"
  },
  "/_build/assets/file-text-BtXmJjSV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c9-6+0x4vH/VyjgpmhJ18ckZZfcY0Q\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 457,
    "path": "../public/_build/assets/file-text-BtXmJjSV.js"
  },
  "/_build/assets/html2canvas.esm-B0tyYwQk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"97bc-7kCgeOMV57YbY7sNB2MWh5VeyKk\"",
    "mtime": "2026-07-09T19:46:30.966Z",
    "size": 38844,
    "path": "../public/_build/assets/html2canvas.esm-B0tyYwQk.js.br"
  },
  "/_build/assets/html2canvas.esm-B0tyYwQk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"baad-dUmrrJBxb9t6W6Vo1VYp53jDW3k\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 47789,
    "path": "../public/_build/assets/html2canvas.esm-B0tyYwQk.js.gz"
  },
  "/_build/assets/index-B5Njxpm-.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5b94-9sreEP+awITzwqHJoiMIs0DvMHg\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 23444,
    "path": "../public/_build/assets/index-B5Njxpm-.js"
  },
  "/_build/assets/html2canvas.esm-B0tyYwQk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3167b-rHTRwHaZunlshPtKtRGoIeyWH2M\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 202363,
    "path": "../public/_build/assets/html2canvas.esm-B0tyYwQk.js"
  },
  "/_build/assets/index-B5Njxpm-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"189e-dmuSBPE6gdtUvqnxF1lXMO22wEI\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 6302,
    "path": "../public/_build/assets/index-B5Njxpm-.js.br"
  },
  "/_build/assets/index-B5Njxpm-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1bb0-tH9GxUdbOCSaFzM6rJ+pdK5sLMg\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 7088,
    "path": "../public/_build/assets/index-B5Njxpm-.js.gz"
  },
  "/_build/assets/index-C73be1ng.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"492-3rrArFYoWQ4ERH5hCrBS0HQoYM0\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 1170,
    "path": "../public/_build/assets/index-C73be1ng.js"
  },
  "/_build/assets/index-C73be1ng.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"237-eLmSj+ti4QSuPSxMV6MRsfyjaCI\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 567,
    "path": "../public/_build/assets/index-C73be1ng.js.br"
  },
  "/_build/assets/index-C73be1ng.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"29a-53f30rAyZ7g2u0yU8zCRyDCVmcw\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 666,
    "path": "../public/_build/assets/index-C73be1ng.js.gz"
  },
  "/_build/assets/index-DE6pPXWl.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4db9-wGQ6pNIeFvKrcRRpGHLjRA5iGXE\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 19897,
    "path": "../public/_build/assets/index-DE6pPXWl.js"
  },
  "/_build/assets/index-DE6pPXWl.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"12d4-CFlknv03xkT+0CzqFeOSSy8A8v8\"",
    "mtime": "2026-07-09T19:46:30.815Z",
    "size": 4820,
    "path": "../public/_build/assets/index-DE6pPXWl.js.br"
  },
  "/_build/assets/index-DE6pPXWl.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"14f9-gCfVks7BkUqLXiws0B+P1OrYMkg\"",
    "mtime": "2026-07-09T19:46:30.813Z",
    "size": 5369,
    "path": "../public/_build/assets/index-DE6pPXWl.js.gz"
  },
  "/_build/assets/index-Dpb9b6Xz.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1d6d-Mjadk3y9/JJST5ZwcvY1G+YlekY\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 7533,
    "path": "../public/_build/assets/index-Dpb9b6Xz.js"
  },
  "/_build/assets/index-Dpb9b6Xz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a83-Q0HMGVCVeApsY509cVHQyvHEJ6s\"",
    "mtime": "2026-07-09T19:46:30.815Z",
    "size": 2691,
    "path": "../public/_build/assets/index-Dpb9b6Xz.js.br"
  },
  "/_build/assets/index-Dpb9b6Xz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bc7-Rc4VSZ12rsbP9skF8somMNzmeN4\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 3015,
    "path": "../public/_build/assets/index-Dpb9b6Xz.js.gz"
  },
  "/_build/assets/index-DzXKVbrF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"e34-RGGYnjV9IotNk4dIPaMpjBppMOo\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 3636,
    "path": "../public/_build/assets/index-DzXKVbrF.js"
  },
  "/_build/assets/index-DzXKVbrF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"622-90U18hswQd3KaNIQoAv4M5BCCm4\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 1570,
    "path": "../public/_build/assets/index-DzXKVbrF.js.br"
  },
  "/_build/assets/index-DzXKVbrF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6e5-gWXZNxYGLqsHRJcg1aWFrtedHXQ\"",
    "mtime": "2026-07-09T19:46:30.814Z",
    "size": 1765,
    "path": "../public/_build/assets/index-DzXKVbrF.js.gz"
  },
  "/_build/assets/index.es-Bibbuyuc.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b5b2-XQ9jRk7eZbJOrBIBwG2x8dG2blM\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 46514,
    "path": "../public/_build/assets/index.es-Bibbuyuc.js.br"
  },
  "/_build/assets/index.es-Bibbuyuc.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"26fae-LrD09AlbH9eRF/KRusyInM7qd3M\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 159662,
    "path": "../public/_build/assets/index.es-Bibbuyuc.js"
  },
  "/_build/assets/intake-CBLnt3gN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1063-gqPY56ids5qk7ucL1CdiZPtyGiE\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 4195,
    "path": "../public/_build/assets/intake-CBLnt3gN.js"
  },
  "/_build/assets/index.es-Bibbuyuc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d0a1-SaI6sKqqm48tSuaSFwKdmw6exS4\"",
    "mtime": "2026-07-09T19:46:30.846Z",
    "size": 53409,
    "path": "../public/_build/assets/index.es-Bibbuyuc.js.gz"
  },
  "/_build/assets/intake-CBLnt3gN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5cd-LY9vczzasOB2SvESQKG09OVTmmw\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 1485,
    "path": "../public/_build/assets/intake-CBLnt3gN.js.br"
  },
  "/_build/assets/intake-CBLnt3gN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"685-VqVG0DcTvQLP0cgEY8+one08Rh0\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 1669,
    "path": "../public/_build/assets/intake-CBLnt3gN.js.gz"
  },
  "/_build/assets/inventoryStore-C7PM2MGM.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"734-zsMTor+2p6/7afeHcoMxKiyWaNE\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 1844,
    "path": "../public/_build/assets/inventoryStore-C7PM2MGM.js"
  },
  "/_build/assets/inventoryStore-C7PM2MGM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"32e-KZhvLsuyQsJsMyn8zMFBGD8Yfz4\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 814,
    "path": "../public/_build/assets/inventoryStore-C7PM2MGM.js.br"
  },
  "/_build/assets/inventoryStore-C7PM2MGM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"371-csj7BqeucNpAtjWLrToQ+gzEu00\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 881,
    "path": "../public/_build/assets/inventoryStore-C7PM2MGM.js.gz"
  },
  "/_build/assets/invoiceStore-DsKkuxWZ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1aab-juZgG27VbEDfV5upd0EOSoHdzhk\"",
    "mtime": "2026-07-09T19:46:30.715Z",
    "size": 6827,
    "path": "../public/_build/assets/invoiceStore-DsKkuxWZ.js"
  },
  "/_build/assets/invoiceStore-DsKkuxWZ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8a2-VM7HnvDrkNT+WtOM2qooWLbSfJE\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 2210,
    "path": "../public/_build/assets/invoiceStore-DsKkuxWZ.js.br"
  },
  "/_build/assets/invoiceStore-DsKkuxWZ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9c6-4lLXn4dyKVlxJ3EGAjuarjK/6ek\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 2502,
    "path": "../public/_build/assets/invoiceStore-DsKkuxWZ.js.gz"
  },
  "/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3006-Ix0XcOI98G5cotRmJhXYMtoLBB8\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 12294,
    "path": "../public/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js"
  },
  "/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d0d-/PFJwam/TUfaXztWNFH1HteLPIM\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 3341,
    "path": "../public/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js.br"
  },
  "/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e88-VXT9qJSGpU82SzXmsyYLm24JQZ8\"",
    "mtime": "2026-07-09T19:46:30.844Z",
    "size": 3720,
    "path": "../public/_build/assets/invoiceStyledFormStore-D8Hdf6jE.js.gz"
  },
  "/_build/assets/jspdf.es.min-fClK7Czv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1a4ae-meh6j7BnybxloMe9VlRJesEuQys\"",
    "mtime": "2026-07-09T19:46:31.262Z",
    "size": 107694,
    "path": "../public/_build/assets/jspdf.es.min-fClK7Czv.js.br"
  },
  "/_build/assets/kit-2clcu5wE.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1f8f-SejeOCGB/BFa2/yDro2ocGQ74tw\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 8079,
    "path": "../public/_build/assets/kit-2clcu5wE.js"
  },
  "/_build/assets/kit-2clcu5wE.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"9b0-Y6zEotzVLIDBaWBlEoy0lxYYVp8\"",
    "mtime": "2026-07-09T19:46:30.845Z",
    "size": 2480,
    "path": "../public/_build/assets/kit-2clcu5wE.js.br"
  },
  "/_build/assets/jspdf.es.min-fClK7Czv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1f47a-IZrScptioMx7riy13OWvtTL8gCI\"",
    "mtime": "2026-07-09T19:46:30.866Z",
    "size": 128122,
    "path": "../public/_build/assets/jspdf.es.min-fClK7Czv.js.gz"
  },
  "/_build/assets/kit-2clcu5wE.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b04-4otXY53hqKJ+kVxFDT4nFktrA3U\"",
    "mtime": "2026-07-09T19:46:30.845Z",
    "size": 2820,
    "path": "../public/_build/assets/kit-2clcu5wE.js.gz"
  },
  "/_build/assets/jspdf.es.min-fClK7Czv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5f222-mnqfdHF6gCXaO0TH77EfzzHzOuM\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 389666,
    "path": "../public/_build/assets/jspdf.es.min-fClK7Czv.js"
  },
  "/_build/assets/layers-9FZittZH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ed-8/JHuk/9R8jt0ih2qFW2Z+g2yUY\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 493,
    "path": "../public/_build/assets/layers-9FZittZH.js"
  },
  "/_build/assets/loans-B2jYBNcR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ca2-+/ms7smVWwHorEga3/wXbhLzJT0\"",
    "mtime": "2026-07-09T19:46:30.854Z",
    "size": 3234,
    "path": "../public/_build/assets/loans-B2jYBNcR.js.br"
  },
  "/_build/assets/loans-B2jYBNcR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"22f8-0OSf1QNUmZM/6mfSXQF+5kQ/WY0\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 8952,
    "path": "../public/_build/assets/loans-B2jYBNcR.js"
  },
  "/_build/assets/loans-B2jYBNcR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e5e-IPTnwdYqEsWTZ4carMGIwjsGCjM\"",
    "mtime": "2026-07-09T19:46:30.854Z",
    "size": 3678,
    "path": "../public/_build/assets/loans-B2jYBNcR.js.gz"
  },
  "/_build/assets/locations-8IolOmMk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"e54-sHnT9TxdWA0GAtYslYdqE5Kqc1o\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 3668,
    "path": "../public/_build/assets/locations-8IolOmMk.js"
  },
  "/_build/assets/locations-8IolOmMk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5a3-o3soaCM33zhHyDUDbx0YxAGEmh4\"",
    "mtime": "2026-07-09T19:46:30.909Z",
    "size": 1443,
    "path": "../public/_build/assets/locations-8IolOmMk.js.br"
  },
  "/_build/assets/locations-8IolOmMk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"660-AGDj5Y18OI+AqFeWdweZPOtVztM\"",
    "mtime": "2026-07-09T19:46:30.909Z",
    "size": 1632,
    "path": "../public/_build/assets/locations-8IolOmMk.js.gz"
  },
  "/_build/assets/login-B6B_LhC7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"613-tMMv+lHCGvptso9ZGsrCnkeUKJ0\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 1555,
    "path": "../public/_build/assets/login-B6B_LhC7.js"
  },
  "/_build/assets/login-B6B_LhC7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2e5-vVh0d+QMhX211WTXJ3ddN7I6Rj0\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 741,
    "path": "../public/_build/assets/login-B6B_LhC7.js.br"
  },
  "/_build/assets/login-B6B_LhC7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"357-COsJJpmhkhIYgJVkgEwfzJBF+M8\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 855,
    "path": "../public/_build/assets/login-B6B_LhC7.js.gz"
  },
  "/_build/assets/manifest-Bd95Vycz.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1894-MaVMxmWhsMCZILZ6Ksu8Xln4IOU\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 6292,
    "path": "../public/_build/assets/manifest-Bd95Vycz.js"
  },
  "/_build/assets/manifest-Bd95Vycz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"98a-ufk4eUwJxrJT6kr6aoH7fS34XmM\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 2442,
    "path": "../public/_build/assets/manifest-Bd95Vycz.js.br"
  },
  "/_build/assets/manifest-Bd95Vycz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a89-ObkgxJuRLDvkytuDo2W+AWLrvRk\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 2697,
    "path": "../public/_build/assets/manifest-Bd95Vycz.js.gz"
  },
  "/_build/assets/manifests-B8On4Fma.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"8cb-FNkyGFChfBrHaB2FCkIkPlFhyFg\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 2251,
    "path": "../public/_build/assets/manifests-B8On4Fma.js"
  },
  "/_build/assets/manifests-B8On4Fma.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"40e-PK6tUNav+ZAEpJGpAehC9CT1i9Y\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 1038,
    "path": "../public/_build/assets/manifests-B8On4Fma.js.br"
  },
  "/_build/assets/manifests-B8On4Fma.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"469-E/dofRW8lsZpLfa2Qj4viOp0dzY\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 1129,
    "path": "../public/_build/assets/manifests-B8On4Fma.js.gz"
  },
  "/_build/assets/map-pin-DbPzQlpi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14b-KkziiAaQ7BIv18FZkkET/hINYUo\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 331,
    "path": "../public/_build/assets/map-pin-DbPzQlpi.js"
  },
  "/_build/assets/new-Cghoz_Dk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"da6a-hkUqeSSED3/ujkURavedfYoWnNI\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 55914,
    "path": "../public/_build/assets/new-Cghoz_Dk.js"
  },
  "/_build/assets/new-Cghoz_Dk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"33ac-FY+3lJJAvLTjwg0aBAx9Lj8wK/o\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 13228,
    "path": "../public/_build/assets/new-Cghoz_Dk.js.br"
  },
  "/_build/assets/new-Cghoz_Dk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3a4d-50dvqSYXnp903jNSGJwhltOQc3Y\"",
    "mtime": "2026-07-09T19:46:30.910Z",
    "size": 14925,
    "path": "../public/_build/assets/new-Cghoz_Dk.js.gz"
  },
  "/_build/assets/offers-BIBRCYbM.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3818-7+wi+hNuL5ojTCG+9mjAi1/PxAs\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 14360,
    "path": "../public/_build/assets/offers-BIBRCYbM.js"
  },
  "/_build/assets/offers-BIBRCYbM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"10a5-czi6wP4LwxY+SIdgvs6T33qjXqU\"",
    "mtime": "2026-07-09T19:46:30.922Z",
    "size": 4261,
    "path": "../public/_build/assets/offers-BIBRCYbM.js.br"
  },
  "/_build/assets/offers-BIBRCYbM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"12d1-kl5S87lwsYWh0NJ1gK77mw2G2Lw\"",
    "mtime": "2026-07-09T19:46:30.922Z",
    "size": 4817,
    "path": "../public/_build/assets/offers-BIBRCYbM.js.gz"
  },
  "/_build/assets/opsApi-USmtUle1.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6fd-2fJtuVzOjuxrmIU5NM423Clbs7Y\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 1789,
    "path": "../public/_build/assets/opsApi-USmtUle1.js"
  },
  "/_build/assets/opsApi-USmtUle1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"37e-P/z/dOpMBdhIEcwG5KwkNvnGGKM\"",
    "mtime": "2026-07-09T19:46:30.922Z",
    "size": 894,
    "path": "../public/_build/assets/opsApi-USmtUle1.js.gz"
  },
  "/_build/assets/opsApi-USmtUle1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"322-bTY+umCgsHKeWjSG54Xiysq6YCQ\"",
    "mtime": "2026-07-09T19:46:30.922Z",
    "size": 802,
    "path": "../public/_build/assets/opsApi-USmtUle1.js.br"
  },
  "/_build/assets/package-CIpbQG3v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bc-Zvb2RpqOm/69NJcJ9fk9jciI6CY\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 444,
    "path": "../public/_build/assets/package-CIpbQG3v.js"
  },
  "/_build/assets/package-plus-DG8BWOdj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"206-Wyv97P9d9zzGkqxVnDqKF9rFFX0\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 518,
    "path": "../public/_build/assets/package-plus-DG8BWOdj.js"
  },
  "/_build/assets/pencil-DKpYwLJl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15c-dzUqpzeDOakGPwzXWACHQzExOco\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 348,
    "path": "../public/_build/assets/pencil-DKpYwLJl.js"
  },
  "/_build/assets/plus-DeDz2Vv9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e1-nh5ihk12f4nbXplNSE11ZNiLwjo\"",
    "mtime": "2026-07-09T19:46:30.716Z",
    "size": 225,
    "path": "../public/_build/assets/plus-DeDz2Vv9.js"
  },
  "/_build/assets/pos-B2b0P2eU.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2efe-CXybBDCyuLW956KnrQ9DhGhzwV0\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 12030,
    "path": "../public/_build/assets/pos-B2b0P2eU.js"
  },
  "/_build/assets/pos-B2b0P2eU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f7c-C5Y1wsis3tnjG/jLgf/33+87cs0\"",
    "mtime": "2026-07-09T19:46:30.931Z",
    "size": 3964,
    "path": "../public/_build/assets/pos-B2b0P2eU.js.br"
  },
  "/_build/assets/pos-B2b0P2eU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1139-RntyTteVqifKazHjksCNKi+3F8U\"",
    "mtime": "2026-07-09T19:46:30.931Z",
    "size": 4409,
    "path": "../public/_build/assets/pos-B2b0P2eU.js.gz"
  },
  "/_build/assets/posReceiptPdf-C7bN3i4a.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ff1-q7wmj1kdyBttrDUfVrhg1jufrlc\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 8177,
    "path": "../public/_build/assets/posReceiptPdf-C7bN3i4a.js"
  },
  "/_build/assets/posReceiptPdf-C7bN3i4a.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a2a-wTbGnU+Npcm4TYbeMS4OYYV2bQ0\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 2602,
    "path": "../public/_build/assets/posReceiptPdf-C7bN3i4a.js.br"
  },
  "/_build/assets/posReceiptPdf-C7bN3i4a.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b43-Nm7dTITX1b3zHltK661lbmywdMs\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 2883,
    "path": "../public/_build/assets/posReceiptPdf-C7bN3i4a.js.gz"
  },
  "/_build/assets/preload-helper-ug3pwPZ1.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"45d-XiQMNpbVR2X0xJL+SxLhHj6mxQk\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 1117,
    "path": "../public/_build/assets/preload-helper-ug3pwPZ1.js"
  },
  "/_build/assets/preload-helper-ug3pwPZ1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"219-M4m9Tmf23DzC7fqfeE0YouucbAc\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 537,
    "path": "../public/_build/assets/preload-helper-ug3pwPZ1.js.br"
  },
  "/_build/assets/preload-helper-ug3pwPZ1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"28d-Z5ThR7vdKzwXSki3u9wq9pzNr0w\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 653,
    "path": "../public/_build/assets/preload-helper-ug3pwPZ1.js.gz"
  },
  "/_build/assets/printer-Cf1ZPyaN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"187-gdc2wg5pFyH7xBMhdukbCrKqGo4\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 391,
    "path": "../public/_build/assets/printer-Cf1ZPyaN.js"
  },
  "/_build/assets/purify.es-BSKMTLSQ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"672a-0L8NDvxCF/Ssw7J1nKTa02noHwo\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 26410,
    "path": "../public/_build/assets/purify.es-BSKMTLSQ.js"
  },
  "/_build/assets/purify.es-BSKMTLSQ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"22c6-dqIUvmRzKTi303Cf1DDoPvQdmyQ\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 8902,
    "path": "../public/_build/assets/purify.es-BSKMTLSQ.js.br"
  },
  "/_build/assets/purify.es-BSKMTLSQ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"26d1-pHSjSW071nOLvu+qxpmYJHYkHOQ\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 9937,
    "path": "../public/_build/assets/purify.es-BSKMTLSQ.js.gz"
  },
  "/_build/assets/receiving-COVO3T_R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"220-moZOmhKsA+hThU+QYLnDhOF2lps\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 544,
    "path": "../public/_build/assets/receiving-COVO3T_R.js"
  },
  "/_build/assets/route-BTCqJtyu.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2408-3uXT60WoX+Yimf0v9yeC7q885hQ\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 9224,
    "path": "../public/_build/assets/route-BTCqJtyu.js"
  },
  "/_build/assets/route-BTCqJtyu.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c85-cJHf9WyHrlyeliydMkkL8ecgkmM\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 3205,
    "path": "../public/_build/assets/route-BTCqJtyu.js.br"
  },
  "/_build/assets/route-BTCqJtyu.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"dbc-2bRzNH3UREHmO0rsgxgGmHshvx0\"",
    "mtime": "2026-07-09T19:46:30.965Z",
    "size": 3516,
    "path": "../public/_build/assets/route-BTCqJtyu.js.gz"
  },
  "/_build/assets/route-Cc9XYK9u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"146-M7hCiltWccNdYJapznaZHg45RhM\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 326,
    "path": "../public/_build/assets/route-Cc9XYK9u.js"
  },
  "/_build/assets/routing-CHVOqQEM.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ed2-8eI2RNxELymeM8h5SM6HU469XTU\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 7890,
    "path": "../public/_build/assets/routing-CHVOqQEM.js"
  },
  "/_build/assets/routing-CHVOqQEM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d1a-e5CKA2aNEI00NB/SdTLmR7ULgkQ\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 3354,
    "path": "../public/_build/assets/routing-CHVOqQEM.js.br"
  },
  "/_build/assets/routing-CHVOqQEM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e52-/MXK13MDsaqLRYEofTqAxo7hXCE\"",
    "mtime": "2026-07-09T19:46:30.966Z",
    "size": 3666,
    "path": "../public/_build/assets/routing-CHVOqQEM.js.gz"
  },
  "/_build/assets/save-CTI5JQJX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18f-vCVbvRZCD02Ao4VABK/zVVab5h4\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 399,
    "path": "../public/_build/assets/save-CTI5JQJX.js"
  },
  "/_build/assets/scan-line-BkkbALDz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"193-dfYYTjEPMSeN5Bs3CHWGSyvD56E\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 403,
    "path": "../public/_build/assets/scan-line-BkkbALDz.js"
  },
  "/_build/assets/search-DL_in37x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f6-MverhYXjcSfTksWylTUYO1uzeq4\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 246,
    "path": "../public/_build/assets/search-DL_in37x.js"
  },
  "/_build/assets/sso-rnVQVqKt.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"778-08dElOevZ2ITaDm20m8mKs1TVJQ\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 1912,
    "path": "../public/_build/assets/sso-rnVQVqKt.js"
  },
  "/_build/assets/sso-rnVQVqKt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"375-c9PpQKIfl8DUGwJ8p/vTRjvyNbs\"",
    "mtime": "2026-07-09T19:46:30.971Z",
    "size": 885,
    "path": "../public/_build/assets/sso-rnVQVqKt.js.br"
  },
  "/_build/assets/sso-rnVQVqKt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3e8-oKyPlUqOHAdUFyA4b3ntRfjZJsQ\"",
    "mtime": "2026-07-09T19:46:30.969Z",
    "size": 1000,
    "path": "../public/_build/assets/sso-rnVQVqKt.js.gz"
  },
  "/_build/assets/store-DzdKpxap.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"e91-Ia31BydzjwREVYu2RqAQBBKe4dA\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 3729,
    "path": "../public/_build/assets/store-DzdKpxap.js"
  },
  "/_build/assets/store-DzdKpxap.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"591-dHu2VUD5SE9bTGiMU5Gl6c+YO8Q\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 1425,
    "path": "../public/_build/assets/store-DzdKpxap.js.br"
  },
  "/_build/assets/store-DzdKpxap.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5ff-nFXDNaVxJYLpNCEnTOTiajZJ6Wo\"",
    "mtime": "2026-07-09T19:46:30.971Z",
    "size": 1535,
    "path": "../public/_build/assets/store-DzdKpxap.js.gz"
  },
  "/_build/assets/tariffConfigService-B4CQUZgr.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2b20-6sjJcXUrnWrKjjKbK+752Cr8ai0\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 11040,
    "path": "../public/_build/assets/tariffConfigService-B4CQUZgr.js"
  },
  "/_build/assets/tariffConfigService-B4CQUZgr.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f38-ajRkK9YdX2JdYgWvHlXs1tPSHFU\"",
    "mtime": "2026-07-09T19:46:30.976Z",
    "size": 3896,
    "path": "../public/_build/assets/tariffConfigService-B4CQUZgr.js.br"
  },
  "/_build/assets/tariffConfigService-B4CQUZgr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"10fb-0GpTiMvtZJzQuv5cwqvKp68SeTg\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 4347,
    "path": "../public/_build/assets/tariffConfigService-B4CQUZgr.js.gz"
  },
  "/_build/assets/track-D__Ngse5.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"c61-XMmkYpdTcM5DhxZNjXCVRn/Z7pE\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 3169,
    "path": "../public/_build/assets/track-D__Ngse5.js"
  },
  "/_build/assets/track-D__Ngse5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"55f-KoD2lptApdBGu04xeclHF6tOM3k\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 1375,
    "path": "../public/_build/assets/track-D__Ngse5.js.br"
  },
  "/_build/assets/track-D__Ngse5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5ec-K1Dr4rM6lPKY39Q0i7TBgbs0jl8\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 1516,
    "path": "../public/_build/assets/track-D__Ngse5.js.gz"
  },
  "/_build/assets/transit-81KOEFnY.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"884-2Q2lu7GgpGe5HmKqbyyn23BPv/o\"",
    "mtime": "2026-07-09T19:46:30.717Z",
    "size": 2180,
    "path": "../public/_build/assets/transit-81KOEFnY.js"
  },
  "/_build/assets/transit-81KOEFnY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"410-lAusVsfkpRlVeDN2sfYOZpWf/dM\"",
    "mtime": "2026-07-09T19:46:30.974Z",
    "size": 1040,
    "path": "../public/_build/assets/transit-81KOEFnY.js.br"
  },
  "/_build/assets/transit-81KOEFnY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"48e-SmJpmfhSb64JAv/kzbSSz2LwAic\"",
    "mtime": "2026-07-09T19:46:30.972Z",
    "size": 1166,
    "path": "../public/_build/assets/transit-81KOEFnY.js.gz"
  },
  "/_build/assets/trash-2-eKau8bUg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"190-adw83CgZX29HMfJEVwxCAEfcvaM\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 400,
    "path": "../public/_build/assets/trash-2-eKau8bUg.js"
  },
  "/_build/assets/triangle-alert-DqC7VkMq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"151-lIEYPLbVjKE5i+sUzBDvPhNGfyI\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 337,
    "path": "../public/_build/assets/triangle-alert-DqC7VkMq.js"
  },
  "/_build/assets/truck-BIb1XJQQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1de-JA4d6A8H5tXmQASuVcm/S0pS3tU\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 478,
    "path": "../public/_build/assets/truck-BIb1XJQQ.js"
  },
  "/_build/assets/user-C-6caAK2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36a-z0yGnzJf7SURscN6z2xr4q9hkEM\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 874,
    "path": "../public/_build/assets/user-C-6caAK2.js"
  },
  "/_build/assets/utils-NWvMQ7Y7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6d9-U0xIBIJBXEeEPpJ7ikaEMrsjpbU\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 1753,
    "path": "../public/_build/assets/utils-NWvMQ7Y7.js"
  },
  "/_build/assets/utils-NWvMQ7Y7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"34c-wcg3ysJY/oA456d/+Tdsyqx/GfA\"",
    "mtime": "2026-07-09T19:46:30.974Z",
    "size": 844,
    "path": "../public/_build/assets/utils-NWvMQ7Y7.js.br"
  },
  "/_build/assets/utils-NWvMQ7Y7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3db-DbjE4gRGc3gLaTmBeXlQ5OzfuJU\"",
    "mtime": "2026-07-09T19:46:30.974Z",
    "size": 987,
    "path": "../public/_build/assets/utils-NWvMQ7Y7.js.gz"
  },
  "/_build/assets/web-Br4MVSxL.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"69ab-fyi6CimPVq57pnPX0+AUqFg7E/E\"",
    "mtime": "2026-07-09T19:46:30.718Z",
    "size": 27051,
    "path": "../public/_build/assets/web-Br4MVSxL.js"
  },
  "/_build/assets/web-Br4MVSxL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"254a-1tp7THwWOYZY2dI0bxcL9Xw0RXQ\"",
    "mtime": "2026-07-09T19:46:30.993Z",
    "size": 9546,
    "path": "../public/_build/assets/web-Br4MVSxL.js.br"
  },
  "/_build/assets/web-Br4MVSxL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"28fe-cCrQ/PprssKz1HhaSIPR49sa0BM\"",
    "mtime": "2026-07-09T19:46:30.974Z",
    "size": 10494,
    "path": "../public/_build/assets/web-Br4MVSxL.js.gz"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _peezj7 = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Vr(e, t) {
  const r = (e || "").split(";").filter((c) => typeof c == "string" && !!c.trim()), n = r.shift() || "", a = Wr(n), o = a.name;
  let i = a.value;
  try {
    i = (t == null ? void 0 : t.decode) === false ? i : ((t == null ? void 0 : t.decode) || decodeURIComponent)(i);
  } catch {
  }
  const u = { name: o, value: i };
  for (const c of r) {
    const l = c.split("="), p = (l.shift() || "").trimStart().toLowerCase(), d = l.join("=");
    switch (p) {
      case "expires": {
        u.expires = new Date(d);
        break;
      }
      case "max-age": {
        u.maxAge = Number.parseInt(d, 10);
        break;
      }
      case "secure": {
        u.secure = true;
        break;
      }
      case "httponly": {
        u.httpOnly = true;
        break;
      }
      case "samesite": {
        u.sameSite = d;
        break;
      }
      default:
        u[p] = d;
    }
  }
  return u;
}
function Wr(e) {
  let t = "", r = "";
  const n = e.split("=");
  return n.length > 1 ? (t = n.shift(), r = n.join("=")) : r = e, { name: t, value: r };
}
function Xr(e = {}) {
  let t, r = false;
  const n = (i) => {
    if (t && t !== i) throw new Error("Context conflict");
  };
  let a;
  if (e.asyncContext) {
    const i = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    i ? a = new i() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const o = () => {
    if (a) {
      const i = a.getStore();
      if (i !== void 0) return i;
    }
    return t;
  };
  return { use: () => {
    const i = o();
    if (i === void 0) throw new Error("Context is not available");
    return i;
  }, tryUse: () => o(), set: (i, u) => {
    u || n(i), t = i, r = true;
  }, unset: () => {
    t = void 0, r = false;
  }, call: (i, u) => {
    n(i), t = i;
    try {
      return a ? a.run(i, u) : u();
    } finally {
      r || (t = void 0);
    }
  }, async callAsync(i, u) {
    t = i;
    const c = () => {
      t = i;
    }, l = () => t === i ? c : void 0;
    qe$1.add(l);
    try {
      const p = a ? a.run(i, u) : u();
      return r || (t = void 0), await p;
    } finally {
      qe$1.delete(l);
    }
  } };
}
function Gr(e = {}) {
  const t = {};
  return { get(r, n = {}) {
    return t[r] || (t[r] = Xr({ ...e, ...n })), t[r];
  } };
}
const oe = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, He$1 = "__unctx__", Jr = oe[He$1] || (oe[He$1] = Gr()), Kr = (e, t = {}) => Jr.get(e, t), Be$1 = "__unctx_async_handlers__", qe$1 = oe[Be$1] || (oe[Be$1] = /* @__PURE__ */ new Set());
function Qr(e) {
  let t;
  const r = mt(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...n, body: e.node.req.body }) : new Request(r, { ...n, get body() {
    return t || (t = cn(e), t);
  } });
}
function Zr(e) {
  var _a2;
  return (_a2 = e.web) != null ? _a2 : e.web = { request: Qr(e), url: mt(e) }, e.web.request;
}
function en() {
  return dn();
}
const yt = /* @__PURE__ */ Symbol("$HTTPEvent");
function tn(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[yt]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function A(e) {
  return function(...t) {
    var _a2;
    let r = t[0];
    if (tn(r)) t[0] = r instanceof H3Event || r.__is_event__ ? r : r[yt];
    else {
      if (!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = en(), !r) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const mt = A(getRequestURL), rn = A(getRequestIP), ie$1 = A(setResponseStatus), Me$1 = A(getResponseStatus), nn = A(getResponseStatusText), se = A(getResponseHeaders), Ye$1 = A(getResponseHeader), sn = A(setResponseHeader), bt = A(appendResponseHeader), an = A(parseCookies), on = A(getCookie), un = A(setCookie), F = A(setHeader), cn = A(getRequestWebStream), ln = A(removeResponseHeader), fn = A(Zr);
function pn() {
  var _a2;
  return Kr("nitro-app", { asyncContext: !!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function dn() {
  return pn().use().event;
}
const de$1 = "Invariant Violation", { setPrototypeOf: hn = function(e, t) {
  return e.__proto__ = t, e;
} } = Object;
let Pe$1 = class Pe extends Error {
  constructor(t = de$1) {
    super(typeof t == "number" ? `${de$1}: ${t} (see https://github.com/apollographql/invariant-packages)` : t);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", de$1);
    hn(this, Pe.prototype);
  }
};
function gn(e, t) {
  if (!e) throw new Pe$1(t);
}
const he$1 = "solidFetchEvent";
function yn(e) {
  return { request: fn(e), response: vn(e), clientAddress: rn(e), locals: {}, nativeEvent: e };
}
function mn(e) {
  return { ...e };
}
function bn(e) {
  if (!e.context[he$1]) {
    const t = yn(e);
    e.context[he$1] = t;
  }
  return e.context[he$1];
}
function Ve$1(e, t) {
  for (const [r, n] of t.entries()) bt(e, r, n);
}
class wn {
  constructor(t) {
    __publicField$1(this, "event");
    this.event = t;
  }
  get(t) {
    const r = Ye$1(this.event, t);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, r) {
    return sn(this.event, t, r);
  }
  delete(t) {
    return ln(this.event, t);
  }
  append(t, r) {
    bt(this.event, t, r);
  }
  getSetCookie() {
    const t = Ye$1(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(se(this.event)).forEach(([r, n]) => t(Array.isArray(n) ? n.join(", ") : n, r, this));
  }
  entries() {
    return Object.entries(se(this.event)).map(([t, r]) => [t, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(se(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(se(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function vn(e) {
  return { get status() {
    return Me$1(e);
  }, set status(t) {
    ie$1(e, t);
  }, get statusText() {
    return nn(e);
  }, set statusText(t) {
    ie$1(e, Me$1(e), t);
  }, headers: new wn(e) };
}
const B$1 = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function An(e = {}) {
  const t = { options: e, rootNode: wt(), staticRoutesMap: {} }, r = (n) => e.strictTrailingSlash ? n : n.replace(/\/$/, "") || "/";
  if (e.routes) for (const n in e.routes) We$1(t, r(n), e.routes[n]);
  return { ctx: t, lookup: (n) => Sn(t, r(n)), insert: (n, a) => We$1(t, r(n), a), remove: (n) => En(t, r(n)) };
}
function Sn(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const n = t.split("/"), a = {};
  let o = false, i = null, u = e.rootNode, c = null;
  for (let l = 0; l < n.length; l++) {
    const p = n[l];
    u.wildcardChildNode !== null && (i = u.wildcardChildNode, c = n.slice(l).join("/"));
    const d = u.children.get(p);
    if (d === void 0) {
      if (u && u.placeholderChildren.length > 1) {
        const w = n.length - l;
        u = u.placeholderChildren.find((f) => f.maxDepth === w) || null;
      } else u = u.placeholderChildren[0] || null;
      if (!u) break;
      u.paramName && (a[u.paramName] = p), o = true;
    } else u = d;
  }
  return (u === null || u.data === null) && i !== null && (u = i, a[u.paramName || "_"] = c, o = true), u ? o ? { ...u.data, params: o ? a : void 0 } : u.data : null;
}
function We$1(e, t, r) {
  let n = true;
  const a = t.split("/");
  let o = e.rootNode, i = 0;
  const u = [o];
  for (const c of a) {
    let l;
    if (l = o.children.get(c)) o = l;
    else {
      const p = Rn(c);
      l = wt({ type: p, parent: o }), o.children.set(c, l), p === B$1.PLACEHOLDER ? (l.paramName = c === "*" ? `_${i++}` : c.slice(1), o.placeholderChildren.push(l), n = false) : p === B$1.WILDCARD && (o.wildcardChildNode = l, l.paramName = c.slice(3) || "_", n = false), u.push(l), o = l;
    }
  }
  for (const [c, l] of u.entries()) l.maxDepth = Math.max(u.length - c, l.maxDepth || 0);
  return o.data = r, n === true && (e.staticRoutesMap[t] = o), o;
}
function En(e, t) {
  let r = false;
  const n = t.split("/");
  let a = e.rootNode;
  for (const o of n) if (a = a.children.get(o), !a) return r;
  if (a.data) {
    const o = n.at(-1) || "";
    a.data = null, Object.keys(a.children).length === 0 && a.parent && (a.parent.children.delete(o), a.parent.wildcardChildNode = null, a.parent.placeholderChildren = []), r = true;
  }
  return r;
}
function wt(e = {}) {
  return { type: e.type || B$1.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Rn(e) {
  return e.startsWith("**") ? B$1.WILDCARD : e[0] === ":" || e === "*" ? B$1.PLACEHOLDER : B$1.NORMAL;
}
const vt = [{ page: true, path: "/admin", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/admin.tsx" }, { page: true, path: "/bultos", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/bultos.tsx" }, { page: true, path: "/callback", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/callback.tsx" }, { page: true, path: "/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/index.tsx" }, { page: true, path: "/inventory/expiry", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/expiry.tsx" }, { page: true, path: "/inventory/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/index.tsx" }, { page: true, path: "/inventory/receiving", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/receiving.tsx" }, { page: true, path: "/invoices/:id", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/[id].tsx" }, { page: true, path: "/invoices/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/index.tsx" }, { page: true, path: "/invoices/new", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/new.tsx" }, { page: true, path: "/invoices/offers", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/offers.tsx" }, { page: true, path: "/invoices/pos", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/pos.tsx" }, { page: true, path: "/loans", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/loans.tsx" }, { page: true, path: "/login", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/login.tsx" }, { page: true, path: "/ops/consolidate", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/consolidate.tsx" }, { page: true, path: "/ops/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/index.tsx" }, { page: true, path: "/ops/intake", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/intake.tsx" }, { page: true, path: "/ops/locations", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/locations.tsx" }, { page: true, path: "/ops/manifest", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/manifest.tsx" }, { page: true, path: "/ops/manifests", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/manifests.tsx" }, { page: true, path: "/ops/route", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/route.tsx" }, { page: true, path: "/ops/track", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/track.tsx" }, { page: true, path: "/ops/transit", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/transit.tsx" }, { page: true, path: "/tariffs/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/tariffs/index.tsx" }], xn = Pn(vt.filter((e) => e.page));
function Pn(e) {
  function t(r, n, a, o) {
    const i = Object.values(r).find((u) => a.startsWith(u.id + "/"));
    return i ? (t(i.children || (i.children = []), n, a.slice(i.id.length)), r) : (r.push({ ...n, id: a, path: a.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, n) => r.path.length - n.path.length).reduce((r, n) => t(r, n, n.path, n.path), []);
}
function kn(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
An({ routes: vt.reduce((e, t) => {
  if (!kn(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, a) => `**:${a}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) });
var In = " ";
const $n = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(In), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function zn(e, t) {
  let { tag: r, attrs: { key: n, ...a } = { key: void 0 }, children: o } = e;
  return $n[r]({ attrs: { ...a, nonce: t }, key: n, children: o });
}
function Cn(e, t, r, n = "default") {
  return lazy(async () => {
    var _a2;
    {
      const o = (await e.import())[n], u = (await ((_a2 = t.inputs) == null ? void 0 : _a2[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...u.map((p) => zn(p)), createComponent(o, l)] };
    }
  });
}
function At() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && Cn(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return xn.map(e);
}
let Xe$1;
const au = isServer ? () => getRequestEvent().routes : () => Xe$1 || (Xe$1 = At());
function On(e) {
  const t = on(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const n = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], a = r.error ? new Error(r.result) : r.result;
    return { input: n, url: r.url, pending: false, result: r.thrown ? void 0 : a, error: r.thrown ? a : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    un(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function Un(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: On(e) }, routes: At(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const jn = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Ln(e) {
  return e.status && jn.has(e.status) ? e.status : 302;
}
const Tn = {};
var St = ((e) => (e[e.AggregateError = 1] = "AggregateError", e[e.ArrowFunction = 2] = "ArrowFunction", e[e.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", e[e.ObjectAssign = 8] = "ObjectAssign", e[e.BigIntTypedArray = 16] = "BigIntTypedArray", e[e.RegExp = 32] = "RegExp", e))(St || {}), P$1 = Symbol.asyncIterator, Et = Symbol.hasInstance, q$1 = Symbol.isConcatSpreadable, k = Symbol.iterator, Rt = Symbol.match, xt = Symbol.matchAll, Pt = Symbol.replace, kt = Symbol.search, _t = Symbol.species, It = Symbol.split, $t = Symbol.toPrimitive, M = Symbol.toStringTag, zt = Symbol.unscopables, Nn = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, Ct = { [P$1]: 0, [Et]: 1, [q$1]: 2, [k]: 3, [Rt]: 4, [xt]: 5, [Pt]: 6, [kt]: 7, [_t]: 8, [It]: 9, [$t]: 10, [M]: 11, [zt]: 12 }, Dn = { 0: P$1, 1: Et, 2: q$1, 3: k, 4: Rt, 5: xt, 6: Pt, 7: kt, 8: _t, 9: It, 10: $t, 11: M, 12: zt }, Fn = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, s = void 0, Hn = { 2: true, 3: false, 1: s, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN }, Ot = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, Bn = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function g(e, t, r, n, a, o, i, u, c, l, p, d) {
  return { t: e, i: t, s: r, c: n, m: a, p: o, e: i, a: u, f: c, b: l, o: p, l: d };
}
function C$1(e) {
  return g(2, s, e, s, s, s, s, s, s, s, s, s);
}
var Ut = C$1(2), jt = C$1(3), qn = C$1(1), Mn = C$1(0), Yn = C$1(4), Vn = C$1(5), Wn = C$1(6), Xn = C$1(7);
function Gn(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return s;
  }
}
function R$1(e) {
  let t = "", r = 0, n;
  for (let a = 0, o = e.length; a < o; a++) n = Gn(e[a]), n && (t += e.slice(r, a) + n, r = a + 1);
  return r === 0 ? t = e : t += e.slice(r), t;
}
function Jn(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function O(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, Jn);
}
var X = "__SEROVAL_REFS__", ue$1 = "$R", ae = `self.${ue$1}`;
function Kn(e) {
  return e == null ? `${ae}=${ae}||[]` : `(${ae}=${ae}||{})["${R$1(e)}"]=[]`;
}
var Lt = /* @__PURE__ */ new Map(), H$1 = /* @__PURE__ */ new Map();
function Tt(e) {
  return Lt.has(e);
}
function Qn(e) {
  return H$1.has(e);
}
function Zn(e) {
  if (Tt(e)) return Lt.get(e);
  throw new _s(e);
}
function es(e) {
  if (Qn(e)) return H$1.get(e);
  throw new Is(e);
}
typeof globalThis < "u" ? Object.defineProperty(globalThis, X, { value: H$1, configurable: true, writable: false, enumerable: false }) : typeof self < "u" ? Object.defineProperty(self, X, { value: H$1, configurable: true, writable: false, enumerable: false }) : typeof global < "u" && Object.defineProperty(global, X, { value: H$1, configurable: true, writable: false, enumerable: false });
function ke$1(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function ts(e) {
  let t = Ot[ke$1(e)];
  return e.name !== t ? { name: e.name } : e.constructor.name !== t ? { name: e.constructor.name } : {};
}
function Nt(e, t) {
  let r = ts(e), n = Object.getOwnPropertyNames(e);
  for (let a = 0, o = n.length, i; a < o; a++) i = n[a], i !== "name" && i !== "message" && (i === "stack" ? t & 4 && (r = r || {}, r[i] = e[i]) : (r = r || {}, r[i] = e[i]));
  return r;
}
function Dt(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function rs(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return Vn;
    case Number.NEGATIVE_INFINITY:
      return Wn;
  }
  return e !== e ? Xn : Object.is(e, -0) ? Yn : g(0, s, e, s, s, s, s, s, s, s, s, s);
}
function Ft(e) {
  return g(1, s, R$1(e), s, s, s, s, s, s, s, s, s);
}
function ns(e) {
  return g(3, s, "" + e, s, s, s, s, s, s, s, s, s);
}
function ss(e) {
  return g(4, e, s, s, s, s, s, s, s, s, s, s);
}
function as(e, t) {
  let r = t.valueOf();
  return g(5, e, r !== r ? "" : t.toISOString(), s, s, s, s, s, s, s, s, s);
}
function os(e, t) {
  return g(6, e, s, R$1(t.source), t.flags, s, s, s, s, s, s, s);
}
function is(e, t) {
  return g(17, e, Ct[t], s, s, s, s, s, s, s, s, s);
}
function us(e, t) {
  return g(18, e, R$1(Zn(t)), s, s, s, s, s, s, s, s, s);
}
function Ht(e, t, r) {
  return g(25, e, r, R$1(t), s, s, s, s, s, s, s, s);
}
function cs(e, t, r) {
  return g(9, e, s, s, s, s, s, r, s, s, Dt(t), s);
}
function ls(e, t) {
  return g(21, e, s, s, s, s, s, s, t, s, s, s);
}
function fs(e, t, r) {
  return g(15, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.length);
}
function ps(e, t, r) {
  return g(16, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function ds(e, t, r) {
  return g(20, e, s, s, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function hs(e, t, r) {
  return g(13, e, ke$1(t), s, R$1(t.message), r, s, s, s, s, s, s);
}
function gs(e, t, r) {
  return g(14, e, ke$1(t), s, R$1(t.message), r, s, s, s, s, s, s);
}
function ys(e, t) {
  return g(7, e, s, s, s, s, s, t, s, s, s, s);
}
function ms(e, t) {
  return g(28, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function bs(e, t) {
  return g(30, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function ws(e, t, r) {
  return g(31, e, s, s, s, s, s, r, t, s, s, s);
}
function vs(e, t) {
  return g(32, e, s, s, s, s, s, s, t, s, s, s);
}
function As(e, t) {
  return g(33, e, s, s, s, s, s, s, t, s, s, s);
}
function Ss(e, t) {
  return g(34, e, s, s, s, s, s, s, t, s, s, s);
}
function Es(e, t, r, n) {
  return g(35, e, r, s, s, s, s, t, s, s, s, n);
}
var Rs = { parsing: 1, serialization: 2, deserialization: 3 };
function xs(e) {
  return `Seroval Error (step: ${Rs[e]})`;
}
var Ps = (e, t) => xs(e), Bt = class extends Error {
  constructor(t, r) {
    super(Ps(t)), this.cause = r;
  }
}, Ge$1 = class Ge extends Bt {
  constructor(e) {
    super("parsing", e);
  }
}, ks = class extends Bt {
  constructor(e) {
    super("deserialization", e);
  }
};
function _(e) {
  return `Seroval Error (specific: ${e})`;
}
var ce = class extends Error {
  constructor(t) {
    super(_(1)), this.value = t;
  }
}, L$1 = class L extends Error {
  constructor(t) {
    super(_(2));
  }
}, qt = class extends Error {
  constructor(e) {
    super(_(3));
  }
}, Z = class extends Error {
  constructor(t) {
    super(_(4));
  }
}, _s = class extends Error {
  constructor(e) {
    super(_(5)), this.value = e;
  }
}, Is = class extends Error {
  constructor(e) {
    super(_(6));
  }
}, $s = class extends Error {
  constructor(e) {
    super(_(7));
  }
}, I$1 = class I extends Error {
  constructor(t) {
    super(_(8));
  }
}, Mt = class extends Error {
  constructor(e) {
    super(_(9));
  }
}, zs = class {
  constructor(e, t) {
    this.value = e, this.replacement = t;
  }
}, le$1 = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((t, r) => {
    e.s = t, e.f = r;
  }), e;
}, Cs = (e, t) => {
  e.s(t), e.p.s = 1, e.p.v = t;
}, Os = (e, t) => {
  e.f(t), e.p.s = 2, e.p.v = t;
}, Us = le$1.toString(), js = Cs.toString(), Ls = Os.toString(), Yt = () => {
  let e = [], t = [], r = true, n = false, a = 0, o = (c, l, p) => {
    for (p = 0; p < a; p++) t[p] && t[p][l](c);
  }, i = (c, l, p, d) => {
    for (l = 0, p = e.length; l < p; l++) d = e[l], !r && l === p - 1 ? c[n ? "return" : "throw"](d) : c.next(d);
  }, u = (c, l) => (r && (l = a++, t[l] = c), i(c), () => {
    r && (t[l] = t[a], t[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (c) => u(c), next: (c) => {
    r && (e.push(c), o(c, "next"));
  }, throw: (c) => {
    r && (e.push(c), o(c, "throw"), r = false, n = false, t.length = 0);
  }, return: (c) => {
    r && (e.push(c), o(c, "return"), r = false, n = true, t.length = 0);
  } };
}, Ts = Yt.toString(), Vt = (e) => (t) => () => {
  let r = 0, n = { [e]: () => n, next: () => {
    if (r > t.d) return { done: true, value: void 0 };
    let a = r++, o = t.v[a];
    if (a === t.t) throw o;
    return { done: a === t.d, value: o };
  } };
  return n;
}, Ns = Vt.toString(), Wt = (e, t) => (r) => () => {
  let n = 0, a = -1, o = false, i = [], u = [], c = (p = 0, d = u.length) => {
    for (; p < d; p++) u[p].s({ done: true, value: void 0 });
  };
  r.on({ next: (p) => {
    let d = u.shift();
    d && d.s({ done: false, value: p }), i.push(p);
  }, throw: (p) => {
    let d = u.shift();
    d && d.f(p), c(), a = i.length, o = true, i.push(p);
  }, return: (p) => {
    let d = u.shift();
    d && d.s({ done: true, value: p }), c(), a = i.length, i.push(p);
  } });
  let l = { [e]: () => l, next: () => {
    if (a === -1) {
      let w = n++;
      if (w >= i.length) {
        let f = t();
        return u.push(f), f.p;
      }
      return { done: false, value: i[w] };
    }
    if (n > a) return { done: true, value: void 0 };
    let p = n++, d = i[p];
    if (p !== a) return { done: false, value: d };
    if (o) throw d;
    return { done: true, value: d };
  } };
  return l;
}, Ds = Wt.toString(), Xt = (e) => {
  let t = atob(e), r = t.length, n = new Uint8Array(r);
  for (let a = 0; a < r; a++) n[a] = t.charCodeAt(a);
  return n.buffer;
}, Fs = Xt.toString();
function Hs(e) {
  return "__SEROVAL_SEQUENCE__" in e;
}
function Gt(e, t, r) {
  return { __SEROVAL_SEQUENCE__: true, v: e, t, d: r };
}
function Bs(e) {
  let t = [], r = -1, n = -1, a = e[k]();
  for (; ; ) try {
    let o = a.next();
    if (t.push(o.value), o.done) {
      n = t.length - 1;
      break;
    }
  } catch (o) {
    r = t.length, t.push(o);
  }
  return Gt(t, r, n);
}
var qs = Vt(k);
function Ms(e) {
  return qs(e);
}
var Ys = {}, Vs = {}, Ws = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Xs = { 0: "[]", 1: Us, 2: js, 3: Ls, 4: Ts, 5: Fs };
function Gs(e) {
  return "__SEROVAL_STREAM__" in e;
}
function ee() {
  return Yt();
}
function Js(e) {
  let t = ee(), r = e[P$1]();
  async function n() {
    try {
      let a = await r.next();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Ks = Wt(P$1, le$1);
function Qs(e) {
  return Ks(e);
}
function Zs(e, t) {
  return { plugins: t.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (t.disabledFeatures || 0), refs: t.refs || /* @__PURE__ */ new Map(), depthLimit: t.depthLimit || 1e3 };
}
function ea(e, t) {
  e.marked.add(t);
}
function Jt(e, t) {
  let r = e.refs.size;
  return e.refs.set(t, r), r;
}
function fe$1(e, t) {
  let r = e.refs.get(t);
  return r != null ? (ea(e, r), { type: 1, value: ss(r) }) : { type: 0, value: Jt(e, t) };
}
function _e$1(e, t) {
  let r = fe$1(e, t);
  return r.type === 1 ? r : Tt(t) ? { type: 2, value: us(r.value, t) } : r;
}
function U$1(e, t) {
  let r = _e$1(e, t);
  if (r.type !== 0) return r.value;
  if (t in Ct) return is(r.value, t);
  throw new ce(t);
}
function N$1(e, t) {
  let r = fe$1(e, Ws[t]);
  return r.type === 1 ? r.value : g(26, r.value, t, s, s, s, s, s, s, s, s, s);
}
function ta(e) {
  let t = fe$1(e, Ys);
  return t.type === 1 ? t.value : g(27, t.value, s, s, s, s, s, s, U$1(e, k), s, s, s);
}
function ra(e) {
  let t = fe$1(e, Vs);
  return t.type === 1 ? t.value : g(29, t.value, s, s, s, s, s, [N$1(e, 1), U$1(e, P$1)], s, s, s, s);
}
function na(e, t, r, n) {
  return g(r ? 11 : 10, e, s, s, s, n, s, s, s, s, Dt(t), s);
}
function sa(e, t, r, n) {
  return g(8, t, s, s, s, s, { k: r, v: n }, s, N$1(e, 0), s, s, s);
}
function aa(e, t, r) {
  return g(22, t, r, s, s, s, s, s, N$1(e, 1), s, s, s);
}
function oa(e, t, r) {
  let n = new Uint8Array(r), a = "";
  for (let o = 0, i = n.length; o < i; o++) a += String.fromCharCode(n[o]);
  return g(19, t, R$1(btoa(a)), s, s, s, s, s, N$1(e, 5), s, s, s);
}
var ia = ((e) => (e[e.Vanilla = 1] = "Vanilla", e[e.Cross = 2] = "Cross", e))(ia || {});
function Kt(e, t) {
  for (let r = 0, n = t.length; r < n; r++) {
    let a = t[r];
    e.has(a) || (e.add(a), a.extends && Kt(e, a.extends));
  }
}
function Ie$1(e) {
  if (e) {
    let t = /* @__PURE__ */ new Set();
    return Kt(t, e), [...t];
  }
}
function ua(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new $s(e);
  }
}
var ca = 1e6, la = 1e4, fa = 2e4;
function Qt(e, t) {
  switch (t) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var pa = 1e3;
function da(e, t) {
  var r;
  let n = t.refs || /* @__PURE__ */ new Map();
  return "types" in n || Object.assign(n, { types: /* @__PURE__ */ new Map() }), { mode: e, plugins: t.plugins, refs: n, features: (r = t.features) != null ? r : 63 ^ (t.disabledFeatures || 0), depthLimit: t.depthLimit || pa };
}
function ha(e) {
  return { mode: 1, base: da(1, e), child: s, state: { marked: new Set(e.markedRefs) } };
}
var ga = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  deserialize(e) {
    return m$1(this._p, this.depth, e);
  }
};
function Zt(e, t) {
  if (t < 0 || !Number.isFinite(t) || !Number.isInteger(t)) throw new I$1({ t: 4, i: t });
  if (e.refs.has(t)) throw new Error("Conflicted ref id: " + t);
}
function ya(e, t, r) {
  return Zt(e.base, t), e.state.marked.has(t) && e.base.refs.set(t, r), r;
}
function ma(e, t, r) {
  return Zt(e.base, t), e.base.refs.set(t, r), r;
}
function b$1(e, t, r) {
  return e.mode === 1 ? ya(e, t, r) : ma(e, t, r);
}
function Se$1(e, t, r) {
  if (Object.hasOwn(t, r)) return t[r];
  throw new I$1(e);
}
function ba(e, t) {
  return b$1(e, t.i, es(O(t.s)));
}
function wa(e, t, r) {
  let n = r.a, a = n.length, o = b$1(e, r.i, new Array(a));
  for (let i = 0, u; i < a; i++) u = n[i], u && (o[i] = m$1(e, t, u));
  return Qt(o, r.o), o;
}
function va(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function Aa(e) {
  switch (e) {
    case P$1:
    case q$1:
    case M:
    case k:
      return true;
    default:
      return false;
  }
}
function Je$1(e, t, r) {
  va(t) ? e[t] = r : Object.defineProperty(e, t, { value: r, configurable: true, enumerable: true, writable: true });
}
function Sa(e, t, r, n, a) {
  if (typeof n == "string") Je$1(r, O(n), m$1(e, t, a));
  else {
    let o = m$1(e, t, n);
    switch (typeof o) {
      case "string":
        Je$1(r, o, m$1(e, t, a));
        break;
      case "symbol":
        Aa(o) && (r[o] = m$1(e, t, a));
        break;
      default:
        throw new I$1(n);
    }
  }
}
function er(e, t, r) {
  e.base.refs.types.set(t, r);
}
function te(e, t, r, n) {
  if (e.base.refs.types.get(r) !== n) throw new I$1(t);
}
function tr(e, t, r, n) {
  let a = r.k;
  if (a.length > 0) for (let o = 0, i = r.v, u = a.length; o < u; o++) Sa(e, t, n, a[o], i[o]);
  return n;
}
function Ea(e, t, r) {
  let n = b$1(e, r.i, r.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return tr(e, t, r.p, n), Qt(n, r.o), n;
}
function Ra(e, t) {
  return b$1(e, t.i, new Date(t.s));
}
function xa(e, t) {
  if (e.base.features & 32) {
    let r = O(t.c);
    if (r.length > fa) throw new I$1(t);
    return b$1(e, t.i, new RegExp(r, t.m));
  }
  throw new L$1(t);
}
function Pa(e, t, r) {
  let n = b$1(e, r.i, /* @__PURE__ */ new Set());
  for (let a = 0, o = r.a, i = o.length; a < i; a++) n.add(m$1(e, t, o[a]));
  return n;
}
function ka(e, t, r) {
  let n = b$1(e, r.i, /* @__PURE__ */ new Map());
  for (let a = 0, o = r.e.k, i = r.e.v, u = o.length; a < u; a++) n.set(m$1(e, t, o[a]), m$1(e, t, i[a]));
  return n;
}
function _a(e, t) {
  if (t.s.length > ca) throw new I$1(t);
  return b$1(e, t.i, Xt(O(t.s)));
}
function Ia(e, t, r) {
  var n;
  let a = ua(r.c), o = m$1(e, t, r.f), i = (n = r.b) != null ? n : 0;
  if (i < 0 || i > o.byteLength) throw new I$1(r);
  return b$1(e, r.i, new a(o, i, r.l));
}
function $a(e, t, r) {
  var n;
  let a = m$1(e, t, r.f), o = (n = r.b) != null ? n : 0;
  if (o < 0 || o > a.byteLength) throw new I$1(r);
  return b$1(e, r.i, new DataView(a, o, r.l));
}
function rr(e, t, r, n) {
  if (r.p) {
    let a = tr(e, t, r.p, {});
    Object.defineProperties(n, Object.getOwnPropertyDescriptors(a));
  }
  return n;
}
function za(e, t, r) {
  let n = b$1(e, r.i, new AggregateError([], O(r.m)));
  return rr(e, t, r, n);
}
function Ca(e, t, r) {
  let n = Se$1(r, Bn, r.s), a = b$1(e, r.i, new n(O(r.m)));
  return rr(e, t, r, a);
}
function Oa(e, t, r) {
  let n = le$1(), a = b$1(e, r.i, n.p), o = m$1(e, t, r.f);
  return r.s ? n.s(o) : n.f(o), a;
}
function Ua(e, t, r) {
  return b$1(e, r.i, Object(m$1(e, t, r.f)));
}
function ja(e, t, r) {
  let n = e.base.plugins;
  if (n) {
    let a = O(r.c);
    for (let o = 0, i = n.length; o < i; o++) {
      let u = n[o];
      if (u.tag === a) return b$1(e, r.i, u.deserialize(r.s, new ga(e, t), { id: r.i }));
    }
  }
  throw new qt(r.c);
}
function La(e, t) {
  let r = b$1(e, t.i, b$1(e, t.s, le$1()).p);
  return er(e, t.s, 22), r;
}
function Ta(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return te(e, r, r.i, 22), n.s(m$1(e, t, r.a[1])), s;
  throw new Z("Promise");
}
function Na(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return te(e, r, r.i, 22), n.f(m$1(e, t, r.a[1])), s;
  throw new Z("Promise");
}
function Da(e, t, r) {
  m$1(e, t, r.a[0]);
  let n = m$1(e, t, r.a[1]);
  return Ms(n);
}
function Fa(e, t, r) {
  m$1(e, t, r.a[0]);
  let n = m$1(e, t, r.a[1]);
  return Qs(n);
}
function Ha(e, t, r) {
  let n = b$1(e, r.i, ee());
  er(e, r.i, 31);
  let a = r.a, o = a.length;
  if (o) for (let i = 0; i < o; i++) m$1(e, t, a[i]);
  return n;
}
function Ba(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return te(e, r, r.i, 31), n.next(m$1(e, t, r.f)), s;
  throw new Z("Stream");
}
function qa(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return te(e, r, r.i, 31), n.throw(m$1(e, t, r.f)), s;
  throw new Z("Stream");
}
function Ma(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return te(e, r, r.i, 31), n.return(m$1(e, t, r.f)), s;
  throw new Z("Stream");
}
function Ya(e, t, r) {
  return m$1(e, t, r.f), s;
}
function Va(e, t, r) {
  return m$1(e, t, r.a[1]), s;
}
function Wa(e, t, r) {
  let n = b$1(e, r.i, Gt([], r.s, r.l));
  for (let a = 0, o = r.a.length; a < o; a++) n.v[a] = m$1(e, t, r.a[a]);
  return n;
}
function m$1(e, t, r) {
  if (t > e.base.depthLimit) throw new Mt(e.base.depthLimit);
  switch (t += 1, r.t) {
    case 2:
      return Se$1(r, Hn, r.s);
    case 0:
      return Number(r.s);
    case 1:
      return O(String(r.s));
    case 3:
      if (String(r.s).length > la) throw new I$1(r);
      return BigInt(r.s);
    case 4:
      return e.base.refs.get(r.i);
    case 18:
      return ba(e, r);
    case 9:
      return wa(e, t, r);
    case 10:
    case 11:
      return Ea(e, t, r);
    case 5:
      return Ra(e, r);
    case 6:
      return xa(e, r);
    case 7:
      return Pa(e, t, r);
    case 8:
      return ka(e, t, r);
    case 19:
      return _a(e, r);
    case 16:
    case 15:
      return Ia(e, t, r);
    case 20:
      return $a(e, t, r);
    case 14:
      return za(e, t, r);
    case 13:
      return Ca(e, t, r);
    case 12:
      return Oa(e, t, r);
    case 17:
      return Se$1(r, Dn, r.s);
    case 21:
      return Ua(e, t, r);
    case 25:
      return ja(e, t, r);
    case 22:
      return La(e, r);
    case 23:
      return Ta(e, t, r);
    case 24:
      return Na(e, t, r);
    case 28:
      return Da(e, t, r);
    case 30:
      return Fa(e, t, r);
    case 31:
      return Ha(e, t, r);
    case 32:
      return Ba(e, t, r);
    case 33:
      return qa(e, t, r);
    case 34:
      return Ma(e, t, r);
    case 27:
      return Ya(e, t, r);
    case 29:
      return Va(e, t, r);
    case 35:
      return Wa(e, t, r);
    default:
      throw new L$1(r);
  }
}
function Xa(e, t) {
  try {
    return m$1(e, 0, t);
  } catch (r) {
    throw new ks(r);
  }
}
var Ga = () => T, Ja = Ga.toString(), nr = /=>/.test(Ja);
function sr(e, t) {
  return nr ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (t.startsWith("{") ? "(" + t + ")" : t) : "function(" + e.join(",") + "){return " + t + "}";
}
function Ka(e, t) {
  return nr ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + t + "}" : "function(" + e.join(",") + "){" + t + "}";
}
var ar = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", Ke$1 = ar.length, or = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Qe$1 = or.length;
function Qa(e) {
  let t = e % Ke$1, r = ar[t];
  for (e = (e - t) / Ke$1; e > 0; ) t = e % Qe$1, r += or[t], e = (e - t) / Qe$1;
  return r;
}
var Za = /^[$A-Z_][0-9A-Z_$]*$/i;
function ir(e) {
  let t = e[0];
  return (t === "$" || t === "_" || t >= "A" && t <= "Z" || t >= "a" && t <= "z") && Za.test(e);
}
function G(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function eo(e) {
  let t = [], r = e[0];
  for (let n = 1, a = e.length, o, i = r; n < a; n++) o = e[n], o.t === 0 && o.v === i.v ? r = { t: 0, s: o.s, k: s, v: G(r) } : o.t === 2 && o.s === i.s ? r = { t: 2, s: G(r), k: o.k, v: o.v } : o.t === 1 && o.s === i.s ? r = { t: 1, s: G(r), k: s, v: o.v } : o.t === 3 && o.s === i.s ? r = { t: 3, s: G(r), k: o.k, v: s } : (t.push(r), r = o), i = o;
  return t.push(r), t;
}
function ur(e) {
  if (e.length) {
    let t = "", r = eo(e);
    for (let n = 0, a = r.length; n < a; n++) t += G(r[n]) + ",";
    return t;
  }
  return s;
}
var to = "Object.create(null)", ro = "new Set", no = "new Map", so = "Promise.resolve", ao = "Promise.reject", oo = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: s };
function io(e, t) {
  return { mode: e, plugins: t.plugins, features: t.features, marked: new Set(t.markedRefs), stack: [], flags: [], assignments: [] };
}
function uo(e) {
  return { mode: 2, base: io(2, e), state: e, child: s };
}
var co = class {
  constructor(e) {
    this._p = e;
  }
  serialize(e) {
    return h(this._p, e);
  }
};
function lo(e, t) {
  let r = e.valid.get(t);
  r == null && (r = e.valid.size, e.valid.set(t, r));
  let n = e.vars[r];
  return n == null && (n = Qa(r), e.vars[r] = n), n;
}
function fo(e) {
  return ue$1 + "[" + e + "]";
}
function y(e, t) {
  return e.mode === 1 ? lo(e.state, t) : fo(t);
}
function S$1(e, t) {
  e.marked.add(t);
}
function Ee$1(e, t) {
  return e.marked.has(t);
}
function $e$1(e, t, r) {
  t !== 0 && (S$1(e.base, r), e.base.flags.push({ type: t, value: y(e, r) }));
}
function po(e) {
  let t = "";
  for (let r = 0, n = e.flags, a = n.length; r < a; r++) {
    let o = n[r];
    t += oo[o.type] + "(" + o.value + "),";
  }
  return t;
}
function ho(e) {
  let t = ur(e.assignments), r = po(e);
  return t ? r ? t + r : t : r;
}
function ze$1(e, t, r) {
  e.assignments.push({ t: 0, s: t, k: s, v: r });
}
function go(e, t, r) {
  e.base.assignments.push({ t: 1, s: y(e, t), k: s, v: r });
}
function W(e, t, r, n) {
  e.base.assignments.push({ t: 2, s: y(e, t), k: r, v: n });
}
function Ze(e, t, r) {
  e.base.assignments.push({ t: 3, s: y(e, t), k: r, v: s });
}
function K(e, t, r, n) {
  ze$1(e.base, y(e, t) + "[" + r + "]", n);
}
function Re$1(e, t, r, n) {
  ze$1(e.base, y(e, t) + "." + r, n);
}
function yo(e, t, r, n) {
  ze$1(e.base, y(e, t) + ".v[" + r + "]", n);
}
function x$1(e, t) {
  return t.t === 4 && e.stack.includes(t.i);
}
function V(e, t, r) {
  return e.mode === 1 && !Ee$1(e.base, t) ? r : y(e, t) + "=" + r;
}
function mo(e) {
  return X + '.get("' + e.s + '")';
}
function et(e, t, r, n) {
  return r ? x$1(e.base, r) ? (S$1(e.base, t), K(e, t, n, y(e, r.i)), "") : h(e, r) : "";
}
function bo(e, t) {
  let r = t.i, n = t.a, a = n.length;
  if (a > 0) {
    e.base.stack.push(r);
    let o = et(e, r, n[0], 0), i = o === "";
    for (let u = 1, c; u < a; u++) c = et(e, r, n[u], u), o += "," + c, i = c === "";
    return e.base.stack.pop(), $e$1(e, t.o, t.i), "[" + o + (i ? ",]" : "]");
  }
  return "[]";
}
function tt(e, t, r, n) {
  if (typeof r == "string") {
    let a = Number(r), o = a >= 0 && a.toString() === r || ir(r);
    if (x$1(e.base, n)) {
      let i = y(e, n.i);
      return S$1(e.base, t.i), o && a !== a ? Re$1(e, t.i, r, i) : K(e, t.i, o ? r : '"' + r + '"', i), "";
    }
    return (o ? r : '"' + r + '"') + ":" + h(e, n);
  }
  return "[" + h(e, r) + "]:" + h(e, n);
}
function cr(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let o = r.v;
    e.base.stack.push(t.i);
    let i = tt(e, t, n[0], o[0]);
    for (let u = 1, c = i; u < a; u++) c = tt(e, t, n[u], o[u]), i += (c && i && ",") + c;
    return e.base.stack.pop(), "{" + i + "}";
  }
  return "{}";
}
function wo(e, t) {
  return $e$1(e, t.o, t.i), cr(e, t, t.p);
}
function vo(e, t, r, n) {
  let a = cr(e, t, r);
  return a !== "{}" ? "Object.assign(" + n + "," + a + ")" : n;
}
function Ao(e, t, r, n, a) {
  let o = e.base, i = h(e, a), u = Number(n), c = u >= 0 && u.toString() === n || ir(n);
  if (x$1(o, a)) c && u !== u ? Re$1(e, t.i, n, i) : K(e, t.i, c ? n : '"' + n + '"', i);
  else {
    let l = o.assignments;
    o.assignments = r, c && u !== u ? Re$1(e, t.i, n, i) : K(e, t.i, c ? n : '"' + n + '"', i), o.assignments = l;
  }
}
function So(e, t, r, n, a) {
  if (typeof n == "string") Ao(e, t, r, n, a);
  else {
    let o = e.base, i = o.stack;
    o.stack = [];
    let u = h(e, a);
    o.stack = i;
    let c = o.assignments;
    o.assignments = r, K(e, t.i, h(e, n), u), o.assignments = c;
  }
}
function Eo(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let o = [], i = r.v;
    e.base.stack.push(t.i);
    for (let u = 0; u < a; u++) So(e, t, o, n[u], i[u]);
    return e.base.stack.pop(), ur(o);
  }
  return s;
}
function Ce$1(e, t, r) {
  if (t.p) {
    let n = e.base;
    if (n.features & 8) r = vo(e, t, t.p, r);
    else {
      S$1(n, t.i);
      let a = Eo(e, t, t.p);
      if (a) return "(" + V(e, t.i, r) + "," + a + y(e, t.i) + ")";
    }
  }
  return r;
}
function Ro(e, t) {
  return $e$1(e, t.o, t.i), Ce$1(e, t, to);
}
function xo(e) {
  return 'new Date("' + e.s + '")';
}
function Po(e, t) {
  if (e.base.features & 32) return "/" + t.c + "/" + t.m;
  throw new L$1(t);
}
function rt(e, t, r) {
  let n = e.base;
  return x$1(n, r) ? (S$1(n, t), go(e, t, y(e, r.i)), "") : h(e, r);
}
function ko(e, t) {
  let r = ro, n = t.a, a = n.length, o = t.i;
  if (a > 0) {
    e.base.stack.push(o);
    let i = rt(e, o, n[0]);
    for (let u = 1, c = i; u < a; u++) c = rt(e, o, n[u]), i += (c && i && ",") + c;
    e.base.stack.pop(), i && (r += "([" + i + "])");
  }
  return r;
}
function nt$1(e, t, r, n, a) {
  let o = e.base;
  if (x$1(o, r)) {
    let i = y(e, r.i);
    if (S$1(o, t), x$1(o, n)) {
      let c = y(e, n.i);
      return W(e, t, i, c), "";
    }
    if (n.t !== 4 && n.i != null && Ee$1(o, n.i)) {
      let c = "(" + h(e, n) + ",[" + a + "," + a + "])";
      return W(e, t, i, y(e, n.i)), Ze(e, t, a), c;
    }
    let u = o.stack;
    return o.stack = [], W(e, t, i, h(e, n)), o.stack = u, "";
  }
  if (x$1(o, n)) {
    let i = y(e, n.i);
    if (S$1(o, t), r.t !== 4 && r.i != null && Ee$1(o, r.i)) {
      let c = "(" + h(e, r) + ",[" + a + "," + a + "])";
      return W(e, t, y(e, r.i), i), Ze(e, t, a), c;
    }
    let u = o.stack;
    return o.stack = [], W(e, t, h(e, r), i), o.stack = u, "";
  }
  return "[" + h(e, r) + "," + h(e, n) + "]";
}
function _o(e, t) {
  let r = no, n = t.e.k, a = n.length, o = t.i, i = t.f, u = y(e, i.i), c = e.base;
  if (a > 0) {
    let l = t.e.v;
    c.stack.push(o);
    let p = nt$1(e, o, n[0], l[0], u);
    for (let d = 1, w = p; d < a; d++) w = nt$1(e, o, n[d], l[d], u), p += (w && p && ",") + w;
    c.stack.pop(), p && (r += "([" + p + "])");
  }
  return i.t === 26 && (S$1(c, i.i), r = "(" + h(e, i) + "," + r + ")"), r;
}
function Io(e, t) {
  return D$1(e, t.f) + '("' + t.s + '")';
}
function $o(e, t) {
  return "new " + t.c + "(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function zo(e, t) {
  return "new DataView(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function Co(e, t) {
  let r = t.i;
  e.base.stack.push(r);
  let n = Ce$1(e, t, 'new AggregateError([],"' + t.m + '")');
  return e.base.stack.pop(), n;
}
function Oo(e, t) {
  return Ce$1(e, t, "new " + Ot[t.s] + '("' + t.m + '")');
}
function Uo(e, t) {
  let r, n = t.f, a = t.i, o = t.s ? so : ao, i = e.base;
  if (x$1(i, n)) {
    let u = y(e, n.i);
    r = o + (t.s ? "().then(" + sr([], u) + ")" : "().catch(" + Ka([], "throw " + u) + ")");
  } else {
    i.stack.push(a);
    let u = h(e, n);
    i.stack.pop(), r = o + "(" + u + ")";
  }
  return r;
}
function jo(e, t) {
  return "Object(" + h(e, t.f) + ")";
}
function D$1(e, t) {
  let r = h(e, t);
  return t.t === 4 ? r : "(" + r + ")";
}
function Lo(e, t) {
  if (e.mode === 1) throw new L$1(t);
  return "(" + V(e, t.s, D$1(e, t.f) + "()") + ").p";
}
function To(e, t) {
  if (e.mode === 1) throw new L$1(t);
  return D$1(e, t.a[0]) + "(" + y(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function No(e, t) {
  if (e.mode === 1) throw new L$1(t);
  return D$1(e, t.a[0]) + "(" + y(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Do(e, t) {
  let r = e.base.plugins;
  if (r) for (let n = 0, a = r.length; n < a; n++) {
    let o = r[n];
    if (o.tag === t.c) return e.child == null && (e.child = new co(e)), o.serialize(t.s, e.child, { id: t.i });
  }
  throw new qt(t.c);
}
function Fo(e, t) {
  let r = "", n = false;
  return t.f.t !== 4 && (S$1(e.base, t.f.i), r = "(" + h(e, t.f) + ",", n = true), r += V(e, t.i, "(" + Ns + ")(" + y(e, t.f.i) + ")"), n && (r += ")"), r;
}
function Ho(e, t) {
  return D$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Bo(e, t) {
  let r = t.a[0], n = t.a[1], a = e.base, o = "";
  r.t !== 4 && (S$1(a, r.i), o += "(" + h(e, r)), n.t !== 4 && (S$1(a, n.i), o += (o ? "," : "(") + h(e, n)), o && (o += ",");
  let i = V(e, t.i, "(" + Ds + ")(" + y(e, n.i) + "," + y(e, r.i) + ")");
  return o ? o + i + ")" : i;
}
function qo(e, t) {
  return D$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Mo(e, t) {
  let r = V(e, t.i, D$1(e, t.f) + "()"), n = t.a.length;
  if (n) {
    let a = h(e, t.a[0]);
    for (let o = 1; o < n; o++) a += "," + h(e, t.a[o]);
    return "(" + r + "," + a + "," + y(e, t.i) + ")";
  }
  return r;
}
function Yo(e, t) {
  return y(e, t.i) + ".next(" + h(e, t.f) + ")";
}
function Vo(e, t) {
  return y(e, t.i) + ".throw(" + h(e, t.f) + ")";
}
function Wo(e, t) {
  return y(e, t.i) + ".return(" + h(e, t.f) + ")";
}
function st(e, t, r, n) {
  let a = e.base;
  return x$1(a, n) ? (S$1(a, t), yo(e, t, r, y(e, n.i)), "") : h(e, n);
}
function Xo(e, t) {
  let r = t.a, n = r.length, a = t.i;
  if (n > 0) {
    e.base.stack.push(a);
    let o = st(e, a, 0, r[0]);
    for (let i = 1, u = o; i < n; i++) u = st(e, a, i, r[i]), o += (u && o && ",") + u;
    if (e.base.stack.pop(), o) return "{__SEROVAL_SEQUENCE__:!0,v:[" + o + "],t:" + t.s + ",d:" + t.l + "}";
  }
  return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function Go(e, t) {
  switch (t.t) {
    case 17:
      return Nn[t.s];
    case 18:
      return mo(t);
    case 9:
      return bo(e, t);
    case 10:
      return wo(e, t);
    case 11:
      return Ro(e, t);
    case 5:
      return xo(t);
    case 6:
      return Po(e, t);
    case 7:
      return ko(e, t);
    case 8:
      return _o(e, t);
    case 19:
      return Io(e, t);
    case 16:
    case 15:
      return $o(e, t);
    case 20:
      return zo(e, t);
    case 14:
      return Co(e, t);
    case 13:
      return Oo(e, t);
    case 12:
      return Uo(e, t);
    case 21:
      return jo(e, t);
    case 22:
      return Lo(e, t);
    case 25:
      return Do(e, t);
    case 26:
      return Xs[t.s];
    case 35:
      return Xo(e, t);
    default:
      throw new L$1(t);
  }
}
function h(e, t) {
  switch (t.t) {
    case 2:
      return Fn[t.s];
    case 0:
      return "" + t.s;
    case 1:
      return '"' + t.s + '"';
    case 3:
      return t.s + "n";
    case 4:
      return y(e, t.i);
    case 23:
      return To(e, t);
    case 24:
      return No(e, t);
    case 27:
      return Fo(e, t);
    case 28:
      return Ho(e, t);
    case 29:
      return Bo(e, t);
    case 30:
      return qo(e, t);
    case 31:
      return Mo(e, t);
    case 32:
      return Yo(e, t);
    case 33:
      return Vo(e, t);
    case 34:
      return Wo(e, t);
    default:
      return V(e, t.i, Go(e, t));
  }
}
function Jo(e, t) {
  let r = h(e, t), n = t.i;
  if (n == null) return r;
  let a = ho(e.base), o = y(e, n), i = e.state.scopeId, u = i == null ? "" : ue$1, c = a ? "(" + r + "," + a + o + ")" : r;
  if (u === "") return t.t === 10 && !a ? "(" + c + ")" : c;
  let l = i == null ? "()" : "(" + ue$1 + '["' + R$1(i) + '"])';
  return "(" + sr([u], c) + ")" + l;
}
var Ko = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return v(this._p, this.depth, e);
  }
}, Qo = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return v(this._p, this.depth, e);
  }
  parseWithError(e) {
    return j(this._p, this.depth, e);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Le$1(this._p);
  }
  popPendingState() {
    Q(this._p);
  }
  onParse(e) {
    Y(this._p, e);
  }
  onError(e) {
    Ue$1(this._p, e);
  }
};
function Zo(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function lr(e) {
  return { type: 2, base: Zs(2, e), state: Zo(e) };
}
function ei(e, t, r) {
  let n = [];
  for (let a = 0, o = r.length; a < o; a++) a in r ? n[a] = v(e, t, r[a]) : n[a] = 0;
  return n;
}
function ti(e, t, r, n) {
  return cs(r, n, ei(e, t, n));
}
function Oe$1(e, t, r) {
  let n = Object.entries(r), a = [], o = [];
  for (let i = 0, u = n.length; i < u; i++) a.push(R$1(n[i][0])), o.push(v(e, t, n[i][1]));
  return k in r && (a.push(U$1(e.base, k)), o.push(ms(ta(e.base), v(e, t, Bs(r))))), P$1 in r && (a.push(U$1(e.base, P$1)), o.push(bs(ra(e.base), v(e, t, e.type === 1 ? ee() : Js(r))))), M in r && (a.push(U$1(e.base, M)), o.push(Ft(r[M]))), q$1 in r && (a.push(U$1(e.base, q$1)), o.push(r[q$1] ? Ut : jt)), { k: a, v: o };
}
function ge$1(e, t, r, n, a) {
  return na(r, n, a, Oe$1(e, t, n));
}
function ri(e, t, r, n) {
  return ls(r, v(e, t, n.valueOf()));
}
function ni(e, t, r, n) {
  return fs(r, n, v(e, t, n.buffer));
}
function si(e, t, r, n) {
  return ps(r, n, v(e, t, n.buffer));
}
function ai(e, t, r, n) {
  return ds(r, n, v(e, t, n.buffer));
}
function at(e, t, r, n) {
  let a = Nt(n, e.base.features);
  return hs(r, n, a ? Oe$1(e, t, a) : s);
}
function oi(e, t, r, n) {
  let a = Nt(n, e.base.features);
  return gs(r, n, a ? Oe$1(e, t, a) : s);
}
function ii(e, t, r, n) {
  let a = [], o = [];
  for (let [i, u] of n.entries()) a.push(v(e, t, i)), o.push(v(e, t, u));
  return sa(e.base, r, a, o);
}
function ui(e, t, r, n) {
  let a = [];
  for (let o of n.keys()) a.push(v(e, t, o));
  return ys(r, a);
}
function ci(e, t, r, n) {
  let a = ws(r, N$1(e.base, 4), []);
  return e.type === 1 || (Le$1(e), n.on({ next: (o) => {
    if (e.state.alive) {
      let i = j(e, t, o);
      i && Y(e, vs(r, i));
    }
  }, throw: (o) => {
    if (e.state.alive) {
      let i = j(e, t, o);
      i && Y(e, As(r, i));
    }
    Q(e);
  }, return: (o) => {
    if (e.state.alive) {
      let i = j(e, t, o);
      i && Y(e, Ss(r, i));
    }
    Q(e);
  } })), a;
}
function li(e, t, r) {
  if (this.state.alive) {
    let n = j(this, t, r);
    n && Y(this, g(23, e, s, s, s, s, s, [N$1(this.base, 2), n], s, s, s, s)), Q(this);
  }
}
function fi(e, t, r) {
  if (this.state.alive) {
    let n = j(this, t, r);
    n && Y(this, g(24, e, s, s, s, s, s, [N$1(this.base, 3), n], s, s, s, s));
  }
  Q(this);
}
function pi(e, t, r, n) {
  let a = Jt(e.base, {});
  return e.type === 2 && (Le$1(e), n.then(li.bind(e, a, t), fi.bind(e, a, t))), aa(e.base, r, a);
}
function di(e, t, r, n, a) {
  for (let o = 0, i = a.length; o < i; o++) {
    let u = a[o];
    if (u.parse.sync && u.test(n)) return Ht(r, u.tag, u.parse.sync(n, new Ko(e, t), { id: r }));
  }
  return s;
}
function hi(e, t, r, n, a) {
  for (let o = 0, i = a.length; o < i; o++) {
    let u = a[o];
    if (u.parse.stream && u.test(n)) return Ht(r, u.tag, u.parse.stream(n, new Qo(e, t), { id: r }));
  }
  return s;
}
function fr(e, t, r, n) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? di(e, t, r, n, a) : hi(e, t, r, n, a) : s;
}
function gi(e, t, r, n) {
  let a = [];
  for (let o = 0, i = n.v.length; o < i; o++) a[o] = v(e, t, n.v[o]);
  return Es(r, a, n.t, n.d);
}
function yi(e, t, r, n, a) {
  switch (a) {
    case Object:
      return ge$1(e, t, r, n, false);
    case s:
      return ge$1(e, t, r, n, true);
    case Date:
      return as(r, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return at(e, t, r, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return ri(e, t, r, n);
    case ArrayBuffer:
      return oa(e.base, r, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return ni(e, t, r, n);
    case DataView:
      return ai(e, t, r, n);
    case Map:
      return ii(e, t, r, n);
    case Set:
      return ui(e, t, r, n);
  }
  if (a === Promise || n instanceof Promise) return pi(e, t, r, n);
  let o = e.base.features;
  if (o & 32 && a === RegExp) return os(r, n);
  if (o & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return si(e, t, r, n);
  }
  if (o & 1 && typeof AggregateError < "u" && (a === AggregateError || n instanceof AggregateError)) return oi(e, t, r, n);
  if (n instanceof Error) return at(e, t, r, n);
  if (k in n || P$1 in n) return ge$1(e, t, r, n, !!a);
  throw new ce(n);
}
function mi(e, t, r, n) {
  if (Array.isArray(n)) return ti(e, t, r, n);
  if (Gs(n)) return ci(e, t, r, n);
  if (Hs(n)) return gi(e, t, r, n);
  let a = n.constructor;
  return a === zs ? v(e, t, n.replacement) : fr(e, t, r, n) || yi(e, t, r, n, a);
}
function bi(e, t, r) {
  let n = _e$1(e.base, r);
  if (n.type !== 0) return n.value;
  let a = fr(e, t, n.value, r);
  if (a) return a;
  throw new ce(r);
}
function v(e, t, r) {
  if (t >= e.base.depthLimit) throw new Mt(e.base.depthLimit);
  switch (typeof r) {
    case "boolean":
      return r ? Ut : jt;
    case "undefined":
      return qn;
    case "string":
      return Ft(r);
    case "number":
      return rs(r);
    case "bigint":
      return ns(r);
    case "object": {
      if (r) {
        let n = _e$1(e.base, r);
        return n.type === 0 ? mi(e, t + 1, n.value, r) : n.value;
      }
      return Mn;
    }
    case "symbol":
      return U$1(e.base, r);
    case "function":
      return bi(e, t, r);
    default:
      throw new ce(r);
  }
}
function Y(e, t) {
  e.state.initial ? e.state.buffer.push(t) : je$1(e, t, false);
}
function Ue$1(e, t) {
  if (e.state.onError) e.state.onError(t);
  else throw t instanceof Ge$1 ? t : new Ge$1(t);
}
function pr(e) {
  e.state.onDone && e.state.onDone();
}
function je$1(e, t, r) {
  try {
    e.state.onParse(t, r);
  } catch (n) {
    Ue$1(e, n);
  }
}
function Le$1(e) {
  e.state.pending++;
}
function Q(e) {
  --e.state.pending <= 0 && pr(e);
}
function j(e, t, r) {
  try {
    return v(e, t, r);
  } catch (n) {
    return Ue$1(e, n), s;
  }
}
function dr(e, t) {
  let r = j(e, 0, t);
  r && (je$1(e, r, true), e.state.initial = false, wi(e, e.state), e.state.pending <= 0 && Te$1(e));
}
function wi(e, t) {
  for (let r = 0, n = t.buffer.length; r < n; r++) je$1(e, t.buffer[r], false);
}
function Te$1(e) {
  e.state.alive && (pr(e), e.state.alive = false);
}
function vi(e, t) {
  let r = Ie$1(t.plugins), n = lr({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, onParse(a, o) {
    let i = uo({ plugins: r, features: n.base.features, scopeId: t.scopeId, markedRefs: n.base.marked }), u;
    try {
      u = Jo(i, a);
    } catch (c) {
      t.onError && t.onError(c);
      return;
    }
    t.onSerialize(u, o);
  }, onError: t.onError, onDone: t.onDone });
  return dr(n, e), Te$1.bind(null, n);
}
function Ai(e, t) {
  let r = Ie$1(t.plugins), n = lr({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, depthLimit: t.depthLimit, onParse: t.onParse, onError: t.onError, onDone: t.onDone });
  return dr(n, e), Te$1.bind(null, n);
}
function Si(e, t = {}) {
  var r;
  let n = Ie$1(t.plugins), a = t.disabledFeatures || 0, o = (r = e.f) != null ? r : 63, i = ha({ plugins: n, markedRefs: e.m, features: o & ~a, disabledFeatures: a });
  return Xa(i, e.t);
}
var xe$1 = (e) => {
  let t = new AbortController(), r = t.abort.bind(t);
  return e.then(r, r), t;
};
function Ei(e) {
  e(this.reason);
}
function Ri(e) {
  this.addEventListener("abort", Ei.bind(this, e), { once: true });
}
function ot(e) {
  return new Promise(Ri.bind(e));
}
var J = {}, xi = { tag: "seroval-plugins/web/AbortControllerFactoryPlugin", test(e) {
  return e === J;
}, parse: { sync() {
  return J;
}, async async() {
  return await Promise.resolve(J);
}, stream() {
  return J;
} }, serialize() {
  return xe$1.toString();
}, deserialize() {
  return xe$1;
} }, Pi = { tag: "seroval-plugins/web/AbortSignal", extends: [xi], test(e) {
  return typeof AbortSignal > "u" ? false : e instanceof AbortSignal;
}, parse: { sync(e, t) {
  return e.aborted ? { reason: t.parse(e.reason) } : {};
}, async async(e, t) {
  if (e.aborted) return { reason: await t.parse(e.reason) };
  let r = await ot(e);
  return { reason: await t.parse(r) };
}, stream(e, t) {
  if (e.aborted) return { reason: t.parse(e.reason) };
  let r = ot(e);
  return { factory: t.parse(J), controller: t.parse(r) };
} }, serialize(e, t) {
  return e.reason ? "AbortSignal.abort(" + t.serialize(e.reason) + ")" : e.controller && e.factory ? "(" + t.serialize(e.factory) + ")(" + t.serialize(e.controller) + ").signal" : "(new AbortController).signal";
}, deserialize(e, t) {
  return e.reason ? AbortSignal.abort(t.deserialize(e.reason)) : e.controller ? xe$1(t.deserialize(e.controller)).signal : new AbortController().signal;
} }, ki = Pi;
function ye$1(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var _i = { tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent > "u" ? false : e instanceof CustomEvent;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(ye$1(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(ye$1(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(ye$1(e)) };
} }, serialize(e, t) {
  return "new CustomEvent(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new CustomEvent(t.deserialize(e.type), t.deserialize(e.options));
} }, Ii = _i, $i = { tag: "seroval-plugins/web/DOMException", test(e) {
  return typeof DOMException > "u" ? false : e instanceof DOMException;
}, parse: { sync(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
}, async async(e, t) {
  return { name: await t.parse(e.name), message: await t.parse(e.message) };
}, stream(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
} }, serialize(e, t) {
  return "new DOMException(" + t.serialize(e.message) + "," + t.serialize(e.name) + ")";
}, deserialize(e, t) {
  return new DOMException(t.deserialize(e.message), t.deserialize(e.name));
} }, zi = $i;
function me$1(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var Ci = { tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event > "u" ? false : e instanceof Event;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(me$1(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
} }, serialize(e, t) {
  return "new Event(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Event(t.deserialize(e.type), t.deserialize(e.options));
} }, Oi = Ci, Ui = { tag: "seroval-plugins/web/File", test(e) {
  return typeof File > "u" ? false : e instanceof File;
}, parse: { async async(e, t) {
  return { name: await t.parse(e.name), options: await t.parse({ type: e.type, lastModified: e.lastModified }), buffer: await t.parse(await e.arrayBuffer()) };
} }, serialize(e, t) {
  return "new File([" + t.serialize(e.buffer) + "]," + t.serialize(e.name) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new File([t.deserialize(e.buffer)], t.deserialize(e.name), t.deserialize(e.options));
} }, ji = Ui;
function be$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var $$1 = {}, hr = (e, t = new FormData(), r = 0, n = e.length, a) => {
  for (; r < n; r++) a = e[r], t.append(a[0], a[1]);
  return t;
}, Li = { tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === $$1;
}, parse: { sync() {
  return $$1;
}, async async() {
  return await Promise.resolve($$1);
}, stream() {
  return $$1;
} }, serialize() {
  return hr.toString();
}, deserialize() {
  return $$1;
} }, Ti = { tag: "seroval-plugins/web/FormData", extends: [ji, Li], test(e) {
  return typeof FormData > "u" ? false : e instanceof FormData;
}, parse: { sync(e, t) {
  return { factory: t.parse($$1), entries: t.parse(be$1(e)) };
}, async async(e, t) {
  return { factory: await t.parse($$1), entries: await t.parse(be$1(e)) };
}, stream(e, t) {
  return { factory: t.parse($$1), entries: t.parse(be$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.entries) + ")";
}, deserialize(e, t) {
  return hr(t.deserialize(e.entries));
} }, Ni = Ti;
function we$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var Di = { tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers > "u" ? false : e instanceof Headers;
}, parse: { sync(e, t) {
  return { value: t.parse(we$1(e)) };
}, async async(e, t) {
  return { value: await t.parse(we$1(e)) };
}, stream(e, t) {
  return { value: t.parse(we$1(e)) };
} }, serialize(e, t) {
  return "new Headers(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new Headers(t.deserialize(e.value));
} }, Ne$1 = Di, z = {}, gr = (e) => new ReadableStream({ start: (t) => {
  e.on({ next: (r) => {
    try {
      t.enqueue(r);
    } catch {
    }
  }, throw: (r) => {
    t.error(r);
  }, return: () => {
    try {
      t.close();
    } catch {
    }
  } });
} }), Fi = { tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === z;
}, parse: { sync() {
  return z;
}, async async() {
  return await Promise.resolve(z);
}, stream() {
  return z;
} }, serialize() {
  return gr.toString();
}, deserialize() {
  return z;
} };
function it(e) {
  let t = ee(), r = e.getReader();
  async function n() {
    try {
      let a = await r.read();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Hi = { tag: "seroval/plugins/web/ReadableStream", extends: [Fi], test(e) {
  return typeof ReadableStream > "u" ? false : e instanceof ReadableStream;
}, parse: { sync(e, t) {
  return { factory: t.parse(z), stream: t.parse(ee()) };
}, async async(e, t) {
  return { factory: await t.parse(z), stream: await t.parse(it(e)) };
}, stream(e, t) {
  return { factory: t.parse(z), stream: t.parse(it(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
}, deserialize(e, t) {
  let r = t.deserialize(e.stream);
  return gr(r);
} }, De$1 = Hi;
function ut(e, t) {
  return { body: t, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var Bi = { tag: "seroval-plugins/web/Request", extends: [De$1, Ne$1], test(e) {
  return typeof Request > "u" ? false : e instanceof Request;
}, parse: { async async(e, t) {
  return { url: await t.parse(e.url), options: await t.parse(ut(e, e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null)) };
}, stream(e, t) {
  return { url: t.parse(e.url), options: t.parse(ut(e, e.body && !e.bodyUsed ? e.clone().body : null)) };
} }, serialize(e, t) {
  return "new Request(" + t.serialize(e.url) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Request(t.deserialize(e.url), t.deserialize(e.options));
} }, qi = Bi;
function ct(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var Mi = { tag: "seroval-plugins/web/Response", extends: [De$1, Ne$1], test(e) {
  return typeof Response > "u" ? false : e instanceof Response;
}, parse: { async async(e, t) {
  return { body: await t.parse(e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null), options: await t.parse(ct(e)) };
}, stream(e, t) {
  return { body: t.parse(e.body && !e.bodyUsed ? e.clone().body : null), options: t.parse(ct(e)) };
} }, serialize(e, t) {
  return "new Response(" + t.serialize(e.body) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Response(t.deserialize(e.body), t.deserialize(e.options));
} }, Yi = Mi, Vi = { tag: "seroval-plugins/web/URL", test(e) {
  return typeof URL > "u" ? false : e instanceof URL;
}, parse: { sync(e, t) {
  return { value: t.parse(e.href) };
}, async async(e, t) {
  return { value: await t.parse(e.href) };
}, stream(e, t) {
  return { value: t.parse(e.href) };
} }, serialize(e, t) {
  return "new URL(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new URL(t.deserialize(e.value));
} }, Wi = Vi, Xi = { tag: "seroval-plugins/web/URLSearchParams", test(e) {
  return typeof URLSearchParams > "u" ? false : e instanceof URLSearchParams;
}, parse: { sync(e, t) {
  return { value: t.parse(e.toString()) };
}, async async(e, t) {
  return { value: await t.parse(e.toString()) };
}, stream(e, t) {
  return { value: t.parse(e.toString()) };
} }, serialize(e, t) {
  return "new URLSearchParams(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new URLSearchParams(t.deserialize(e.value));
} }, Gi = Xi;
const Fe$1 = [ki, Ii, zi, Oi, Ni, Ne$1, De$1, qi, Yi, Gi, Wi], Ji = 64, yr = St.RegExp;
function mr(e) {
  const t = new TextEncoder().encode(e), r = t.length, n = r.toString(16), a = "00000000".substring(0, 8 - n.length) + n, o = new TextEncoder().encode(`;0x${a};`), i = new Uint8Array(12 + r);
  return i.set(o), i.set(t, 12), i;
}
function lt(e, t) {
  return new ReadableStream({ start(r) {
    vi(t, { scopeId: e, plugins: Fe$1, onSerialize(n, a) {
      r.enqueue(mr(a ? `(${Kn(e)},${n})` : n));
    }, onDone() {
      r.close();
    }, onError(n) {
      r.error(n);
    } });
  } });
}
function Ki(e) {
  return new ReadableStream({ start(t) {
    Ai(e, { disabledFeatures: yr, depthLimit: Ji, plugins: Fe$1, onParse(r) {
      t.enqueue(mr(JSON.stringify(r)));
    }, onDone() {
      t.close();
    }, onError(r) {
      t.error(r);
    } });
  } });
}
async function ft(e) {
  return Si(JSON.parse(e), { plugins: Fe$1, disabledFeatures: yr });
}
async function Qi(e) {
  const t = bn(e), r = t.request, n = r.headers.get("X-Server-Id"), a = r.headers.get("X-Server-Instance"), o = r.headers.has("X-Single-Flight"), i = new URL(r.url);
  let u, c;
  if (n) gn(typeof n == "string", "Invalid server function"), [u, c] = decodeURIComponent(n).split("#");
  else if (u = i.searchParams.get("id"), c = i.searchParams.get("name"), !u || !c) return new Response(null, { status: 404 });
  const l = Tn[u];
  let p;
  if (!l) return new Response(null, { status: 404 });
  p = await l.importer();
  const d = p[l.functionName];
  let w = [];
  if (!a || e.method === "GET") {
    const f = i.searchParams.get("args");
    if (f) {
      const E = await ft(f);
      for (const re of E) w.push(re);
    }
  }
  if (e.method === "POST") {
    const f = r.headers.get("content-type"), E = e.node.req, re = E instanceof ReadableStream, br = E.body instanceof ReadableStream, wr = re && E.locked || br && E.body.locked, vr = re ? E : E.body, pe = wr ? r : new Request(r, { ...r, body: vr });
    r.headers.get("x-serialized") ? w = await ft(await pe.text()) : (f == null ? void 0 : f.startsWith("multipart/form-data")) || (f == null ? void 0 : f.startsWith("application/x-www-form-urlencoded")) ? w.push(await pe.formData()) : (f == null ? void 0 : f.startsWith("application/json")) && (w = await pe.json());
  }
  try {
    let f = await provideRequestEvent(t, async () => (sharedConfig.context = { event: t }, t.locals.serverFunctionMeta = { id: u + "#" + c }, d(...w)));
    if (o && a && (f = await dt(t, f)), f instanceof Response) {
      if (f.headers && f.headers.has("X-Content-Raw")) return f;
      a && (f.headers && Ve$1(e, f.headers), f.status && (f.status < 300 || f.status >= 400) && ie$1(e, f.status), f.customBody ? f = await f.customBody() : f.body == null && (f = null));
    }
    if (!a) return pt(f, r, w);
    return F(e, "x-serialized", "true"), F(e, "content-type", "text/javascript"), lt(a, f);
    return Ki(f);
  } catch (f) {
    if (f instanceof Response) o && a && (f = await dt(t, f)), f.headers && Ve$1(e, f.headers), f.status && (!a || f.status < 300 || f.status >= 400) && ie$1(e, f.status), f.customBody ? f = f.customBody() : f.body == null && (f = null), F(e, "X-Error", "true");
    else if (a) {
      const E = f instanceof Error ? f.message : typeof f == "string" ? f : "true";
      F(e, "X-Error", E.replace(/[\r\n]+/g, ""));
    } else f = pt(f, r, w, true);
    return a ? (F(e, "x-serialized", "true"), F(e, "content-type", "text/javascript"), lt(a, f)) : f;
  }
}
function pt(e, t, r, n) {
  const a = new URL(t.url), o = e instanceof Error;
  let i = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), a.origin + "").toString()), i = Ln(e))) : u = new Headers({ Location: new URL(t.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: a.pathname + a.search, result: o ? e.message : e, thrown: n, error: o, input: [...r.slice(0, -1), [...r[r.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: i, headers: u });
}
let ve$1;
function Zi(e) {
  var _a2;
  const t = new Headers(e.request.headers), r = an(e.nativeEvent), n = e.response.headers.getSetCookie();
  t.delete("cookie");
  let a = false;
  return ((_a2 = e.nativeEvent.node) == null ? void 0 : _a2.req) && (a = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((o) => {
    if (!o) return;
    const { maxAge: i, expires: u, name: c, value: l } = Vr(o);
    if (i != null && i <= 0) {
      delete r[c];
      return;
    }
    if (u != null && u.getTime() <= Date.now()) {
      delete r[c];
      return;
    }
    r[c] = l;
  }), Object.entries(r).forEach(([o, i]) => {
    t.append("cookie", `${o}=${i}`), a && (e.nativeEvent.node.req.headers.cookie += `${o}=${i};`);
  }), t;
}
async function dt(e, t) {
  let r, n = new URL(e.request.headers.get("referer")).toString();
  t instanceof Response && (t.headers.has("X-Revalidate") && (r = t.headers.get("X-Revalidate").split(",")), t.headers.has("Location") && (n = new URL(t.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const a = mn(e);
  return a.request = new Request(n, { headers: Zi(e) }), await provideRequestEvent(a, async () => {
    await Un(a), ve$1 || (ve$1 = (await import('../build/app-BsvTInn6.mjs')).default), a.router.dataOnly = r || true, a.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = a, ve$1();
      });
    } catch (u) {
      console.log(u);
    }
    const o = a.router.data;
    if (!o) return t;
    let i = false;
    for (const u in o) o[u] === void 0 ? delete o[u] : i = true;
    return i && (t instanceof Response ? t.customBody && (o._$value = t.customBody()) : (o._$value = t, t = new Response(null, { status: 200 })), t.customBody = () => o, t.headers.set("X-Single-Flight", "true")), t;
  });
}
const fu = eventHandler(Qi);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
const ie = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var ue = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const le = (e) => {
  let t = false;
  const s = catchError(() => e.children, (r) => {
    console.error(r), t = !!r;
  });
  return t ? [ssr(ue, ssrHydrationKey()), createComponent$1(ie, { code: 500 })] : s;
};
var pe = " ";
const de = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(pe), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function he(e, t) {
  let { tag: s, attrs: { key: r, ...o } = { key: void 0 }, children: a } = e;
  return de[s]({ attrs: { ...o, nonce: t }, key: r, children: a });
}
var S = ["<script", ">", "<\/script>"], b = ["<script", ' type="module"', "><\/script>"];
const fe = ssr("<!DOCTYPE html>");
function ge(e) {
  const t = getRequestEvent(), s = t.nonce;
  return createComponent$1(NoHydration, { get children() {
    return [fe, createComponent$1(le, { get children() {
      return createComponent$1(e.document, { get assets() {
        return t.assets.map((r) => he(r));
      }, get scripts() {
        return s ? [ssr(S, ssrHydrationKey() + ssrAttribute("nonce", escape(s, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(b, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(S, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(b, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      } });
    } })];
  } });
}
function me(e = {}) {
  let t, s = false;
  const r = (c) => {
    if (t && t !== c) throw new Error("Context conflict");
  };
  let o;
  if (e.asyncContext) {
    const c = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    c ? o = new c() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (o) {
      const c = o.getStore();
      if (c !== void 0) return c;
    }
    return t;
  };
  return { use: () => {
    const c = a();
    if (c === void 0) throw new Error("Context is not available");
    return c;
  }, tryUse: () => a(), set: (c, n) => {
    n || r(c), t = c, s = true;
  }, unset: () => {
    t = void 0, s = false;
  }, call: (c, n) => {
    r(c), t = c;
    try {
      return o ? o.run(c, n) : n();
    } finally {
      s || (t = void 0);
    }
  }, async callAsync(c, n) {
    t = c;
    const u = () => {
      t = c;
    }, i = () => t === c ? u : void 0;
    D.add(i);
    try {
      const p = o ? o.run(c, n) : n();
      return s || (t = void 0), await p;
    } finally {
      D.delete(i);
    }
  } };
}
function Ae(e = {}) {
  const t = {};
  return { get(s, r = {}) {
    return t[s] || (t[s] = me({ ...e, ...r })), t[s];
  } };
}
const P = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, T$1 = "__unctx__", ye = P[T$1] || (P[T$1] = Ae()), xe = (e, t = {}) => ye.get(e, t), $ = "__unctx_async_handlers__", D = P[$] || (P[$] = /* @__PURE__ */ new Set());
function Pe(e) {
  let t;
  const s = L(e), r = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...r, body: e.node.req.body }) : new Request(s, { ...r, get body() {
    return t || (t = De(e), t);
  } });
}
function ve(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: Pe(e), url: L(e) }, e.web.request;
}
function Re() {
  return Ne();
}
const U = /* @__PURE__ */ Symbol("$HTTPEvent");
function we(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[U]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function l(e) {
  return function(...t) {
    var _a;
    let s = t[0];
    if (we(s)) t[0] = s instanceof H3Event || s.__is_event__ ? s : s[U];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = Re(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(s);
    }
    return e(...t);
  };
}
const L = l(getRequestURL), Ee = l(getRequestIP), I = l(setResponseStatus), C = l(getResponseStatus), Se = l(getResponseStatusText), x = l(getResponseHeaders), H = l(getResponseHeader), be = l(setResponseHeader), Te = l(appendResponseHeader), $e = l(sendRedirect), De = l(getRequestWebStream), Ie = l(removeResponseHeader), Ce = l(ve);
function He() {
  var _a;
  return xe("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Ne() {
  return He().use().event;
}
const m = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function _e(e = {}) {
  const t = { options: e, rootNode: q(), staticRoutesMap: {} }, s = (r) => e.strictTrailingSlash ? r : r.replace(/\/$/, "") || "/";
  if (e.routes) for (const r in e.routes) N(t, s(r), e.routes[r]);
  return { ctx: t, lookup: (r) => je(t, s(r)), insert: (r, o) => N(t, s(r), o), remove: (r) => Ue(t, s(r)) };
}
function je(e, t) {
  const s = e.staticRoutesMap[t];
  if (s) return s.data;
  const r = t.split("/"), o = {};
  let a = false, c = null, n = e.rootNode, u = null;
  for (let i = 0; i < r.length; i++) {
    const p = r[i];
    n.wildcardChildNode !== null && (c = n.wildcardChildNode, u = r.slice(i).join("/"));
    const A = n.children.get(p);
    if (A === void 0) {
      if (n && n.placeholderChildren.length > 1) {
        const Y = r.length - i;
        n = n.placeholderChildren.find((k) => k.maxDepth === Y) || null;
      } else n = n.placeholderChildren[0] || null;
      if (!n) break;
      n.paramName && (o[n.paramName] = p), a = true;
    } else n = A;
  }
  return (n === null || n.data === null) && c !== null && (n = c, o[n.paramName || "_"] = u, a = true), n ? a ? { ...n.data, params: a ? o : void 0 } : n.data : null;
}
function N(e, t, s) {
  let r = true;
  const o = t.split("/");
  let a = e.rootNode, c = 0;
  const n = [a];
  for (const u of o) {
    let i;
    if (i = a.children.get(u)) a = i;
    else {
      const p = Le(u);
      i = q({ type: p, parent: a }), a.children.set(u, i), p === m.PLACEHOLDER ? (i.paramName = u === "*" ? `_${c++}` : u.slice(1), a.placeholderChildren.push(i), r = false) : p === m.WILDCARD && (a.wildcardChildNode = i, i.paramName = u.slice(3) || "_", r = false), n.push(i), a = i;
    }
  }
  for (const [u, i] of n.entries()) i.maxDepth = Math.max(n.length - u, i.maxDepth || 0);
  return a.data = s, r === true && (e.staticRoutesMap[t] = a), a;
}
function Ue(e, t) {
  let s = false;
  const r = t.split("/");
  let o = e.rootNode;
  for (const a of r) if (o = o.children.get(a), !o) return s;
  if (o.data) {
    const a = r.at(-1) || "";
    o.data = null, Object.keys(o.children).length === 0 && o.parent && (o.parent.children.delete(a), o.parent.wildcardChildNode = null, o.parent.placeholderChildren = []), s = true;
  }
  return s;
}
function q(e = {}) {
  return { type: e.type || m.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Le(e) {
  return e.startsWith("**") ? m.WILDCARD : e[0] === ":" || e === "*" ? m.PLACEHOLDER : m.NORMAL;
}
const B = [{ page: true, path: "/admin", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/admin.tsx" }, { page: true, path: "/bultos", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/bultos.tsx" }, { page: true, path: "/callback", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/callback.tsx" }, { page: true, path: "/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/index.tsx" }, { page: true, path: "/inventory/expiry", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/expiry.tsx" }, { page: true, path: "/inventory/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/index.tsx" }, { page: true, path: "/inventory/receiving", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/inventory/receiving.tsx" }, { page: true, path: "/invoices/:id", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/[id].tsx" }, { page: true, path: "/invoices/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/index.tsx" }, { page: true, path: "/invoices/new", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/new.tsx" }, { page: true, path: "/invoices/offers", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/offers.tsx" }, { page: true, path: "/invoices/pos", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/invoices/pos.tsx" }, { page: true, path: "/loans", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/loans.tsx" }, { page: true, path: "/login", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/login.tsx" }, { page: true, path: "/ops/consolidate", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/consolidate.tsx" }, { page: true, path: "/ops/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/index.tsx" }, { page: true, path: "/ops/intake", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/intake.tsx" }, { page: true, path: "/ops/locations", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/locations.tsx" }, { page: true, path: "/ops/manifest", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/manifest.tsx" }, { page: true, path: "/ops/manifests", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/manifests.tsx" }, { page: true, path: "/ops/route", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/route.tsx" }, { page: true, path: "/ops/track", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/track.tsx" }, { page: true, path: "/ops/transit", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/ops/transit.tsx" }, { page: true, path: "/tariffs/", filePath: "/Users/hector/Documents/AIProjects/YABA/src/routes/tariffs/index.tsx" }];
qe(B.filter((e) => e.page));
function qe(e) {
  function t(s, r, o, a) {
    const c = Object.values(s).find((n) => o.startsWith(n.id + "/"));
    return c ? (t(c.children || (c.children = []), r, o.slice(c.id.length)), s) : (s.push({ ...r, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), s);
  }
  return e.sort((s, r) => s.path.length - r.path.length).reduce((s, r) => t(s, r, r.path, r.path), []);
}
function Be(e, t) {
  const s = ke.lookup(e);
  if (s && s.route) {
    const r = s.route, o = t === "HEAD" ? r.$HEAD || r.$GET : r[`$${t}`];
    if (o === void 0) return;
    const a = r.page === true && r.$component !== void 0;
    return { handler: o, params: s.params, isPage: a };
  }
}
function Ye(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const ke = _e({ routes: B.reduce((e, t) => {
  if (!Ye(t)) return e;
  let s = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (r, o) => `**:${o}`).split("/").map((r) => r.startsWith(":") || r.startsWith("*") ? r : encodeURIComponent(r)).join("/");
  if (/:[^/]*\?/g.test(s)) throw new Error(`Optional parameters are not supported in API routes: ${s}`);
  if (e[s]) throw new Error(`Duplicate API routes for "${s}" found at "${e[s].route.path}" and "${t.path}"`);
  return e[s] = { route: t }, e;
}, {}) }), R = "solidFetchEvent";
function Oe(e) {
  return { request: Ce(e), response: Fe(e), clientAddress: Ee(e), locals: {}, nativeEvent: e };
}
function Me(e) {
  if (!e.context[R]) {
    const t = Oe(e);
    e.context[R] = t;
  }
  return e.context[R];
}
class We {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const s = H(this.event, t);
    return Array.isArray(s) ? s.join(", ") : s || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, s) {
    return be(this.event, t, s);
  }
  delete(t) {
    return Ie(this.event, t);
  }
  append(t, s) {
    Te(this.event, t, s);
  }
  getSetCookie() {
    const t = H(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(x(this.event)).forEach(([s, r]) => t(Array.isArray(r) ? r.join(", ") : r, s, this));
  }
  entries() {
    return Object.entries(x(this.event)).map(([t, s]) => [t, Array.isArray(s) ? s.join(", ") : s])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(x(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(x(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function Fe(e) {
  return { get status() {
    return C(e);
  }, set status(t) {
    I(e, t);
  }, get statusText() {
    return Se(e);
  }, set statusText(t) {
    I(e, C(e), t);
  }, headers: new We(e) };
}
const Ge = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Ke(e) {
  return e.status && Ge.has(e.status) ? e.status : 302;
}
function ze(e, t, s = {}, r) {
  return eventHandler({ handler: (o) => {
    const a = Me(o);
    return provideRequestEvent(a, async () => {
      const c = Be(new URL(a.request.url).pathname, a.request.method);
      if (c) {
        const i = await c.handler.import(), p = a.request.method === "HEAD" ? i.HEAD || i.GET : i[a.request.method];
        a.params = c.params || {}, sharedConfig.context = { event: a };
        const A = await p(a);
        if (A !== void 0) return A;
        if (a.request.method !== "GET") throw new Error(`API handler for ${a.request.method} "${a.request.url}" did not return a response.`);
        if (!c.isPage) return;
      }
      const n = await t(a), u = typeof s == "function" ? await s(n) : { ...s };
      u.mode, u.nonce && (n.nonce = u.nonce);
      {
        const i = renderToString(() => (sharedConfig.context.event = n, e(n)), u);
        if (n.complete = true, n.response && n.response.headers.get("Location")) {
          const p = Ke(n.response);
          return $e(o, n.response.headers.get("Location"), p);
        }
        return i;
      }
    });
  } });
}
function Je(e, t, s) {
  return ze(e, Qe, t);
}
async function Qe(e) {
  const t = globalThis.MANIFEST.client;
  return Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], routes: [], complete: false, $islands: /* @__PURE__ */ new Set() });
}
var Ve = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"><title>Paito Logistics</title><script src="https://accounts.google.com/gsi/client" async defer><\/script>', "</head>"], Xe = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const nt = Je(() => createComponent$1(ge, { document: ({ assets: e, children: t, scripts: s }) => ssr(Xe, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(Ve, escape(e));
} }), escape(t), escape(s)) }));

const handlers = [
  { route: '', handler: _peezj7, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: fu, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: nt, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$2(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$2(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { au as a, nodeServer as n };
//# sourceMappingURL=nitro.mjs.map
