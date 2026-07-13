import { createComponent, isServer, ssr, ssrHydrationKey, escape, getRequestEvent, delegateEvents, ssrAttribute, ssrElement, mergeProps as mergeProps$1 } from 'solid-js/web';
import { a as au } from '../nitro/nitro.mjs';
import { onMount, createEffect, Show, Suspense, createSignal, onCleanup, For, children, createMemo, getOwner, sharedConfig, useContext, mergeProps, splitProps, createRenderEffect, on as on$1, runWithOwner, createContext, untrack, createRoot, startTransition, resetErrorBoundaries, batch, createComponent as createComponent$1 } from 'solid-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'solid-js/web/storage';

function Je() {
  let e = /* @__PURE__ */ new Set();
  function t(n) {
    return e.add(n), () => e.delete(n);
  }
  let r = false;
  function a(n, s) {
    if (r) return !(r = false);
    const i = { to: n, options: s, defaultPrevented: false, preventDefault: () => i.defaultPrevented = true };
    for (const o of e) o.listener({ ...i, from: o.location, retry: (c) => {
      c && (r = true), o.navigate(n, { ...s, resolve: false });
    } });
    return !i.defaultPrevented;
  }
  return { subscribe: t, confirm: a };
}
let me;
function ye() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), me = window.history.state._depth;
}
isServer || ye();
function Ot(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function Bt(e, t) {
  let r = false;
  return () => {
    const a = me;
    ye();
    const n = a == null ? null : me - a;
    if (r) {
      r = false;
      return;
    }
    n && t(n) ? (r = true, window.history.go(-n)) : e();
  };
}
const Mt = /^(?:[a-z0-9]+:)?\/\//i, Ut = /^\/+|(\/)\/+$/g, Ke = "http://sr";
function C(e, t = false) {
  const r = e.replace(Ut, "$1");
  return r ? t || /^[?#]/.test(r) ? r : "/" + r : "";
}
function te(e, t, r) {
  if (Mt.test(t)) return;
  const a = C(e), n = r && C(r);
  let s = "";
  return !n || t.startsWith("/") ? s = a : n.toLowerCase().indexOf(a.toLowerCase()) !== 0 ? s = a + n : s = n, (s || "/") + C(t, !s);
}
function Ft(e, t) {
  if (e == null) throw new Error(t);
  return e;
}
function Vt(e, t) {
  return C(e).replace(/\/*(\*.*)?$/g, "") + C(t);
}
function Ye(e) {
  const t = {};
  return e.searchParams.forEach((r, a) => {
    a in t ? Array.isArray(t[a]) ? t[a].push(r) : t[a] = [t[a], r] : t[a] = r;
  }), t;
}
function Dt(e, t, r) {
  const [a, n] = e.split("/*", 2), s = a.split("/").filter(Boolean), i = s.length;
  return (o) => {
    const c = o.split("/").filter(Boolean), l = c.length - i;
    if (l < 0 || l > 0 && n === void 0 && !t) return null;
    const m = { path: i ? "" : "/", params: {} }, y = (p) => r === void 0 ? void 0 : r[p];
    for (let p = 0; p < i; p++) {
      const g = s[p], E = g[0] === ":", u = E ? c[p] : c[p].toLowerCase(), d = E ? g.slice(1) : g.toLowerCase();
      if (E && ie(u, y(d))) m.params[d] = u;
      else if (E || !ie(u, d)) return null;
      m.path += `/${u}`;
    }
    if (n) {
      const p = l ? c.slice(-l).join("/") : "";
      if (ie(p, y(n))) m.params[n] = p;
      else return null;
    }
    return m;
  };
}
function ie(e, t) {
  const r = (a) => a === e;
  return t === void 0 ? true : typeof t == "string" ? r(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(r) : t instanceof RegExp ? t.test(e) : false;
}
function Nt(e) {
  const [t, r] = e.pattern.split("/*", 2), a = t.split("/").filter(Boolean);
  return a.reduce((n, s) => n + (s.startsWith(":") ? 2 : 3), a.length - (r === void 0 ? 0 : 1));
}
function Qe(e) {
  const t = /* @__PURE__ */ new Map(), r = getOwner();
  return new Proxy({}, { get(a, n) {
    return t.has(n) || runWithOwner(r, () => t.set(n, createMemo(() => e()[n]))), t.get(n)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  }, has(a, n) {
    return n in e();
  } });
}
function Xe(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let r = e.slice(0, t.index), a = e.slice(t.index + t[0].length);
  const n = [r, r += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(a); ) n.push(r += t[1]), a = a.slice(t[0].length);
  return Xe(a).reduce((s, i) => [...s, ...n.map((o) => o + i)], []);
}
const $t = 100, Ze = createContext(), be = createContext(), ae = () => Ft(useContext(Ze), "<A> and 'use' router primitives can be only used inside a Route."), Ht = () => useContext(be) || ae().base, jt = (e) => {
  const t = Ht();
  return createMemo(() => t.resolvePath(e()));
}, Gt = (e) => {
  const t = ae();
  return createMemo(() => {
    const r = e();
    return r !== void 0 ? t.renderPath(r) : r;
  });
}, qt = () => ae().navigatorFactory(), we = () => ae().location;
function zt(e, t = "") {
  const { component: r, preload: a, load: n, children: s, info: i } = e, o = !s || Array.isArray(s) && !s.length, c = { key: e, component: r, preload: a || n, info: i };
  return et(e.path).reduce((l, m) => {
    for (const y of Xe(m)) {
      const p = Vt(t, y);
      let g = o ? p : p.split("/*", 1)[0];
      g = g.split("/").map((E) => E.startsWith(":") || E.startsWith("*") ? E : encodeURIComponent(E)).join("/"), l.push({ ...c, originalPath: m, pattern: g, matcher: Dt(g, !o, e.matchFilters) });
    }
    return l;
  }, []);
}
function Wt(e, t = 0) {
  return { routes: e, score: Nt(e[e.length - 1]) * 1e4 - t, matcher(r) {
    const a = [];
    for (let n = e.length - 1; n >= 0; n--) {
      const s = e[n], i = s.matcher(r);
      if (!i) return null;
      a.unshift({ ...i, route: s });
    }
    return a;
  } };
}
function et(e) {
  return Array.isArray(e) ? e : [e];
}
function tt(e, t = "", r = [], a = []) {
  const n = et(e);
  for (let s = 0, i = n.length; s < i; s++) {
    const o = n[s];
    if (o && typeof o == "object") {
      o.hasOwnProperty("path") || (o.path = "");
      const c = zt(o, t);
      for (const l of c) {
        r.push(l);
        const m = Array.isArray(o.children) && o.children.length === 0;
        if (o.children && !m) tt(o.children, l.pattern, r, a);
        else {
          const y = Wt([...r], a.length);
          a.push(y);
        }
        r.pop();
      }
    }
  }
  return r.length ? a : a.sort((s, i) => i.score - s.score);
}
function q(e, t) {
  for (let r = 0, a = e.length; r < a; r++) {
    const n = e[r].matcher(t);
    if (n) return n;
  }
  return [];
}
function Jt(e, t, r) {
  const a = new URL(Ke), n = createMemo((m) => {
    const y = e();
    try {
      return new URL(y, a);
    } catch {
      return console.error(`Invalid path ${y}`), m;
    }
  }, a, { equals: (m, y) => m.href === y.href }), s = createMemo(() => n().pathname), i = createMemo(() => n().search, true), o = createMemo(() => n().hash), c = () => "", l = on$1(i, () => Ye(n()));
  return { get pathname() {
    return s();
  }, get search() {
    return i();
  }, get hash() {
    return o();
  }, get state() {
    return t();
  }, get key() {
    return c();
  }, query: r ? r(l) : Qe(l) };
}
let R;
function Kt() {
  return R;
}
function Yt(e, t, r, a = {}) {
  const { signal: [n, s], utils: i = {} } = e, o = i.parsePath || ((f) => f), c = i.renderPath || ((f) => f), l = i.beforeLeave || Je(), m = te("", a.base || "");
  if (m === void 0) throw new Error(`${m} is not a valid base path`);
  m && !n().value && s({ value: m, replace: true, scroll: false });
  const [y, p] = createSignal(false);
  let g;
  const E = (f, h) => {
    h.value === u() && h.state === b() || (g === void 0 && p(true), R = f, g = h, startTransition(() => {
      g === h && (d(g.value), v(g.state), resetErrorBoundaries(), isServer || T[1]((I) => I.filter((k) => k.pending)));
    }).finally(() => {
      g === h && batch(() => {
        R = void 0, f === "navigate" && gt(g), p(false), g = void 0;
      });
    }));
  }, [u, d] = createSignal(n().value), [b, v] = createSignal(n().state), P = Jt(u, b, i.queryWrapper), S = [], T = createSignal(isServer ? yt() : []), H = createMemo(() => typeof a.transformUrl == "function" ? q(t(), a.transformUrl(P.pathname)) : q(t(), P.pathname)), Pe = () => {
    const f = H(), h = {};
    for (let I = 0; I < f.length; I++) Object.assign(h, f[I].params);
    return h;
  }, mt = i.paramsWrapper ? i.paramsWrapper(Pe, t) : Qe(Pe), Te = { pattern: m, path: () => m, outlet: () => null, resolvePath(f) {
    return te(m, f);
  } };
  return createRenderEffect(on$1(n, (f) => E("native", f), { defer: true })), { base: Te, location: P, params: mt, isRouting: y, renderPath: c, parsePath: o, navigatorFactory: ht, matches: H, beforeLeave: l, preloadRoute: vt, singleFlight: a.singleFlight === void 0 ? true : a.singleFlight, submissions: T };
  function pt(f, h, I) {
    untrack(() => {
      if (typeof h == "number") {
        h && (i.go ? i.go(h) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const k = !h || h[0] === "?", { replace: K, resolve: O, scroll: Y, state: B } = { replace: false, resolve: !k, scroll: true, ...I }, M = O ? f.resolvePath(h) : te(k && P.pathname || "", h);
      if (M === void 0) throw new Error(`Path '${h}' is not a routable path`);
      if (S.length >= $t) throw new Error("Too many redirects");
      const Re = u();
      if (M !== Re || B !== b()) if (isServer) {
        const Ce = getRequestEvent();
        Ce && (Ce.response = { status: 302, headers: new Headers({ Location: M }) }), s({ value: M, replace: K, scroll: Y, state: B });
      } else l.confirm(M, I) && (S.push({ value: Re, replace: K, scroll: Y, state: b() }), E("navigate", { value: M, state: B }));
    });
  }
  function ht(f) {
    return f = f || useContext(be) || Te, (h, I) => pt(f, h, I);
  }
  function gt(f) {
    const h = S[0];
    h && (s({ ...f, replace: h.replace, scroll: h.scroll }), S.length = 0);
  }
  function vt(f, h) {
    const I = q(t(), f.pathname), k = R;
    R = "preload";
    for (let K in I) {
      const { route: O, params: Y } = I[K];
      O.component && O.component.preload && O.component.preload();
      const { preload: B } = O;
      h && B && runWithOwner(r(), () => B({ params: Y, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: Ye(f), state: null, key: "" }, intent: "preload" }));
    }
    R = k;
  }
  function yt() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function Qt(e, t, r, a) {
  const { base: n, location: s, params: i } = e, { pattern: o, component: c, preload: l } = a().route, m = createMemo(() => a().path);
  c && c.preload && c.preload();
  const y = l ? l({ params: i, location: s, intent: R || "initial" }) : void 0;
  return { parent: t, pattern: o, path: m, outlet: () => c ? createComponent$1(c, { params: i, location: s, data: y, get children() {
    return r();
  } }) : r(), resolvePath(g) {
    return te(n.path(), g, m());
  } };
}
const rt = (e) => (t) => {
  const { base: r } = t, a = children(() => t.children), n = createMemo(() => tt(a(), t.base || ""));
  let s;
  const i = Yt(e, n, () => s, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent(Ze.Provider, { value: i, get children() {
    return createComponent(Xt, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(s = getOwner()) && null, createComponent(Zt, { routerState: i, get branches() {
        return n();
      } })];
    } });
  } });
};
function Xt(e) {
  const t = e.routerState.location, r = e.routerState.params, a = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: r, location: t, intent: Kt() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (n) => createComponent(n, { params: r, location: t, get data() {
    return a();
  }, get children() {
    return e.children;
  } }) });
}
function Zt(e) {
  if (isServer) {
    const n = getRequestEvent();
    if (n && n.router && n.router.dataOnly) {
      er(n, e.routerState, e.branches);
      return;
    }
    n && ((n.router || (n.router = {})).matches || (n.router.matches = e.routerState.matches().map(({ route: s, path: i, params: o }) => ({ path: s.originalPath, pattern: s.pattern, match: i, params: o, info: s.info }))));
  }
  const t = [];
  let r;
  const a = createMemo(on$1(e.routerState.matches, (n, s, i) => {
    let o = s && n.length === s.length;
    const c = [];
    for (let l = 0, m = n.length; l < m; l++) {
      const y = s && s[l], p = n[l];
      i && y && p.route.key === y.route.key ? c[l] = i[l] : (o = false, t[l] && t[l](), createRoot((g) => {
        t[l] = g, c[l] = Qt(e.routerState, c[l - 1] || e.routerState.base, Be(() => a()[l + 1]), () => {
          var _a;
          const E = e.routerState.matches();
          return (_a = E[l]) != null ? _a : E[0];
        });
      }));
    }
    return t.splice(n.length).forEach((l) => l()), i && o ? i : (r = c[0], c);
  }));
  return Be(() => a() && r)();
}
const Be = (e) => () => createComponent(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent(be.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function er(e, t, r) {
  const a = new URL(e.request.url), n = q(r, new URL(e.router.previousUrl || e.request.url).pathname), s = q(r, a.pathname);
  for (let i = 0; i < s.length; i++) {
    (!n[i] || s[i].route !== n[i].route) && (e.router.dataOnly = true);
    const { route: o, params: c } = s[i];
    o.preload && o.preload({ params: c, location: t.location, intent: "preload" });
  }
}
function tr([e, t], r, a) {
  return [e, a ? (n) => t(a(n)) : t];
}
function rr(e) {
  let t = false;
  const r = (n) => typeof n == "string" ? { value: n } : n, a = tr(createSignal(r(e.get()), { equals: (n, s) => n.value === s.value && n.state === s.state }), void 0, (n) => (!t && e.set(n), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), n));
  return e.init && onCleanup(e.init((n = e.get()) => {
    t = true, a[1](r(n)), t = false;
  })), rt({ signal: a, create: e.create, utils: e.utils });
}
function nr(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function ar(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function sr(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function ir(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && sr(t.request.url) || "" };
  return rt({ signal: [() => r, (a) => Object.assign(r, a)] })(e);
}
const or = /* @__PURE__ */ new Map();
function cr(e = true, t = false, r = "/_server", a) {
  return (n) => {
    const s = n.base.path(), i = n.navigatorFactory(n.base);
    let o, c;
    function l(u) {
      return u.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function m(u) {
      if (u.defaultPrevented || u.button !== 0 || u.metaKey || u.altKey || u.ctrlKey || u.shiftKey) return;
      const d = u.composedPath().find((H) => H instanceof Node && H.nodeName.toUpperCase() === "A");
      if (!d || t && !d.hasAttribute("link")) return;
      const b = l(d), v = b ? d.href.baseVal : d.href;
      if ((b ? d.target.baseVal : d.target) || !v && !d.hasAttribute("state")) return;
      const S = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || S && S.includes("external")) return;
      const T = b ? new URL(v, document.baseURI) : new URL(v);
      if (!(T.origin !== window.location.origin || s && T.pathname && !T.pathname.toLowerCase().startsWith(s.toLowerCase()))) return [d, T];
    }
    function y(u) {
      const d = m(u);
      if (!d) return;
      const [b, v] = d, P = n.parsePath(v.pathname + v.search + v.hash), S = b.getAttribute("state");
      u.preventDefault(), i(P, { resolve: false, replace: b.hasAttribute("replace"), scroll: !b.hasAttribute("noscroll"), state: S ? JSON.parse(S) : void 0 });
    }
    function p(u) {
      const d = m(u);
      if (!d) return;
      const [b, v] = d;
      a && (v.pathname = a(v.pathname)), n.preloadRoute(v, b.getAttribute("preload") !== "false");
    }
    function g(u) {
      clearTimeout(o);
      const d = m(u);
      if (!d) return c = null;
      const [b, v] = d;
      c !== b && (a && (v.pathname = a(v.pathname)), o = setTimeout(() => {
        n.preloadRoute(v, b.getAttribute("preload") !== "false"), c = b;
      }, 20));
    }
    function E(u) {
      if (u.defaultPrevented) return;
      let d = u.submitter && u.submitter.hasAttribute("formaction") ? u.submitter.getAttribute("formaction") : u.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const v = new URL(d, Ke);
        if (d = n.parsePath(v.pathname + v.search), !d.startsWith(r)) return;
      }
      if (u.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const b = or.get(d);
      if (b) {
        u.preventDefault();
        const v = new FormData(u.target, u.submitter);
        b.call({ r: n, f: u.target }, u.target.enctype === "multipart/form-data" ? v : new URLSearchParams(v));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", y), e && (document.addEventListener("mousemove", g, { passive: true }), document.addEventListener("focusin", p, { passive: true }), document.addEventListener("touchstart", p, { passive: true })), document.addEventListener("submit", E), onCleanup(() => {
      document.removeEventListener("click", y), e && (document.removeEventListener("mousemove", g), document.removeEventListener("focusin", p), document.removeEventListener("touchstart", p)), document.removeEventListener("submit", E);
    });
  };
}
function lr(e) {
  if (isServer) return ir(e);
  const t = () => {
    const a = window.location.pathname.replace(/^\/+/, "/") + window.location.search, n = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: a + window.location.hash, state: n };
  }, r = Je();
  return rr({ get: t, set({ value: a, replace: n, scroll: s, state: i }) {
    n ? window.history.replaceState(Ot(i), "", a) : window.history.pushState(i, "", a), ar(decodeURIComponent(window.location.hash.slice(1)), s), ye();
  }, init: (a) => nr(window, "popstate", Bt(a, (n) => {
    if (n) return !r.confirm(n);
    {
      const s = t();
      return !r.confirm(s.value, { state: s.state });
    }
  })), create: cr(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (a) => window.history.go(a), beforeLeave: r } })(e);
}
function Me(e) {
  e = mergeProps({ inactiveClass: "inactive", activeClass: "active" }, e);
  const [, t] = splitProps(e, ["href", "state", "class", "activeClass", "inactiveClass", "end"]), r = jt(() => e.href), a = Gt(r), n = we(), s = createMemo(() => {
    const i = r();
    if (i === void 0) return [false, false];
    const o = C(i.split(/[?#]/, 1)[0]).toLowerCase(), c = decodeURI(C(n.pathname).toLowerCase());
    return [e.end ? o === c : c.startsWith(o + "/") || c === o, o === c];
  });
  return ssrElement("a", mergeProps$1(t, { get href() {
    return a() || e.href;
  }, get state() {
    return JSON.stringify(e.state);
  }, get classList() {
    return { ...e.class && { [e.class]: true }, [e.inactiveClass]: !s()[0], [e.activeClass]: s()[0], ...t.classList };
  }, link: true, get "aria-current"() {
    return s()[1] ? "page" : void 0;
  } }), void 0, true);
}
const ur = { VITE_APP_ID: "paito", VITE_IDSVC_URL: "https://ssgloghr.com/idsvc" }, Q = ur || {};
let pe = { authBase: Q.VITE_AUTH_BASE || "", idsvcUrl: Q.VITE_IDSVC_URL || "", appId: Q.VITE_APP_ID || "", clientId: Q.VITE_SSO_CLIENT_ID || "", perms: {}, callbackPath: "/callback" };
function dr(e) {
  pe = { ...pe, ...e };
}
function J() {
  return pe;
}
const fr = () => J().idsvcUrl, Ee = () => J().appId, Ae = () => `idsvc_refresh_${Ee()}`;
let N = null;
const nt = () => localStorage.getItem(Ae()), mr = (e) => {
  N = e.access, localStorage.setItem(Ae(), e.refresh);
}, pr = () => {
  N = null, localStorage.removeItem(Ae());
}, at = () => !!nt();
async function hr(e, t) {
  const r = await fetch(`${fr()}${e}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(t) }), a = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(a.error || `HTTP ${r.status}`), { status: r.status });
  return a && typeof a == "object" && a.data !== void 0 ? a.data : a;
}
let j = null;
async function st() {
  return j || (j = (async () => {
    const e = nt();
    if (!e) return false;
    try {
      const t = await hr("/auth/refresh", { refresh: e, app: Ee() });
      return mr(t), true;
    } catch (t) {
      return ((t == null ? void 0 : t.status) === 401 || (t == null ? void 0 : t.status) === 400) && pr(), false;
    } finally {
      j = null;
    }
  })(), j);
}
function Ie() {
  if (!N) return null;
  try {
    return JSON.parse(atob(N.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
function gr() {
  var _a, _b;
  const e = Ie();
  return e ? e.superadmin ? ["superadmin"] : ((_b = (_a = e.apps) == null ? void 0 : _a[Ee()]) == null ? void 0 : _b.roles) || [] : [];
}
function vr() {
  const e = Ie();
  return !e || e.exp * 1e3 - Date.now() < 6e4;
}
async function it() {
  return (!N || vr()) && await st(), N;
}
function re(e) {
  if (typeof e == "boolean") return e;
  if (typeof e == "number") return e === 1;
  if (typeof e == "string") {
    const t = e.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes";
  }
  return false;
}
function yr(e, t) {
  var _a;
  if (e.some((a) => a === "admin" || a === "superadmin")) return /* @__PURE__ */ new Set(["*"]);
  const r = /* @__PURE__ */ new Set();
  for (const a of e) for (const n of (_a = t[a]) != null ? _a : []) r.add(n);
  return r;
}
const _e = "ops_user", he = /* @__PURE__ */ new Set();
function ot() {
  for (const e of he) e();
}
function br(e) {
  return he.add(e), () => he.delete(e);
}
const wr = () => {
  try {
    return JSON.parse(localStorage.getItem(_e) || "null");
  } catch {
    return null;
  }
};
let $ = wr(), Er = false, Ar = null;
const ct = () => $, lt = () => ({ user: $, loading: Er, error: Ar });
function Ir(e) {
  e && localStorage.setItem(_e, JSON.stringify(e)), $ = e, ot();
}
function _r() {
  var _a;
  const e = Ie();
  if (!e) return false;
  const t = J().appId, a = (((_a = e.apps) == null ? void 0 : _a[t]) || Object.values(e.apps || {})[0] || {}).scope || {}, n = a.flags || {}, s = { id: e.sub, uid: e.uid, originalUserId: e.sub, googleUid: e.sub, name: e.name || "", email: e.email || ($ == null ? void 0 : $.email) || "", businessId: a.businessId || "", permissions: { ...n, isAdmin: !!e.superadmin || re(n.isAdmin) }, superadmin: !!e.superadmin, apps: e.apps };
  return Ir(s), true;
}
async function Sr() {
  return at() ? navigator.onLine ? await it() ? (_r(), true) : (localStorage.removeItem(_e), $ = null, ot(), false) : !!$ : false;
}
function xr(e) {
  var _a, _b, _c;
  {
    const a = gr();
    if (a.length) return a;
  }
  const t = ct();
  if (!t) return [];
  if (re(t.superadmin) || re((_a = t.permissions) == null ? void 0 : _a.isAdmin) || re(t.isAdmin)) return ["admin"];
  const r = (_c = (_b = t.apps) == null ? void 0 : _b[J().appId]) == null ? void 0 : _c.roles;
  return Array.isArray(r) ? r : [];
}
function ut(e) {
  return yr(xr(), J().perms);
}
function Pr(e, t) {
  const r = ut();
  return r.has("*") || r.has(e);
}
const Tr = (e) => ut().has("*"), Se = lt(), [L, Rr] = createSignal(Se.user), [pn, Cr] = createSignal(Se.loading), [hn, Lr] = createSignal(Se.error);
br(() => {
  const e = lt();
  Rr(e.user), Cr(e.loading), Lr(e.error);
});
const kr = { VITE_APP_ID: "paito", VITE_IDSVC_URL: "https://ssgloghr.com/idsvc" }, X = kr, Or = { admin: ["*"], owner: ["*"], supervisor: ["ops.access", "ops.supervise", "offers.manage", "bultos.view"], oficina: ["ops.access", "ops.supervise", "invoice.view"], bodega: ["ops.access"], chofer: ["ops.access"], inventory: ["inventory.view"], cashier: ["pos.use", "invoice.view"] };
dr({ authBase: X.VITE_AUTH_BASE || "https://ssgloghr.com", idsvcUrl: X.VITE_IDSVC_URL, appId: X.VITE_APP_ID, clientId: X.VITE_SSO_CLIENT_ID || "subpay", perms: Or, callbackPath: "/callback" });
const [oe, Ue] = createSignal(true), Z = () => !!L(), Br = () => Tr(), xe = (e) => e ? Pr(e) : true;
function Fe() {
  var _a;
  return ((_a = ct()) == null ? void 0 : _a.businessId) || "";
}
async function Mr() {
  Ue(true);
  try {
    await Sr();
  } catch {
  } finally {
    Ue(false);
  }
}
var Ur = ["<div", ' class="px-3 py-2 mb-1"><div class="text-sm font-medium text-gray-900 truncate">', '</div><div class="text-xs text-gray-500 truncate">', "</div></div>"], Fr = ["<button", ' class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign out</button>'], Vr = ["<div", ' class="min-h-screen flex"><aside class="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white"><div class="px-6 py-5 border-b border-gray-100"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">P</div><div><div class="font-semibold text-gray-900 leading-tight">Paito</div><div class="text-xs text-gray-500">Logistics</div></div></div></div><nav class="flex-1 px-3 py-4 space-y-1">', '</nav><div class="px-3 py-3 border-t border-gray-100">', '</div></aside><div class="flex-1 flex flex-col min-w-0"><header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-semibold">P</div><span class="font-semibold">Paito</span></div><nav class="flex items-center gap-1">', '</nav></header><main class="flex-1 overflow-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', "</div></main></div></div>"], Dr = ["<svg", ' class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path', "></path></svg>"];
const Nr = [{ href: "/", label: "Dashboard", perm: null, icon: "M3 12l9-9 9 9M5 10v10h14V10" }, { href: "/invoices", label: "Invoices", perm: "invoice.view", icon: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6" }, { href: "/bultos", label: "Bultos", perm: "bultos.view", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/tariffs", label: "Tarifas", perm: "offers.manage", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" }, { href: "/inventory", label: "Inventario", perm: "inventory.view", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/ops", label: "Operaciones", perm: "ops.access", icon: "M12 2l3 3-3 3M3 12h18M12 22l-3-3 3-3M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" }, { href: "/loans", label: "Pr\xE9stamos", perm: "loans.access", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }, { href: "/admin", label: "Usuarios", perm: "admin.users", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" }], Ve = () => Nr.filter((e) => xe(e.perm));
function $r(e) {
  const t = we(), r = (a) => a === "/" ? t.pathname === "/" : t.pathname.startsWith(a);
  return ssr(Vr, ssrHydrationKey(), escape(createComponent(For, { get each() {
    return Ve();
  }, children: (a) => createComponent(Me, { get href() {
    return a.href;
  }, class: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", get classList() {
    return { "bg-brand-50 text-brand-700": r(a.href), "text-gray-700 hover:bg-gray-50 hover:text-gray-900": !r(a.href) };
  }, get children() {
    return [ssr(Dr, ssrHydrationKey(), ssrAttribute("d", escape(a.icon, true), false)), a.label];
  } }) })), escape(createComponent(Show, { get when() {
    return L();
  }, get children() {
    var _a, _b;
    return [ssr(Ur, ssrHydrationKey(), escape((_a = L()) == null ? void 0 : _a.name), escape((_b = L()) == null ? void 0 : _b.email)), ssr(Fr, ssrHydrationKey())];
  } })), escape(createComponent(For, { get each() {
    return Ve();
  }, children: (a) => createComponent(Me, { get href() {
    return a.href;
  }, class: "px-2 py-1 text-xs rounded-md", get classList() {
    return { "bg-brand-50 text-brand-700": r(a.href), "text-gray-600": !r(a.href) };
  }, get children() {
    return a.label;
  } }) })), escape(e.children));
}
var Hr = ["<svg", ' viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>'];
function jr(e) {
  var _a;
  return ssr(Hr, ssrHydrationKey() + ssrAttribute("class", escape(["animate-spin text-gray-400", (_a = e.class) != null ? _a : "w-5 h-5"].join(" "), true), false));
}
const z = { state: { get profile() {
  return L();
}, get user() {
  return L();
}, get stores() {
  return [];
} }, get currentUser() {
  return L();
}, getBusinessId() {
  return Fe();
}, getBusinessIds() {
  return [Fe()].filter(Boolean);
}, isAdmin() {
  return Br();
}, can(e) {
  return xe(e);
}, signOut() {
} }, G = (e = 4) => {
  const t = "0123456789BCDFGKSY";
  let r = "";
  for (let a = 0; a < e; a++) r += t.charAt(Math.floor(Math.random() * t.length));
  return r;
}, Gr = async (e) => {
  var _a;
  const t = "https://ssgloghr.com/api/query", r = async () => {
    const i = await it();
    return i ? `Bearer ${i}` : "";
  }, a = async () => fetch(t, { method: "POST", headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br", Authorization: await r() }, body: JSON.stringify(e) });
  let n = await a();
  if (n.status === 401 && at() && await st() && (n = await a()), !n.ok) throw new Error(`HTTP error! status: ${n.status}`);
  const s = await n.json();
  if (s.errors) throw new Error(((_a = s.errors[0]) == null ? void 0 : _a.message) || "GraphQL error");
  return s.data;
};
function U(e, t = {}) {
  const { params: r = {}, form: a, queryString: n, scope: s, extra: i } = t, o = { ...r };
  s !== false && (o.businessId = s === void 0 ? z.getBusinessId() : s);
  const c = { query: e, params: o, ...i != null ? i : {} };
  return a !== void 0 && (c.form = a), n !== void 0 && (c.queryString = n), Gr(c);
}
const dt = (e) => Array.from({ length: e }, (t, r) => `!* contain :search${r}`).join(" AND ");
dt(5);
dt(6);
const ce = () => {
  var _a;
  const e = (_a = z.state) == null ? void 0 : _a.user;
  return (e == null ? void 0 : e.originalUserId) || (e == null ? void 0 : e.googleUid) || (e == null ? void 0 : e.id) || (e == null ? void 0 : e.uid);
}, De = () => (/* @__PURE__ */ new Date()).getTime(), le = () => (/* @__PURE__ */ new Date()).toISOString(), qr = { async list(e) {
  const t = {};
  return (e == null ? void 0 : e.method) && (t.method = e.method), (e == null ? void 0 : e.category) && (t.category = e.category), (await U("listTariffOffers", { params: t })).data || [];
}, async get(e) {
  const t = await U("getTariffOffer", { params: { id: e } });
  return t.data || t;
}, async create(e, t) {
  var _a, _b;
  const r = (t == null ? void 0 : t.businessId) || z.getBusinessId(), a = (t == null ? void 0 : t.code) || `${G(6)}_${G(6)}`, n = await U("createTariffOffer", { scope: r, params: { userId: ce(), timestamp: De() }, form: { id: G(16), offerCode: a, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: r, data: e, createdAt: le(), updatedAt: le() } });
  return n.data || n;
}, async update(e, t, r) {
  const a = (r == null ? void 0 : r.originalBusinessId) || (r == null ? void 0 : r.businessId) || z.getBusinessId(), n = { data: t, updatedAt: le() };
  (r == null ? void 0 : r.name) && (n.offerName = r.name), (r == null ? void 0 : r.code) && (n.offerCode = r.code), (r == null ? void 0 : r.isActive) !== void 0 && (n.isActive = r.isActive), (r == null ? void 0 : r.isVisible) !== void 0 && (n.isVisible = r.isVisible), (r == null ? void 0 : r.businessId) && (n.businessId = r.businessId);
  const s = await U("updateTariffOffer", { scope: a, params: { id: e, userId: ce(), timestamp: De() }, form: n });
  return s.data || s;
}, async delete(e) {
  try {
    return await U("deleteTariffOffer", { params: { id: e, userId: ce() } }), { success: true, message: "Tarifa eliminada exitosamente" };
  } catch (t) {
    return console.error("Error deleting tariff offer:", t), { success: false, message: (t == null ? void 0 : t.message) || "Error al eliminar tarifa" };
  }
}, async validate(e, t) {
  var _a, _b;
  const r = (t == null ? void 0 : t.businessId) || z.getBusinessId(), a = (t == null ? void 0 : t.code) || `${G(6)}_${G(6)}`, n = await U("validateTariffOffer", { scope: r, form: { offerCode: a, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: r, data: e } });
  return n.data || n;
} }, zr = [{ id: "kitchen_appliances", name: "Kitchen Appliances", nameEs: "Electrodom\xE9sticos de Cocina", icon: "\u{1F373}", items: [{ id: "batidora", name: "Blender/Mixer", nameEs: "Batidora", price: 3 }, { id: "hornilla", name: "Hot Plate/Burner", nameEs: "Hornilla", price: 3 }, { id: "ventilador", name: "Fan", nameEs: "Ventilador", price: 3 }, { id: "olla_arrocera", name: "Rice Cooker", nameEs: "Olla Arrocera", price: 4 }, { id: "olla_presion", name: "Pressure Cooker", nameEs: "Olla de Presi\xF3n", price: 4 }, { id: "freidora", name: "Air Fryer", nameEs: "Freidora", price: 4 }, { id: "cofitera", name: "Coffee Maker", nameEs: "Cafetera", price: 3 }] }, { id: "lighting", name: "Lighting", nameEs: "Iluminaci\xF3n", icon: "\u{1F4A1}", items: [{ id: "linterna", name: "Flashlight (all types)", nameEs: "Linterna (todo tipo)", price: 2.5 }] }, { id: "home", name: "Home & Furniture", nameEs: "Hogar", icon: "\u{1F3E0}", items: [{ id: "utiles_hogar", name: "Household Items", nameEs: "\xDAtiles del Hogar", price: 5 }, { id: "colchones", name: "Mattress", nameEs: "Colchones", price: 20 }, { id: "camas", name: "Bed Frame", nameEs: "Camas", price: 20 }, { id: "gavetero", name: "Dresser", nameEs: "Gavetero", price: 20 }, { id: "juego_muebles", name: "Furniture Set (Living/Dining/Patio)", nameEs: "Juego de Muebles (Sala/Comedor/Patio)", price: 150 }, { id: "sillon_electrico", name: "Electric Recliner", nameEs: "Sill\xF3n El\xE9ctrico", price: 30 }, { id: "sillon_normal", name: "Regular Armchair", nameEs: "Sill\xF3n Normal", price: 0, note: "Free" }, { id: "silla_enfermo", name: "Medical Chair", nameEs: "Silla de Enfermo", price: null, note: "Contact for quote" }, { id: "waterpump", name: "Water Pump", nameEs: "Turbina de Agua", price: 15 }, { id: "microwaveS", name: "Small Microwave", nameEs: "Microwave Pequeno", price: 4 }, { id: "microwaveB", name: "Big Microwave", nameEs: "Microwave Grande", price: 7 }] }, { id: "electronics", name: "Electronics", nameEs: "Electr\xF3nica", icon: "\u{1F4F1}", items: [{ id: "telefono", name: "Phone", nameEs: "Tel\xE9fono", price: 10 }, { id: "laptop", name: "Laptop", nameEs: "Laptop", price: 20, note: "+ weight charge" }, { id: "computadora", name: "Desktop Computer", nameEs: "Computadora", price: 80 }, { id: "tv_hasta_55", name: 'TV up to 55"', nameEs: 'Televisor hasta 55"', price: 60 }, { id: "tv_mas_55", name: 'TV over 55"', nameEs: 'Televisor m\xE1s de 55"', price: 80 }, { id: "playstation", name: "PlayStation", nameEs: "PlayStation", price: 150 }, { id: "speaker", name: "Speaker", nameEs: "Bocina", price: 20 }, { id: "generator", name: "Generator", nameEs: "Generador", price: 40 }, { id: "lithium_battery", name: "Lithium Battery", nameEs: "Bateria de Litio", price: 50 }] }, { id: "refrigeration", name: "Refrigeration", nameEs: "Refrigeraci\xF3n", icon: "\u2744\uFE0F", items: [{ id: "nevera", name: "Freezer", nameEs: "Nevera", price: 40 }, { id: "refrigerador", name: "Refrigerator", nameEs: "Refrigerador", price: 40 }, { id: "aire_acondicionado", name: "Air Conditioner", nameEs: "Aire Acondicionado", price: 20 }] }, { id: "security", name: "Security", nameEs: "Seguridad", icon: "\u{1F4F9}", items: [{ id: "sistema_camaras", name: "Camera System", nameEs: "Sistema de C\xE1maras", price: 150 }, { id: "camara_individual", name: "Individual Camera", nameEs: "C\xE1mara Individual", price: 20 }] }, { id: "tools", name: "Tools", nameEs: "Herramientas", icon: "\u{1F527}", items: [{ id: "herramientas_variadas", name: "Assorted Tools", nameEs: "Herramientas Variadas", price: 10 }, { id: "herramientas_motor", name: "Power Tools", nameEs: "Herramientas con Motor", price: 15 }] }, { id: "transport_recreation", name: "Transport & Recreation", nameEs: "Transporte y Recreaci\xF3n", icon: "\u{1F6B2}", items: [{ id: "scooter", name: "Scooter (large or small)", nameEs: "Scooter (grande o chica)", price: 40 }, { id: "equipos_gym", name: "Gym Equipment", nameEs: "Equipos de Gym", price: 60 }, { id: "bicicleta_normal", name: "Regular Bicycle", nameEs: "Bicicleta Normal", price: 30 }, { id: "bicicleta_electrica", name: "Electric Bicycle", nameEs: "Bicicleta El\xE9ctrica", price: 60 }, { id: "juguetes_bateria_10kg", name: "Battery Toys (up to 10kg)", nameEs: "Juguetes con Bater\xEDa (hasta 10kg)", price: 15 }, { id: "juguetes_bateria_mas_10kg", name: "Battery Toys (over 10kg)", nameEs: "Juguetes con Bater\xEDa (m\xE1s de 10kg)", price: 20 }, { id: "tires", name: "Tires", nameEs: "Gomas de Carro", price: 20 }] }, { id: "parts_by_weight", name: "Parts by Weight", nameEs: "Piezas por Peso", icon: "\u2696\uFE0F", items: [{ id: "piezas_hasta_10kg", name: "Parts up to 10kg (22lbs)", nameEs: "Piezas hasta 10kg", price: 40 }, { id: "piezas_10_20kg", name: "Parts 10-20kg (22-44lbs)", nameEs: "Piezas de 10kg a 20kg", price: 60 }, { id: "piezas_mas_20kg", name: "Parts over 20kg (44lbs+)", nameEs: "Piezas m\xE1s de 20kg", price: 80 }] }, { id: "essentials", name: "Essentials (Free)", nameEs: "Esenciales (Gratis)", icon: "\u{1F193}", items: [{ id: "comida", name: "Food", nameEs: "Comida", price: 0, note: "Gratis" }, { id: "medicina", name: "Medicine", nameEs: "Medicina", price: 0, note: "Gratis" }, { id: "aseo", name: "Toiletries/Hygiene", nameEs: "Aseo", price: 0, note: "Gratis" }, { id: "ropa", name: "Clothing", nameEs: "Ropa", price: 0, note: "Gratis" }, { id: "zapatos", name: "Shoes", nameEs: "Zapatos", price: 0, note: "Gratis" }] }, { id: "other", name: "Other", nameEs: "Otros", icon: "\u{1F4E6}", items: [{ id: "articulos_medicos", name: "Medical Equipment", nameEs: "Art\xEDculos de Uso M\xE9dico", price: 0, note: "Gratis" }, { id: "sistema_pesca", name: "Fishing Gear", nameEs: "Sistema de Pesca", price: 40 }, { id: "extraTariff", name: "Extra Tariff", nameEs: "Tarifas extras", price: 3 }] }], Wr = { weekly: { tiers: [] }, biweekly: { tiers: [] }, special: { tiers: [] } }, Jr = { weekly: { miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }, cycles: [{ id: "weekly", label: "Semanal", miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }], unit: "USD per lb", boxes: [{ id: "box_14x14x14", name: "Box 14x14x14", nameEs: "Caja 14x14x14", dimensions: "14x14x14", price: 60, maxLbs: 80 }] }, Kr = [{ address: "4105 E 4 Ave", city: "Hialeah", zip: "33013", phone: "786-587-0068" }, { address: "6895 W 4 Ave", city: "Hialeah", zip: "33014", phone: "786-487-4037" }], ue = { company: "PAITO LOGISTICS", currency: "USD", coverage: "Env\xEDos a toda Cuba hasta la puerta de tu casa, incluyendo la Isla de la Juventud" }, Yr = { MISCELANEAS: { over50items: 2.99, under50items: 3.99, description: "Ropa, zapatos, accesorios, art\xEDculos personales" }, DURADEROS: { price: 4.5, description: "Electr\xF3nicos, electrodom\xE9sticos, herramientas", arancel: { ranges: [{ min: 0, max: 5, cost: 5 }, { min: 5, max: 20, cost: 10 }, { min: 20, max: 50, cost: 20 }, { min: 50, max: 100, cost: 35 }, { min: 100, max: 1 / 0, cost: 50 }] } }, LITHIUM_BATTERIES: { price: 8.99, description: "Bater\xEDas de litio, power banks, equipos con bater\xEDa de litio" }, EXCLUSIVE: { price: 6.99, description: "TVs, computadoras, generadores (bulto exclusivo)" }, DOCUMENTS: { price: 1.99, description: "Documentos, papeles, certificados" }, baseTransportCost: 20 }, Qr = { schemaVersion: 1, branding: { company: ue.company, currency: ue.currency, coverage: ue.coverage, locations: Kr }, itemTariffs: zr, airShipping: Wr, maritimeShipping: Jr, dynamicPricing: Yr }, ft = "yaba-active-tariff-id", [Xr, ee] = createSignal(null), [gn, de] = createSignal(null), [vn, Zr] = createSignal([]), [yn, Ne] = createSignal(false), [bn, fe] = createSignal(null);
function en(e) {
  var _a, _b, _c, _d, _e2;
  const t = (_c = (_b = (_a = e.dynamicPricing) == null ? void 0 : _a.DURADEROS) == null ? void 0 : _b.arancel) == null ? void 0 : _c.ranges;
  if (Array.isArray(t)) for (const r of t) (r.max === null || r.max === void 0) && (r.max = 1 / 0);
  for (const r of ["weekly", "biweekly", "special"]) {
    const a = (_e2 = (_d = e.airShipping) == null ? void 0 : _d[r]) == null ? void 0 : _e2.tiers;
    if (Array.isArray(a)) for (const n of a) (n.maxLbs === null || n.maxLbs === void 0) && (n.maxLbs = 1 / 0);
  }
  return e;
}
function $e(e) {
  try {
    const t = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data;
    if (!t) return null;
    const r = t.schemaVersion ? t : t.config;
    return !r || typeof r != "object" ? null : en({ ...Qr, ...r });
  } catch {
    return null;
  }
}
function tn(e) {
  var _a, _b, _c;
  try {
    return ((_c = (_b = (_a = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data) == null ? void 0 : _a.isActive) != null ? _b : e == null ? void 0 : e.isActive) != null ? _c : true) !== false;
  } catch {
    return false;
  }
}
function rn() {
  return typeof localStorage < "u" ? localStorage.getItem(ft) : null;
}
function nn(e) {
  typeof localStorage < "u" && localStorage.setItem(ft, e);
}
async function an(e) {
  try {
    Ne(true), fe(null);
    const r = (await qr.list()).filter(tn);
    if (Zr(r), r.length === 0) return ee(null), de(null), null;
    const a = rn(), n = e && r.find((o) => o.id === e) || a && r.find((o) => o.id === a) || r[0];
    let s = n, i = $e(s);
    if (!i) {
      for (const o of r) if (o !== n && (i = $e(o), i)) {
        s = o;
        break;
      }
    }
    return i ? (ee(i), de(s.id), nn(s.id), i) : (fe("No se pudo leer ninguna oferta de tarifa"), ee(null), de(null), null);
  } catch (t) {
    fe((t == null ? void 0 : t.message) || "Error loading tariff config");
    const r = Xr();
    return r || ee(null), r;
  } finally {
    Ne(false);
  }
}
var sn = ["<div", ' class="min-h-screen grid place-items-center">', "</div>"];
function on(e) {
  const t = we(), r = qt();
  onMount(() => {
    Mr();
  });
  const a = () => t.pathname === "/login" || t.pathname === "/callback" || t.pathname === "/label-demo", n = { "/invoices": "invoice.view", "/bultos": "bultos.view", "/tariffs": "offers.manage", "/inventory": "inventory.view", "/ops": "ops.access", "/loans": "loans.access", "/admin": "admin.users" }, s = () => {
    const i = Object.keys(n).find((o) => t.pathname.startsWith(o));
    return i ? n[i] : null;
  };
  return createEffect(() => {
    oe() || (!Z() && !a() ? r("/login", { replace: true }) : Z() && t.pathname === "/login" ? r("/", { replace: true }) : Z() && !xe(s()) && r("/", { replace: true }));
  }), createEffect(() => {
    !oe() && Z() && an();
  }), createComponent(Show, { get when() {
    return !oe();
  }, get fallback() {
    return ssr(sn, ssrHydrationKey(), escape(createComponent(jr, { class: "w-8 h-8" })));
  }, get children() {
    return createComponent(Show, { get when() {
      return !a();
    }, get fallback() {
      return createComponent(Suspense, { get children() {
        return e.children;
      } });
    }, get children() {
      return createComponent($r, { get children() {
        return createComponent(Suspense, { get children() {
          return e.children;
        } });
      } });
    } });
  } });
}
function wn() {
  return createComponent(lr, { root: on, get children() {
    return createComponent(au, {});
  } });
}

export { wn as default };
//# sourceMappingURL=app-B2f1I4Kq.mjs.map
