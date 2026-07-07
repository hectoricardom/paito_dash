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

function qe() {
  let e = /* @__PURE__ */ new Set();
  function t(s) {
    return e.add(s), () => e.delete(s);
  }
  let n = false;
  function r(s, a) {
    if (n) return !(n = false);
    const i = { to: s, options: a, defaultPrevented: false, preventDefault: () => i.defaultPrevented = true };
    for (const o of e) o.listener({ ...i, from: o.location, retry: (c) => {
      c && (n = true), o.navigate(s, { ...a, resolve: false });
    } });
    return !i.defaultPrevented;
  }
  return { subscribe: t, confirm: r };
}
let fe;
function pe() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), fe = window.history.state._depth;
}
isServer || pe();
function Pt(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function _t(e, t) {
  let n = false;
  return () => {
    const r = fe;
    pe();
    const s = r == null ? null : fe - r;
    if (n) {
      n = false;
      return;
    }
    s && t(s) ? (n = true, window.history.go(-s)) : e();
  };
}
const Ct = /^(?:[a-z0-9]+:)?\/\//i, Rt = /^\/+|(\/)\/+$/g, Ve = "http://sr";
function T(e, t = false) {
  const n = e.replace(Rt, "$1");
  return n ? t || /^[?#]/.test(n) ? n : "/" + n : "";
}
function Z(e, t, n) {
  if (Ct.test(t)) return;
  const r = T(e), s = n && T(n);
  let a = "";
  return !s || t.startsWith("/") ? a = r : s.toLowerCase().indexOf(r.toLowerCase()) !== 0 ? a = r + s : a = s, (a || "/") + T(t, !a);
}
function Lt(e, t) {
  if (e == null) throw new Error(t);
  return e;
}
function Tt(e, t) {
  return T(e).replace(/\/*(\*.*)?$/g, "") + T(t);
}
function ze(e) {
  const t = {};
  return e.searchParams.forEach((n, r) => {
    r in t ? Array.isArray(t[r]) ? t[r].push(n) : t[r] = [t[r], n] : t[r] = n;
  }), t;
}
function kt(e, t, n) {
  const [r, s] = e.split("/*", 2), a = r.split("/").filter(Boolean), i = a.length;
  return (o) => {
    const c = o.split("/").filter(Boolean), l = c.length - i;
    if (l < 0 || l > 0 && s === void 0 && !t) return null;
    const m = { path: i ? "" : "/", params: {} }, v = (h) => n === void 0 ? void 0 : n[h];
    for (let h = 0; h < i; h++) {
      const g = a[h], E = g[0] === ":", u = E ? c[h] : c[h].toLowerCase(), d = E ? g.slice(1) : g.toLowerCase();
      if (E && ae(u, v(d))) m.params[d] = u;
      else if (E || !ae(u, d)) return null;
      m.path += `/${u}`;
    }
    if (s) {
      const h = l ? c.slice(-l).join("/") : "";
      if (ae(h, v(s))) m.params[s] = h;
      else return null;
    }
    return m;
  };
}
function ae(e, t) {
  const n = (r) => r === e;
  return t === void 0 ? true : typeof t == "string" ? n(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(n) : t instanceof RegExp ? t.test(e) : false;
}
function Ot(e) {
  const [t, n] = e.pattern.split("/*", 2), r = t.split("/").filter(Boolean);
  return r.reduce((s, a) => s + (a.startsWith(":") ? 2 : 3), r.length - (n === void 0 ? 0 : 1));
}
function We(e) {
  const t = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(r, s) {
    return t.has(s) || runWithOwner(n, () => t.set(s, createMemo(() => e()[s]))), t.get(s)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  }, has(r, s) {
    return s in e();
  } });
}
function Je(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let n = e.slice(0, t.index), r = e.slice(t.index + t[0].length);
  const s = [n, n += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(r); ) s.push(n += t[1]), r = r.slice(t[0].length);
  return Je(r).reduce((a, i) => [...a, ...s.map((o) => o + i)], []);
}
const Mt = 100, Ke = createContext(), ge = createContext(), ne = () => Lt(useContext(Ke), "<A> and 'use' router primitives can be only used inside a Route."), Bt = () => useContext(ge) || ne().base, Ut = (e) => {
  const t = Bt();
  return createMemo(() => t.resolvePath(e()));
}, Ft = (e) => {
  const t = ne();
  return createMemo(() => {
    const n = e();
    return n !== void 0 ? t.renderPath(n) : n;
  });
}, Nt = () => ne().navigatorFactory(), ye = () => ne().location;
function $t(e, t = "") {
  const { component: n, preload: r, load: s, children: a, info: i } = e, o = !a || Array.isArray(a) && !a.length, c = { key: e, component: n, preload: r || s, info: i };
  return Ye(e.path).reduce((l, m) => {
    for (const v of Je(m)) {
      const h = Tt(t, v);
      let g = o ? h : h.split("/*", 1)[0];
      g = g.split("/").map((E) => E.startsWith(":") || E.startsWith("*") ? E : encodeURIComponent(E)).join("/"), l.push({ ...c, originalPath: m, pattern: g, matcher: kt(g, !o, e.matchFilters) });
    }
    return l;
  }, []);
}
function Dt(e, t = 0) {
  return { routes: e, score: Ot(e[e.length - 1]) * 1e4 - t, matcher(n) {
    const r = [];
    for (let s = e.length - 1; s >= 0; s--) {
      const a = e[s], i = a.matcher(n);
      if (!i) return null;
      r.unshift({ ...i, route: a });
    }
    return r;
  } };
}
function Ye(e) {
  return Array.isArray(e) ? e : [e];
}
function Qe(e, t = "", n = [], r = []) {
  const s = Ye(e);
  for (let a = 0, i = s.length; a < i; a++) {
    const o = s[a];
    if (o && typeof o == "object") {
      o.hasOwnProperty("path") || (o.path = "");
      const c = $t(o, t);
      for (const l of c) {
        n.push(l);
        const m = Array.isArray(o.children) && o.children.length === 0;
        if (o.children && !m) Qe(o.children, l.pattern, n, r);
        else {
          const v = Dt([...n], r.length);
          r.push(v);
        }
        n.pop();
      }
    }
  }
  return n.length ? r : r.sort((a, i) => i.score - a.score);
}
function q(e, t) {
  for (let n = 0, r = e.length; n < r; n++) {
    const s = e[n].matcher(t);
    if (s) return s;
  }
  return [];
}
function Ht(e, t, n) {
  const r = new URL(Ve), s = createMemo((m) => {
    const v = e();
    try {
      return new URL(v, r);
    } catch {
      return console.error(`Invalid path ${v}`), m;
    }
  }, r, { equals: (m, v) => m.href === v.href }), a = createMemo(() => s().pathname), i = createMemo(() => s().search, true), o = createMemo(() => s().hash), c = () => "", l = on$1(i, () => ze(s()));
  return { get pathname() {
    return a();
  }, get search() {
    return i();
  }, get hash() {
    return o();
  }, get state() {
    return t();
  }, get key() {
    return c();
  }, query: n ? n(l) : We(l) };
}
let L;
function Gt() {
  return L;
}
function jt(e, t, n, r = {}) {
  const { signal: [s, a], utils: i = {} } = e, o = i.parsePath || ((f) => f), c = i.renderPath || ((f) => f), l = i.beforeLeave || qe(), m = Z("", r.base || "");
  if (m === void 0) throw new Error(`${m} is not a valid base path`);
  m && !s().value && a({ value: m, replace: true, scroll: false });
  const [v, h] = createSignal(false);
  let g;
  const E = (f, p) => {
    p.value === u() && p.state === b() || (g === void 0 && h(true), L = f, g = p, startTransition(() => {
      g === p && (d(g.value), y(g.state), resetErrorBoundaries(), isServer || R[1]((S) => S.filter((k) => k.pending)));
    }).finally(() => {
      g === p && batch(() => {
        L = void 0, f === "navigate" && lt(g), h(false), g = void 0;
      });
    }));
  }, [u, d] = createSignal(s().value), [b, y] = createSignal(s().state), C = Ht(u, b, i.queryWrapper), P = [], R = createSignal(isServer ? dt() : []), H = createMemo(() => typeof r.transformUrl == "function" ? q(t(), r.transformUrl(C.pathname)) : q(t(), C.pathname)), xe = () => {
    const f = H(), p = {};
    for (let S = 0; S < f.length; S++) Object.assign(p, f[S].params);
    return p;
  }, it = i.paramsWrapper ? i.paramsWrapper(xe, t) : We(xe), Ie = { pattern: m, path: () => m, outlet: () => null, resolvePath(f) {
    return Z(m, f);
  } };
  return createRenderEffect(on$1(s, (f) => E("native", f), { defer: true })), { base: Ie, location: C, params: it, isRouting: v, renderPath: c, parsePath: o, navigatorFactory: ct, matches: H, beforeLeave: l, preloadRoute: ut, singleFlight: r.singleFlight === void 0 ? true : r.singleFlight, submissions: R };
  function ot(f, p, S) {
    untrack(() => {
      if (typeof p == "number") {
        p && (i.go ? i.go(p) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const k = !p || p[0] === "?", { replace: K, resolve: O, scroll: Y, state: M } = { replace: false, resolve: !k, scroll: true, ...S }, B = O ? f.resolvePath(p) : Z(k && C.pathname || "", p);
      if (B === void 0) throw new Error(`Path '${p}' is not a routable path`);
      if (P.length >= Mt) throw new Error("Too many redirects");
      const Pe = u();
      if (B !== Pe || M !== b()) if (isServer) {
        const _e = getRequestEvent();
        _e && (_e.response = { status: 302, headers: new Headers({ Location: B }) }), a({ value: B, replace: K, scroll: Y, state: M });
      } else l.confirm(B, S) && (P.push({ value: Pe, replace: K, scroll: Y, state: b() }), E("navigate", { value: B, state: M }));
    });
  }
  function ct(f) {
    return f = f || useContext(ge) || Ie, (p, S) => ot(f, p, S);
  }
  function lt(f) {
    const p = P[0];
    p && (a({ ...f, replace: p.replace, scroll: p.scroll }), P.length = 0);
  }
  function ut(f, p) {
    const S = q(t(), f.pathname), k = L;
    L = "preload";
    for (let K in S) {
      const { route: O, params: Y } = S[K];
      O.component && O.component.preload && O.component.preload();
      const { preload: M } = O;
      p && M && runWithOwner(n(), () => M({ params: Y, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: ze(f), state: null, key: "" }, intent: "preload" }));
    }
    L = k;
  }
  function dt() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function qt(e, t, n, r) {
  const { base: s, location: a, params: i } = e, { pattern: o, component: c, preload: l } = r().route, m = createMemo(() => r().path);
  c && c.preload && c.preload();
  const v = l ? l({ params: i, location: a, intent: L || "initial" }) : void 0;
  return { parent: t, pattern: o, path: m, outlet: () => c ? createComponent$1(c, { params: i, location: a, data: v, get children() {
    return n();
  } }) : n(), resolvePath(g) {
    return Z(s.path(), g, m());
  } };
}
const Xe = (e) => (t) => {
  const { base: n } = t, r = children(() => t.children), s = createMemo(() => Qe(r(), t.base || ""));
  let a;
  const i = jt(e, s, () => a, { base: n, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent(Ke.Provider, { value: i, get children() {
    return createComponent(Vt, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(a = getOwner()) && null, createComponent(zt, { routerState: i, get branches() {
        return s();
      } })];
    } });
  } });
};
function Vt(e) {
  const t = e.routerState.location, n = e.routerState.params, r = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: n, location: t, intent: Gt() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (s) => createComponent(s, { params: n, location: t, get data() {
    return r();
  }, get children() {
    return e.children;
  } }) });
}
function zt(e) {
  if (isServer) {
    const s = getRequestEvent();
    if (s && s.router && s.router.dataOnly) {
      Wt(s, e.routerState, e.branches);
      return;
    }
    s && ((s.router || (s.router = {})).matches || (s.router.matches = e.routerState.matches().map(({ route: a, path: i, params: o }) => ({ path: a.originalPath, pattern: a.pattern, match: i, params: o, info: a.info }))));
  }
  const t = [];
  let n;
  const r = createMemo(on$1(e.routerState.matches, (s, a, i) => {
    let o = a && s.length === a.length;
    const c = [];
    for (let l = 0, m = s.length; l < m; l++) {
      const v = a && a[l], h = s[l];
      i && v && h.route.key === v.route.key ? c[l] = i[l] : (o = false, t[l] && t[l](), createRoot((g) => {
        t[l] = g, c[l] = qt(e.routerState, c[l - 1] || e.routerState.base, Te(() => r()[l + 1]), () => {
          var _a;
          const E = e.routerState.matches();
          return (_a = E[l]) != null ? _a : E[0];
        });
      }));
    }
    return t.splice(s.length).forEach((l) => l()), i && o ? i : (n = c[0], c);
  }));
  return Te(() => r() && n)();
}
const Te = (e) => () => createComponent(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent(ge.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function Wt(e, t, n) {
  const r = new URL(e.request.url), s = q(n, new URL(e.router.previousUrl || e.request.url).pathname), a = q(n, r.pathname);
  for (let i = 0; i < a.length; i++) {
    (!s[i] || a[i].route !== s[i].route) && (e.router.dataOnly = true);
    const { route: o, params: c } = a[i];
    o.preload && o.preload({ params: c, location: t.location, intent: "preload" });
  }
}
function Jt([e, t], n, r) {
  return [e, r ? (s) => t(r(s)) : t];
}
function Kt(e) {
  let t = false;
  const n = (s) => typeof s == "string" ? { value: s } : s, r = Jt(createSignal(n(e.get()), { equals: (s, a) => s.value === a.value && s.state === a.state }), void 0, (s) => (!t && e.set(s), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), s));
  return e.init && onCleanup(e.init((s = e.get()) => {
    t = true, r[1](n(s)), t = false;
  })), Xe({ signal: r, create: e.create, utils: e.utils });
}
function Yt(e, t, n) {
  return e.addEventListener(t, n), () => e.removeEventListener(t, n);
}
function Qt(e, t) {
  const n = e && document.getElementById(e);
  n ? n.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Xt(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function Zt(e) {
  let t;
  const n = { value: e.url || (t = getRequestEvent()) && Xt(t.request.url) || "" };
  return Xe({ signal: [() => n, (r) => Object.assign(n, r)] })(e);
}
const en = /* @__PURE__ */ new Map();
function tn(e = true, t = false, n = "/_server", r) {
  return (s) => {
    const a = s.base.path(), i = s.navigatorFactory(s.base);
    let o, c;
    function l(u) {
      return u.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function m(u) {
      if (u.defaultPrevented || u.button !== 0 || u.metaKey || u.altKey || u.ctrlKey || u.shiftKey) return;
      const d = u.composedPath().find((H) => H instanceof Node && H.nodeName.toUpperCase() === "A");
      if (!d || t && !d.hasAttribute("link")) return;
      const b = l(d), y = b ? d.href.baseVal : d.href;
      if ((b ? d.target.baseVal : d.target) || !y && !d.hasAttribute("state")) return;
      const P = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || P && P.includes("external")) return;
      const R = b ? new URL(y, document.baseURI) : new URL(y);
      if (!(R.origin !== window.location.origin || a && R.pathname && !R.pathname.toLowerCase().startsWith(a.toLowerCase()))) return [d, R];
    }
    function v(u) {
      const d = m(u);
      if (!d) return;
      const [b, y] = d, C = s.parsePath(y.pathname + y.search + y.hash), P = b.getAttribute("state");
      u.preventDefault(), i(C, { resolve: false, replace: b.hasAttribute("replace"), scroll: !b.hasAttribute("noscroll"), state: P ? JSON.parse(P) : void 0 });
    }
    function h(u) {
      const d = m(u);
      if (!d) return;
      const [b, y] = d;
      r && (y.pathname = r(y.pathname)), s.preloadRoute(y, b.getAttribute("preload") !== "false");
    }
    function g(u) {
      clearTimeout(o);
      const d = m(u);
      if (!d) return c = null;
      const [b, y] = d;
      c !== b && (r && (y.pathname = r(y.pathname)), o = setTimeout(() => {
        s.preloadRoute(y, b.getAttribute("preload") !== "false"), c = b;
      }, 20));
    }
    function E(u) {
      if (u.defaultPrevented) return;
      let d = u.submitter && u.submitter.hasAttribute("formaction") ? u.submitter.getAttribute("formaction") : u.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const y = new URL(d, Ve);
        if (d = s.parsePath(y.pathname + y.search), !d.startsWith(n)) return;
      }
      if (u.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const b = en.get(d);
      if (b) {
        u.preventDefault();
        const y = new FormData(u.target, u.submitter);
        b.call({ r: s, f: u.target }, u.target.enctype === "multipart/form-data" ? y : new URLSearchParams(y));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", v), e && (document.addEventListener("mousemove", g, { passive: true }), document.addEventListener("focusin", h, { passive: true }), document.addEventListener("touchstart", h, { passive: true })), document.addEventListener("submit", E), onCleanup(() => {
      document.removeEventListener("click", v), e && (document.removeEventListener("mousemove", g), document.removeEventListener("focusin", h), document.removeEventListener("touchstart", h)), document.removeEventListener("submit", E);
    });
  };
}
function nn(e) {
  if (isServer) return Zt(e);
  const t = () => {
    const r = window.location.pathname.replace(/^\/+/, "/") + window.location.search, s = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: r + window.location.hash, state: s };
  }, n = qe();
  return Kt({ get: t, set({ value: r, replace: s, scroll: a, state: i }) {
    s ? window.history.replaceState(Pt(i), "", r) : window.history.pushState(i, "", r), Qt(decodeURIComponent(window.location.hash.slice(1)), a), pe();
  }, init: (r) => Yt(window, "popstate", _t(r, (s) => {
    if (s) return !n.confirm(s);
    {
      const a = t();
      return !n.confirm(a.value, { state: a.state });
    }
  })), create: tn(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (r) => window.history.go(r), beforeLeave: n } })(e);
}
function ke(e) {
  e = mergeProps({ inactiveClass: "inactive", activeClass: "active" }, e);
  const [, t] = splitProps(e, ["href", "state", "class", "activeClass", "inactiveClass", "end"]), n = Ut(() => e.href), r = Ft(n), s = ye(), a = createMemo(() => {
    const i = n();
    if (i === void 0) return [false, false];
    const o = T(i.split(/[?#]/, 1)[0]).toLowerCase(), c = decodeURI(T(s.pathname).toLowerCase());
    return [e.end ? o === c : c.startsWith(o + "/") || c === o, o === c];
  });
  return ssrElement("a", mergeProps$1(t, { get href() {
    return r() || e.href;
  }, get state() {
    return JSON.stringify(e.state);
  }, get classList() {
    return { ...e.class && { [e.class]: true }, [e.inactiveClass]: !a()[0], [e.activeClass]: a()[0], ...t.classList };
  }, link: true, get "aria-current"() {
    return a()[1] ? "page" : void 0;
  } }), void 0, true);
}
const ve = "yaba", Ze = `idsvc_refresh_${ve}`, [et, rn] = createSignal(null), sn = () => typeof localStorage < "u" ? localStorage.getItem(Ze) : null;
function an() {
  rn(null), typeof localStorage < "u" && localStorage.removeItem(Ze);
}
function re() {
  const e = et();
  if (!e) return null;
  try {
    return JSON.parse(atob(e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
const on = () => et(), be = () => !!re();
function cn() {
  var _a, _b;
  const e = re();
  return e ? e.superadmin ? ["superadmin"] : ((_b = (_a = e.apps) == null ? void 0 : _a[ve]) == null ? void 0 : _b.roles) || [] : [];
}
function we() {
  var _a, _b, _c;
  return ((_c = (_b = (_a = re()) == null ? void 0 : _a.apps) == null ? void 0 : _b[ve]) == null ? void 0 : _c.scope) || {};
}
function ln() {
  var _a;
  return !!((_a = re()) == null ? void 0 : _a.superadmin);
}
let Q = null;
function un() {
  return Q || (Q = (async () => (sn(), false))(), Q);
}
const dn = "https://ssgloghr.com/auth", J = "ssgl_access_tkn", Ee = "auth_user";
function Ae(e) {
  if (typeof document > "u") return null;
  const t = decodeURIComponent(document.cookie);
  for (const n of t.split("; ")) if (n.startsWith(e + "=")) return n.substring(e.length + 1);
  return null;
}
function fn(e, t, n = 365) {
  if (typeof document > "u") return;
  const r = new Date(Date.now() + n * 24 * 60 * 60 * 1e3), s = typeof location < "u" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${e}=${t}; expires=${r.toUTCString()}; path=/; SameSite=Lax${s}`;
}
function mn(e) {
  typeof document > "u" || (document.cookie = `${e}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`);
}
function hn() {
  if (typeof localStorage > "u") return null;
  try {
    const e = localStorage.getItem(Ee);
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
}
const [I, tt] = createSignal(hn()), [pn, nt] = createSignal(Ae(J)), [ie, F] = createSignal(true), j = () => !!pn() && !!I();
function V(e) {
  if (typeof e == "boolean") return e;
  if (typeof e == "number") return e === 1;
  if (typeof e == "string") {
    const t = e.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes";
  }
  return false;
}
function rt() {
  var _a, _b;
  if (be()) return ln() || cn().includes("admin") || V((_a = we().flags) == null ? void 0 : _a.isAdmin);
  const e = I();
  return V((_b = e == null ? void 0 : e.permissions) == null ? void 0 : _b.isAdmin) || V(e == null ? void 0 : e.isAdmin);
}
function Se(e) {
  var _a, _b, _c;
  return e ? j() ? rt() ? true : be() ? V((_a = we().flags) == null ? void 0 : _a[e]) : V((_c = (_b = I()) == null ? void 0 : _b.permissions) == null ? void 0 : _c[e]) : false : true;
}
function Oe() {
  var _a, _b;
  return be() ? we().businessId || ((_a = I()) == null ? void 0 : _a.businessId) || "" : ((_b = I()) == null ? void 0 : _b.businessId) || "";
}
function gn(e, t) {
  fn(J, e), localStorage.setItem(Ee, JSON.stringify(t)), nt(e), tt(t);
}
function ee() {
  an(), mn(J), typeof localStorage < "u" && localStorage.removeItem(Ee), nt(null), tt(null);
}
async function yn(e) {
  var _a, _b, _c, _d;
  const t = e || Ae(J);
  if (!t) return F(false), false;
  try {
    const n = await fetch(`${dn}/verify-signature`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: t }, body: JSON.stringify({ token: t }) });
    if (n.status === 401 || n.status === 500) return ee(), F(false), false;
    if (!n.ok) throw new Error(`HTTP ${n.status}`);
    const r = await n.json();
    if ((r == null ? void 0 : r.valid) && (r == null ? void 0 : r.user)) {
      const s = { id: r.user.originalUserId || r.user.uid || r.user.id || "", originalUserId: r.user.originalUserId, email: r.user.email || "", name: r.user.displayName || r.user.name || "", picture: r.user.photoURL || r.user.picture || "", businessId: r.user.businessId || "", isAdmin: ((_b = (_a = r.user) == null ? void 0 : _a.permissions) == null ? void 0 : _b.isAdmin) || ((_c = r.user) == null ? void 0 : _c.isAdmin) || "", permissions: ((_d = r.user) == null ? void 0 : _d.permissions) || {} };
      return gn(t, s), F(false), true;
    }
    return ee(), F(false), false;
  } catch {
    return ee(), F(false), false;
  }
}
async function vn() {
  await un().catch(() => {
  });
  const e = Ae(J);
  e ? await yn(e) : (ee(), F(false));
}
var bn = ["<div", ' class="px-3 py-2 mb-1"><div class="text-sm font-medium text-gray-900 truncate">', '</div><div class="text-xs text-gray-500 truncate">', "</div></div>"], wn = ["<button", ' class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign out</button>'], En = ["<div", ' class="min-h-screen flex"><aside class="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white"><div class="px-6 py-5 border-b border-gray-100"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">P</div><div><div class="font-semibold text-gray-900 leading-tight">Paito</div><div class="text-xs text-gray-500">Logistics</div></div></div></div><nav class="flex-1 px-3 py-4 space-y-1">', '</nav><div class="px-3 py-3 border-t border-gray-100">', '</div></aside><div class="flex-1 flex flex-col min-w-0"><header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-semibold">P</div><span class="font-semibold">Paito</span></div><nav class="flex items-center gap-1">', '</nav></header><main class="flex-1 overflow-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', "</div></main></div></div>"], An = ["<svg", ' class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path', "></path></svg>"];
const Sn = [{ href: "/", label: "Dashboard", perm: null, icon: "M3 12l9-9 9 9M5 10v10h14V10" }, { href: "/invoices", label: "Invoices", perm: "invoiceAccess", icon: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6" }, { href: "/bultos", label: "Bultos", perm: "invoiceAccess", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/tariffs", label: "Tarifas", perm: "offersManagementAccess", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" }, { href: "/inventory", label: "Inventario", perm: "InventoryAccess", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/ops", label: "Operaciones", perm: "OpsAccess", icon: "M12 2l3 3-3 3M3 12h18M12 22l-3-3 3-3M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" }, { href: "/loans", label: "Pr\xE9stamos", perm: "isAdmin", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }, { href: "/admin", label: "Usuarios", perm: "isAdmin", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" }], Me = () => Sn.filter((e) => Se(e.perm));
function xn(e) {
  const t = ye(), n = (r) => r === "/" ? t.pathname === "/" : t.pathname.startsWith(r);
  return ssr(En, ssrHydrationKey(), escape(createComponent(For, { get each() {
    return Me();
  }, children: (r) => createComponent(ke, { get href() {
    return r.href;
  }, class: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", get classList() {
    return { "bg-brand-50 text-brand-700": n(r.href), "text-gray-700 hover:bg-gray-50 hover:text-gray-900": !n(r.href) };
  }, get children() {
    return [ssr(An, ssrHydrationKey(), ssrAttribute("d", escape(r.icon, true), false)), r.label];
  } }) })), escape(createComponent(Show, { get when() {
    return I();
  }, get children() {
    var _a, _b;
    return [ssr(bn, ssrHydrationKey(), escape((_a = I()) == null ? void 0 : _a.name), escape((_b = I()) == null ? void 0 : _b.email)), ssr(wn, ssrHydrationKey())];
  } })), escape(createComponent(For, { get each() {
    return Me();
  }, children: (r) => createComponent(ke, { get href() {
    return r.href;
  }, class: "px-2 py-1 text-xs rounded-md", get classList() {
    return { "bg-brand-50 text-brand-700": n(r.href), "text-gray-600": !n(r.href) };
  }, get children() {
    return r.label;
  } }) })), escape(e.children));
}
var In = ["<svg", ' viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>'];
function Pn(e) {
  var _a;
  return ssr(In, ssrHydrationKey() + ssrAttribute("class", escape(["animate-spin text-gray-400", (_a = e.class) != null ? _a : "w-5 h-5"].join(" "), true), false));
}
const z = { state: { get profile() {
  return I();
}, get user() {
  return I();
}, get stores() {
  return [];
} }, get currentUser() {
  return I();
}, getBusinessId() {
  return Oe();
}, getBusinessIds() {
  return [Oe()].filter(Boolean);
}, isAdmin() {
  return rt();
}, can(e) {
  return Se(e);
}, signOut() {
} }, G = (e = 4) => {
  const t = "0123456789BCDFGKSY";
  let n = "";
  for (let r = 0; r < e; r++) n += t.charAt(Math.floor(Math.random() * t.length));
  return n;
};
function _n(e) {
  const t = e + "=", r = decodeURIComponent(document.cookie).split("; ");
  let s;
  return r.forEach((a) => {
    a.indexOf(t) === 0 && (s = a.substring(t.length));
  }), s;
}
const Cn = async (e) => {
  var _a;
  const t = on(), n = _n("ssgl_access_tkn") || "", r = t ? `Bearer ${t}` : n, a = await fetch("https://ssgloghr.com/api/query", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br", Authorization: r }, body: JSON.stringify(e) });
  if (a.status, !a.ok) throw new Error(`HTTP error! status: ${a.status}`);
  const i = await a.json();
  if (i.errors) throw new Error(((_a = i.errors[0]) == null ? void 0 : _a.message) || "GraphQL error");
  return i.data;
};
function U(e, t = {}) {
  const { params: n = {}, form: r, queryString: s, scope: a, extra: i } = t, o = { ...n };
  a !== false && (o.businessId = a === void 0 ? z.getBusinessId() : a);
  const c = { query: e, params: o, ...i != null ? i : {} };
  return r !== void 0 && (c.form = r), s !== void 0 && (c.queryString = s), Cn(c);
}
const st = (e) => Array.from({ length: e }, (t, n) => `!* contain :search${n}`).join(" AND ");
st(5);
st(6);
const oe = () => {
  var _a, _b;
  return (_b = (_a = z.state) == null ? void 0 : _a.user) == null ? void 0 : _b.uid;
}, Be = () => (/* @__PURE__ */ new Date()).getTime(), ce = () => (/* @__PURE__ */ new Date()).toISOString(), Rn = { async list(e) {
  const t = {};
  return (e == null ? void 0 : e.method) && (t.method = e.method), (e == null ? void 0 : e.category) && (t.category = e.category), (await U("listTariffOffers", { params: t })).data || [];
}, async get(e) {
  const t = await U("getTariffOffer", { params: { id: e } });
  return t.data || t;
}, async create(e, t) {
  var _a, _b;
  const n = (t == null ? void 0 : t.businessId) || z.getBusinessId(), r = (t == null ? void 0 : t.code) || `${G(6)}_${G(6)}`, s = await U("createTariffOffer", { scope: n, params: { userId: oe(), timestamp: Be() }, form: { id: G(16), offerCode: r, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: n, data: e, createdAt: ce(), updatedAt: ce() } });
  return s.data || s;
}, async update(e, t, n) {
  const r = (n == null ? void 0 : n.originalBusinessId) || (n == null ? void 0 : n.businessId) || z.getBusinessId(), s = { data: t, updatedAt: ce() };
  (n == null ? void 0 : n.name) && (s.offerName = n.name), (n == null ? void 0 : n.code) && (s.offerCode = n.code), (n == null ? void 0 : n.isActive) !== void 0 && (s.isActive = n.isActive), (n == null ? void 0 : n.isVisible) !== void 0 && (s.isVisible = n.isVisible), (n == null ? void 0 : n.businessId) && (s.businessId = n.businessId);
  const a = await U("updateTariffOffer", { scope: r, params: { id: e, userId: oe(), timestamp: Be() }, form: s });
  return a.data || a;
}, async delete(e) {
  try {
    return await U("deleteTariffOffer", { params: { id: e, userId: oe() } }), { success: true, message: "Tarifa eliminada exitosamente" };
  } catch (t) {
    return console.error("Error deleting tariff offer:", t), { success: false, message: (t == null ? void 0 : t.message) || "Error al eliminar tarifa" };
  }
}, async validate(e, t) {
  var _a, _b;
  const n = (t == null ? void 0 : t.businessId) || z.getBusinessId(), r = (t == null ? void 0 : t.code) || `${G(6)}_${G(6)}`, s = await U("validateTariffOffer", { scope: n, form: { offerCode: r, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: n, data: e } });
  return s.data || s;
} }, Ln = [{ id: "kitchen_appliances", name: "Kitchen Appliances", nameEs: "Electrodom\xE9sticos de Cocina", icon: "\u{1F373}", items: [{ id: "batidora", name: "Blender/Mixer", nameEs: "Batidora", price: 3 }, { id: "hornilla", name: "Hot Plate/Burner", nameEs: "Hornilla", price: 3 }, { id: "ventilador", name: "Fan", nameEs: "Ventilador", price: 3 }, { id: "olla_arrocera", name: "Rice Cooker", nameEs: "Olla Arrocera", price: 4 }, { id: "olla_presion", name: "Pressure Cooker", nameEs: "Olla de Presi\xF3n", price: 4 }, { id: "freidora", name: "Air Fryer", nameEs: "Freidora", price: 4 }, { id: "cofitera", name: "Coffee Maker", nameEs: "Cafetera", price: 3 }] }, { id: "lighting", name: "Lighting", nameEs: "Iluminaci\xF3n", icon: "\u{1F4A1}", items: [{ id: "linterna", name: "Flashlight (all types)", nameEs: "Linterna (todo tipo)", price: 2.5 }] }, { id: "home", name: "Home & Furniture", nameEs: "Hogar", icon: "\u{1F3E0}", items: [{ id: "utiles_hogar", name: "Household Items", nameEs: "\xDAtiles del Hogar", price: 5 }, { id: "colchones", name: "Mattress", nameEs: "Colchones", price: 20 }, { id: "camas", name: "Bed Frame", nameEs: "Camas", price: 20 }, { id: "gavetero", name: "Dresser", nameEs: "Gavetero", price: 20 }, { id: "juego_muebles", name: "Furniture Set (Living/Dining/Patio)", nameEs: "Juego de Muebles (Sala/Comedor/Patio)", price: 150 }, { id: "sillon_electrico", name: "Electric Recliner", nameEs: "Sill\xF3n El\xE9ctrico", price: 30 }, { id: "sillon_normal", name: "Regular Armchair", nameEs: "Sill\xF3n Normal", price: 0, note: "Free" }, { id: "silla_enfermo", name: "Medical Chair", nameEs: "Silla de Enfermo", price: null, note: "Contact for quote" }, { id: "waterpump", name: "Water Pump", nameEs: "Turbina de Agua", price: 15 }, { id: "microwaveS", name: "Small Microwave", nameEs: "Microwave Pequeno", price: 4 }, { id: "microwaveB", name: "Big Microwave", nameEs: "Microwave Grande", price: 7 }] }, { id: "electronics", name: "Electronics", nameEs: "Electr\xF3nica", icon: "\u{1F4F1}", items: [{ id: "telefono", name: "Phone", nameEs: "Tel\xE9fono", price: 10 }, { id: "laptop", name: "Laptop", nameEs: "Laptop", price: 20, note: "+ weight charge" }, { id: "computadora", name: "Desktop Computer", nameEs: "Computadora", price: 80 }, { id: "tv_hasta_55", name: 'TV up to 55"', nameEs: 'Televisor hasta 55"', price: 60 }, { id: "tv_mas_55", name: 'TV over 55"', nameEs: 'Televisor m\xE1s de 55"', price: 80 }, { id: "playstation", name: "PlayStation", nameEs: "PlayStation", price: 150 }, { id: "speaker", name: "Speaker", nameEs: "Bocina", price: 20 }, { id: "generator", name: "Generator", nameEs: "Generador", price: 40 }, { id: "lithium_battery", name: "Lithium Battery", nameEs: "Bateria de Litio", price: 50 }] }, { id: "refrigeration", name: "Refrigeration", nameEs: "Refrigeraci\xF3n", icon: "\u2744\uFE0F", items: [{ id: "nevera", name: "Freezer", nameEs: "Nevera", price: 40 }, { id: "refrigerador", name: "Refrigerator", nameEs: "Refrigerador", price: 40 }, { id: "aire_acondicionado", name: "Air Conditioner", nameEs: "Aire Acondicionado", price: 20 }] }, { id: "security", name: "Security", nameEs: "Seguridad", icon: "\u{1F4F9}", items: [{ id: "sistema_camaras", name: "Camera System", nameEs: "Sistema de C\xE1maras", price: 150 }, { id: "camara_individual", name: "Individual Camera", nameEs: "C\xE1mara Individual", price: 20 }] }, { id: "tools", name: "Tools", nameEs: "Herramientas", icon: "\u{1F527}", items: [{ id: "herramientas_variadas", name: "Assorted Tools", nameEs: "Herramientas Variadas", price: 10 }, { id: "herramientas_motor", name: "Power Tools", nameEs: "Herramientas con Motor", price: 15 }] }, { id: "transport_recreation", name: "Transport & Recreation", nameEs: "Transporte y Recreaci\xF3n", icon: "\u{1F6B2}", items: [{ id: "scooter", name: "Scooter (large or small)", nameEs: "Scooter (grande o chica)", price: 40 }, { id: "equipos_gym", name: "Gym Equipment", nameEs: "Equipos de Gym", price: 60 }, { id: "bicicleta_normal", name: "Regular Bicycle", nameEs: "Bicicleta Normal", price: 30 }, { id: "bicicleta_electrica", name: "Electric Bicycle", nameEs: "Bicicleta El\xE9ctrica", price: 60 }, { id: "juguetes_bateria_10kg", name: "Battery Toys (up to 10kg)", nameEs: "Juguetes con Bater\xEDa (hasta 10kg)", price: 15 }, { id: "juguetes_bateria_mas_10kg", name: "Battery Toys (over 10kg)", nameEs: "Juguetes con Bater\xEDa (m\xE1s de 10kg)", price: 20 }, { id: "tires", name: "Tires", nameEs: "Gomas de Carro", price: 20 }] }, { id: "parts_by_weight", name: "Parts by Weight", nameEs: "Piezas por Peso", icon: "\u2696\uFE0F", items: [{ id: "piezas_hasta_10kg", name: "Parts up to 10kg (22lbs)", nameEs: "Piezas hasta 10kg", price: 40 }, { id: "piezas_10_20kg", name: "Parts 10-20kg (22-44lbs)", nameEs: "Piezas de 10kg a 20kg", price: 60 }, { id: "piezas_mas_20kg", name: "Parts over 20kg (44lbs+)", nameEs: "Piezas m\xE1s de 20kg", price: 80 }] }, { id: "essentials", name: "Essentials (Free)", nameEs: "Esenciales (Gratis)", icon: "\u{1F193}", items: [{ id: "comida", name: "Food", nameEs: "Comida", price: 0, note: "Gratis" }, { id: "medicina", name: "Medicine", nameEs: "Medicina", price: 0, note: "Gratis" }, { id: "aseo", name: "Toiletries/Hygiene", nameEs: "Aseo", price: 0, note: "Gratis" }, { id: "ropa", name: "Clothing", nameEs: "Ropa", price: 0, note: "Gratis" }, { id: "zapatos", name: "Shoes", nameEs: "Zapatos", price: 0, note: "Gratis" }] }, { id: "other", name: "Other", nameEs: "Otros", icon: "\u{1F4E6}", items: [{ id: "articulos_medicos", name: "Medical Equipment", nameEs: "Art\xEDculos de Uso M\xE9dico", price: 0, note: "Gratis" }, { id: "sistema_pesca", name: "Fishing Gear", nameEs: "Sistema de Pesca", price: 40 }, { id: "extraTariff", name: "Extra Tariff", nameEs: "Tarifas extras", price: 3 }] }], Tn = { weekly: { tiers: [] }, biweekly: { tiers: [] }, special: { tiers: [] } }, kn = { weekly: { miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }, cycles: [{ id: "weekly", label: "Semanal", miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }], unit: "USD per lb", boxes: [{ id: "box_14x14x14", name: "Box 14x14x14", nameEs: "Caja 14x14x14", dimensions: "14x14x14", price: 60, maxLbs: 80 }] }, On = [{ address: "4105 E 4 Ave", city: "Hialeah", zip: "33013", phone: "786-587-0068" }, { address: "6895 W 4 Ave", city: "Hialeah", zip: "33014", phone: "786-487-4037" }], le = { company: "PAITO LOGISTICS", currency: "USD", coverage: "Env\xEDos a toda Cuba hasta la puerta de tu casa, incluyendo la Isla de la Juventud" }, Mn = { MISCELANEAS: { over50items: 2.99, under50items: 3.99, description: "Ropa, zapatos, accesorios, art\xEDculos personales" }, DURADEROS: { price: 4.5, description: "Electr\xF3nicos, electrodom\xE9sticos, herramientas", arancel: { ranges: [{ min: 0, max: 5, cost: 5 }, { min: 5, max: 20, cost: 10 }, { min: 20, max: 50, cost: 20 }, { min: 50, max: 100, cost: 35 }, { min: 100, max: 1 / 0, cost: 50 }] } }, LITHIUM_BATTERIES: { price: 8.99, description: "Bater\xEDas de litio, power banks, equipos con bater\xEDa de litio" }, EXCLUSIVE: { price: 6.99, description: "TVs, computadoras, generadores (bulto exclusivo)" }, DOCUMENTS: { price: 1.99, description: "Documentos, papeles, certificados" }, baseTransportCost: 20 }, Bn = { schemaVersion: 1, branding: { company: le.company, currency: le.currency, coverage: le.coverage, locations: On }, itemTariffs: Ln, airShipping: Tn, maritimeShipping: kn, dynamicPricing: Mn }, at = "yaba-active-tariff-id", [Un, X] = createSignal(null), [Qn, ue] = createSignal(null), [Xn, Fn] = createSignal([]), [Zn, Ue] = createSignal(false), [er, de] = createSignal(null);
function Nn(e) {
  var _a, _b, _c, _d, _e;
  const t = (_c = (_b = (_a = e.dynamicPricing) == null ? void 0 : _a.DURADEROS) == null ? void 0 : _b.arancel) == null ? void 0 : _c.ranges;
  if (Array.isArray(t)) for (const n of t) (n.max === null || n.max === void 0) && (n.max = 1 / 0);
  for (const n of ["weekly", "biweekly", "special"]) {
    const r = (_e = (_d = e.airShipping) == null ? void 0 : _d[n]) == null ? void 0 : _e.tiers;
    if (Array.isArray(r)) for (const s of r) (s.maxLbs === null || s.maxLbs === void 0) && (s.maxLbs = 1 / 0);
  }
  return e;
}
function Fe(e) {
  try {
    const t = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data;
    if (!t) return null;
    const n = t.schemaVersion ? t : t.config;
    return !n || typeof n != "object" ? null : Nn({ ...Bn, ...n });
  } catch {
    return null;
  }
}
function $n(e) {
  var _a, _b, _c;
  try {
    return ((_c = (_b = (_a = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data) == null ? void 0 : _a.isActive) != null ? _b : e == null ? void 0 : e.isActive) != null ? _c : true) !== false;
  } catch {
    return false;
  }
}
function Dn() {
  return typeof localStorage < "u" ? localStorage.getItem(at) : null;
}
function Hn(e) {
  typeof localStorage < "u" && localStorage.setItem(at, e);
}
async function Gn(e) {
  try {
    Ue(true), de(null);
    const n = (await Rn.list()).filter($n);
    if (Fn(n), n.length === 0) return X(null), ue(null), null;
    const r = Dn(), s = e && n.find((o) => o.id === e) || r && n.find((o) => o.id === r) || n[0];
    let a = s, i = Fe(a);
    if (!i) {
      for (const o of n) if (o !== s && (i = Fe(o), i)) {
        a = o;
        break;
      }
    }
    return i ? (X(i), ue(a.id), Hn(a.id), i) : (de("No se pudo leer ninguna oferta de tarifa"), X(null), ue(null), null);
  } catch (t) {
    de((t == null ? void 0 : t.message) || "Error loading tariff config");
    const n = Un();
    return n || X(null), n;
  } finally {
    Ue(false);
  }
}
var jn = ["<div", ' class="min-h-screen grid place-items-center">', "</div>"];
function qn(e) {
  const t = ye(), n = Nt();
  onMount(() => {
    vn();
  });
  const r = () => t.pathname === "/login" || t.pathname === "/callback", s = { "/invoices": "invoiceAccess", "/tariffs": "offersManagementAccess", "/inventory": "InventoryAccess", "/ops": "OpsAccess", "/loans": "isAdmin", "/admin": "isAdmin" }, a = () => {
    const i = Object.keys(s).find((o) => t.pathname.startsWith(o));
    return i ? s[i] : null;
  };
  return createEffect(() => {
    ie() || (!j() && !r() ? n("/login", { replace: true }) : j() && t.pathname === "/login" ? n("/", { replace: true }) : j() && !Se(a()) && n("/", { replace: true }));
  }), createEffect(() => {
    !ie() && j() && Gn();
  }), createComponent(Show, { get when() {
    return !ie();
  }, get fallback() {
    return ssr(jn, ssrHydrationKey(), escape(createComponent(Pn, { class: "w-8 h-8" })));
  }, get children() {
    return createComponent(Show, { get when() {
      return !r();
    }, get fallback() {
      return createComponent(Suspense, { get children() {
        return e.children;
      } });
    }, get children() {
      return createComponent(xn, { get children() {
        return createComponent(Suspense, { get children() {
          return e.children;
        } });
      } });
    } });
  } });
}
function tr() {
  return createComponent(nn, { root: qn, get children() {
    return createComponent(au, {});
  } });
}

export { tr as default };
//# sourceMappingURL=app-8Z9b9u4K.mjs.map
