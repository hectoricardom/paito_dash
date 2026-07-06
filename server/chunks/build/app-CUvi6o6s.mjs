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

function Fe() {
  let e = /* @__PURE__ */ new Set();
  function t(a) {
    return e.add(a), () => e.delete(a);
  }
  let n = false;
  function r(a, s) {
    if (n) return !(n = false);
    const i = { to: a, options: s, defaultPrevented: false, preventDefault: () => i.defaultPrevented = true };
    for (const o of e) o.listener({ ...i, from: o.location, retry: (c) => {
      c && (n = true), o.navigate(a, { ...s, resolve: false });
    } });
    return !i.defaultPrevented;
  }
  return { subscribe: t, confirm: r };
}
let le;
function fe() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), le = window.history.state._depth;
}
isServer || fe();
function gt(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function vt(e, t) {
  let n = false;
  return () => {
    const r = le;
    fe();
    const a = r == null ? null : le - r;
    if (n) {
      n = false;
      return;
    }
    a && t(a) ? (n = true, window.history.go(-a)) : e();
  };
}
const yt = /^(?:[a-z0-9]+:)?\/\//i, bt = /^\/+|(\/)\/+$/g, Ne = "http://sr";
function T(e, t = false) {
  const n = e.replace(bt, "$1");
  return n ? t || /^[?#]/.test(n) ? n : "/" + n : "";
}
function Y(e, t, n) {
  if (yt.test(t)) return;
  const r = T(e), a = n && T(n);
  let s = "";
  return !a || t.startsWith("/") ? s = r : a.toLowerCase().indexOf(r.toLowerCase()) !== 0 ? s = r + a : s = a, (s || "/") + T(t, !s);
}
function wt(e, t) {
  if (e == null) throw new Error(t);
  return e;
}
function Et(e, t) {
  return T(e).replace(/\/*(\*.*)?$/g, "") + T(t);
}
function De(e) {
  const t = {};
  return e.searchParams.forEach((n, r) => {
    r in t ? Array.isArray(t[r]) ? t[r].push(n) : t[r] = [t[r], n] : t[r] = n;
  }), t;
}
function At(e, t, n) {
  const [r, a] = e.split("/*", 2), s = r.split("/").filter(Boolean), i = s.length;
  return (o) => {
    const c = o.split("/").filter(Boolean), l = c.length - i;
    if (l < 0 || l > 0 && a === void 0 && !t) return null;
    const m = { path: i ? "" : "/", params: {} }, y = (h) => n === void 0 ? void 0 : n[h];
    for (let h = 0; h < i; h++) {
      const g = s[h], E = g[0] === ":", u = E ? c[h] : c[h].toLowerCase(), d = E ? g.slice(1) : g.toLowerCase();
      if (E && te(u, y(d))) m.params[d] = u;
      else if (E || !te(u, d)) return null;
      m.path += `/${u}`;
    }
    if (a) {
      const h = l ? c.slice(-l).join("/") : "";
      if (te(h, y(a))) m.params[a] = h;
      else return null;
    }
    return m;
  };
}
function te(e, t) {
  const n = (r) => r === e;
  return t === void 0 ? true : typeof t == "string" ? n(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(n) : t instanceof RegExp ? t.test(e) : false;
}
function xt(e) {
  const [t, n] = e.pattern.split("/*", 2), r = t.split("/").filter(Boolean);
  return r.reduce((a, s) => a + (s.startsWith(":") ? 2 : 3), r.length - (n === void 0 ? 0 : 1));
}
function $e(e) {
  const t = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(r, a) {
    return t.has(a) || runWithOwner(n, () => t.set(a, createMemo(() => e()[a]))), t.get(a)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  }, has(r, a) {
    return a in e();
  } });
}
function Ge(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let n = e.slice(0, t.index), r = e.slice(t.index + t[0].length);
  const a = [n, n += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(r); ) a.push(n += t[1]), r = r.slice(t[0].length);
  return Ge(r).reduce((s, i) => [...s, ...a.map((o) => o + i)], []);
}
const St = 100, He = createContext(), me = createContext(), Z = () => wt(useContext(He), "<A> and 'use' router primitives can be only used inside a Route."), It = () => useContext(me) || Z().base, Ct = (e) => {
  const t = It();
  return createMemo(() => t.resolvePath(e()));
}, Pt = (e) => {
  const t = Z();
  return createMemo(() => {
    const n = e();
    return n !== void 0 ? t.renderPath(n) : n;
  });
}, _t = () => Z().navigatorFactory(), he = () => Z().location;
function Rt(e, t = "") {
  const { component: n, preload: r, load: a, children: s, info: i } = e, o = !s || Array.isArray(s) && !s.length, c = { key: e, component: n, preload: r || a, info: i };
  return je(e.path).reduce((l, m) => {
    for (const y of Ge(m)) {
      const h = Et(t, y);
      let g = o ? h : h.split("/*", 1)[0];
      g = g.split("/").map((E) => E.startsWith(":") || E.startsWith("*") ? E : encodeURIComponent(E)).join("/"), l.push({ ...c, originalPath: m, pattern: g, matcher: At(g, !o, e.matchFilters) });
    }
    return l;
  }, []);
}
function Lt(e, t = 0) {
  return { routes: e, score: xt(e[e.length - 1]) * 1e4 - t, matcher(n) {
    const r = [];
    for (let a = e.length - 1; a >= 0; a--) {
      const s = e[a], i = s.matcher(n);
      if (!i) return null;
      r.unshift({ ...i, route: s });
    }
    return r;
  } };
}
function je(e) {
  return Array.isArray(e) ? e : [e];
}
function qe(e, t = "", n = [], r = []) {
  const a = je(e);
  for (let s = 0, i = a.length; s < i; s++) {
    const o = a[s];
    if (o && typeof o == "object") {
      o.hasOwnProperty("path") || (o.path = "");
      const c = Rt(o, t);
      for (const l of c) {
        n.push(l);
        const m = Array.isArray(o.children) && o.children.length === 0;
        if (o.children && !m) qe(o.children, l.pattern, n, r);
        else {
          const y = Lt([...n], r.length);
          r.push(y);
        }
        n.pop();
      }
    }
  }
  return n.length ? r : r.sort((s, i) => i.score - s.score);
}
function j(e, t) {
  for (let n = 0, r = e.length; n < r; n++) {
    const a = e[n].matcher(t);
    if (a) return a;
  }
  return [];
}
function Tt(e, t, n) {
  const r = new URL(Ne), a = createMemo((m) => {
    const y = e();
    try {
      return new URL(y, r);
    } catch {
      return console.error(`Invalid path ${y}`), m;
    }
  }, r, { equals: (m, y) => m.href === y.href }), s = createMemo(() => a().pathname), i = createMemo(() => a().search, true), o = createMemo(() => a().hash), c = () => "", l = on$1(i, () => De(a()));
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
  }, query: n ? n(l) : $e(l) };
}
let L;
function kt() {
  return L;
}
function Ot(e, t, n, r = {}) {
  const { signal: [a, s], utils: i = {} } = e, o = i.parsePath || ((f) => f), c = i.renderPath || ((f) => f), l = i.beforeLeave || Fe(), m = Y("", r.base || "");
  if (m === void 0) throw new Error(`${m} is not a valid base path`);
  m && !a().value && s({ value: m, replace: true, scroll: false });
  const [y, h] = createSignal(false);
  let g;
  const E = (f, p) => {
    p.value === u() && p.state === b() || (g === void 0 && h(true), L = f, g = p, startTransition(() => {
      g === p && (d(g.value), v(g.state), resetErrorBoundaries(), isServer || R[1]((A) => A.filter((k) => k.pending)));
    }).finally(() => {
      g === p && batch(() => {
        L = void 0, f === "navigate" && Ze(g), h(false), g = void 0;
      });
    }));
  }, [u, d] = createSignal(a().value), [b, v] = createSignal(a().state), _ = Tt(u, b, i.queryWrapper), I = [], R = createSignal(isServer ? tt() : []), G = createMemo(() => typeof r.transformUrl == "function" ? j(t(), r.transformUrl(_.pathname)) : j(t(), _.pathname)), ve = () => {
    const f = G(), p = {};
    for (let A = 0; A < f.length; A++) Object.assign(p, f[A].params);
    return p;
  }, Ye = i.paramsWrapper ? i.paramsWrapper(ve, t) : $e(ve), ye = { pattern: m, path: () => m, outlet: () => null, resolvePath(f) {
    return Y(m, f);
  } };
  return createRenderEffect(on$1(a, (f) => E("native", f), { defer: true })), { base: ye, location: _, params: Ye, isRouting: y, renderPath: c, parsePath: o, navigatorFactory: Xe, matches: G, beforeLeave: l, preloadRoute: et, singleFlight: r.singleFlight === void 0 ? true : r.singleFlight, submissions: R };
  function Qe(f, p, A) {
    untrack(() => {
      if (typeof p == "number") {
        p && (i.go ? i.go(p) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const k = !p || p[0] === "?", { replace: W, resolve: O, scroll: J, state: B } = { replace: false, resolve: !k, scroll: true, ...A }, M = O ? f.resolvePath(p) : Y(k && _.pathname || "", p);
      if (M === void 0) throw new Error(`Path '${p}' is not a routable path`);
      if (I.length >= St) throw new Error("Too many redirects");
      const be = u();
      if (M !== be || B !== b()) if (isServer) {
        const we = getRequestEvent();
        we && (we.response = { status: 302, headers: new Headers({ Location: M }) }), s({ value: M, replace: W, scroll: J, state: B });
      } else l.confirm(M, A) && (I.push({ value: be, replace: W, scroll: J, state: b() }), E("navigate", { value: M, state: B }));
    });
  }
  function Xe(f) {
    return f = f || useContext(me) || ye, (p, A) => Qe(f, p, A);
  }
  function Ze(f) {
    const p = I[0];
    p && (s({ ...f, replace: p.replace, scroll: p.scroll }), I.length = 0);
  }
  function et(f, p) {
    const A = j(t(), f.pathname), k = L;
    L = "preload";
    for (let W in A) {
      const { route: O, params: J } = A[W];
      O.component && O.component.preload && O.component.preload();
      const { preload: B } = O;
      p && B && runWithOwner(n(), () => B({ params: J, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: De(f), state: null, key: "" }, intent: "preload" }));
    }
    L = k;
  }
  function tt() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function Bt(e, t, n, r) {
  const { base: a, location: s, params: i } = e, { pattern: o, component: c, preload: l } = r().route, m = createMemo(() => r().path);
  c && c.preload && c.preload();
  const y = l ? l({ params: i, location: s, intent: L || "initial" }) : void 0;
  return { parent: t, pattern: o, path: m, outlet: () => c ? createComponent$1(c, { params: i, location: s, data: y, get children() {
    return n();
  } }) : n(), resolvePath(g) {
    return Y(a.path(), g, m());
  } };
}
const Ve = (e) => (t) => {
  const { base: n } = t, r = children(() => t.children), a = createMemo(() => qe(r(), t.base || ""));
  let s;
  const i = Ot(e, a, () => s, { base: n, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent(He.Provider, { value: i, get children() {
    return createComponent(Mt, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(s = getOwner()) && null, createComponent(Ut, { routerState: i, get branches() {
        return a();
      } })];
    } });
  } });
};
function Mt(e) {
  const t = e.routerState.location, n = e.routerState.params, r = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: n, location: t, intent: kt() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (a) => createComponent(a, { params: n, location: t, get data() {
    return r();
  }, get children() {
    return e.children;
  } }) });
}
function Ut(e) {
  if (isServer) {
    const a = getRequestEvent();
    if (a && a.router && a.router.dataOnly) {
      Ft(a, e.routerState, e.branches);
      return;
    }
    a && ((a.router || (a.router = {})).matches || (a.router.matches = e.routerState.matches().map(({ route: s, path: i, params: o }) => ({ path: s.originalPath, pattern: s.pattern, match: i, params: o, info: s.info }))));
  }
  const t = [];
  let n;
  const r = createMemo(on$1(e.routerState.matches, (a, s, i) => {
    let o = s && a.length === s.length;
    const c = [];
    for (let l = 0, m = a.length; l < m; l++) {
      const y = s && s[l], h = a[l];
      i && y && h.route.key === y.route.key ? c[l] = i[l] : (o = false, t[l] && t[l](), createRoot((g) => {
        t[l] = g, c[l] = Bt(e.routerState, c[l - 1] || e.routerState.base, Se(() => r()[l + 1]), () => {
          var _a;
          const E = e.routerState.matches();
          return (_a = E[l]) != null ? _a : E[0];
        });
      }));
    }
    return t.splice(a.length).forEach((l) => l()), i && o ? i : (n = c[0], c);
  }));
  return Se(() => r() && n)();
}
const Se = (e) => () => createComponent(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent(me.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function Ft(e, t, n) {
  const r = new URL(e.request.url), a = j(n, new URL(e.router.previousUrl || e.request.url).pathname), s = j(n, r.pathname);
  for (let i = 0; i < s.length; i++) {
    (!a[i] || s[i].route !== a[i].route) && (e.router.dataOnly = true);
    const { route: o, params: c } = s[i];
    o.preload && o.preload({ params: c, location: t.location, intent: "preload" });
  }
}
function Nt([e, t], n, r) {
  return [e, r ? (a) => t(r(a)) : t];
}
function Dt(e) {
  let t = false;
  const n = (a) => typeof a == "string" ? { value: a } : a, r = Nt(createSignal(n(e.get()), { equals: (a, s) => a.value === s.value && a.state === s.state }), void 0, (a) => (!t && e.set(a), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), a));
  return e.init && onCleanup(e.init((a = e.get()) => {
    t = true, r[1](n(a)), t = false;
  })), Ve({ signal: r, create: e.create, utils: e.utils });
}
function $t(e, t, n) {
  return e.addEventListener(t, n), () => e.removeEventListener(t, n);
}
function Gt(e, t) {
  const n = e && document.getElementById(e);
  n ? n.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Ht(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function jt(e) {
  let t;
  const n = { value: e.url || (t = getRequestEvent()) && Ht(t.request.url) || "" };
  return Ve({ signal: [() => n, (r) => Object.assign(n, r)] })(e);
}
const qt = /* @__PURE__ */ new Map();
function Vt(e = true, t = false, n = "/_server", r) {
  return (a) => {
    const s = a.base.path(), i = a.navigatorFactory(a.base);
    let o, c;
    function l(u) {
      return u.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function m(u) {
      if (u.defaultPrevented || u.button !== 0 || u.metaKey || u.altKey || u.ctrlKey || u.shiftKey) return;
      const d = u.composedPath().find((G) => G instanceof Node && G.nodeName.toUpperCase() === "A");
      if (!d || t && !d.hasAttribute("link")) return;
      const b = l(d), v = b ? d.href.baseVal : d.href;
      if ((b ? d.target.baseVal : d.target) || !v && !d.hasAttribute("state")) return;
      const I = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || I && I.includes("external")) return;
      const R = b ? new URL(v, document.baseURI) : new URL(v);
      if (!(R.origin !== window.location.origin || s && R.pathname && !R.pathname.toLowerCase().startsWith(s.toLowerCase()))) return [d, R];
    }
    function y(u) {
      const d = m(u);
      if (!d) return;
      const [b, v] = d, _ = a.parsePath(v.pathname + v.search + v.hash), I = b.getAttribute("state");
      u.preventDefault(), i(_, { resolve: false, replace: b.hasAttribute("replace"), scroll: !b.hasAttribute("noscroll"), state: I ? JSON.parse(I) : void 0 });
    }
    function h(u) {
      const d = m(u);
      if (!d) return;
      const [b, v] = d;
      r && (v.pathname = r(v.pathname)), a.preloadRoute(v, b.getAttribute("preload") !== "false");
    }
    function g(u) {
      clearTimeout(o);
      const d = m(u);
      if (!d) return c = null;
      const [b, v] = d;
      c !== b && (r && (v.pathname = r(v.pathname)), o = setTimeout(() => {
        a.preloadRoute(v, b.getAttribute("preload") !== "false"), c = b;
      }, 20));
    }
    function E(u) {
      if (u.defaultPrevented) return;
      let d = u.submitter && u.submitter.hasAttribute("formaction") ? u.submitter.getAttribute("formaction") : u.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const v = new URL(d, Ne);
        if (d = a.parsePath(v.pathname + v.search), !d.startsWith(n)) return;
      }
      if (u.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const b = qt.get(d);
      if (b) {
        u.preventDefault();
        const v = new FormData(u.target, u.submitter);
        b.call({ r: a, f: u.target }, u.target.enctype === "multipart/form-data" ? v : new URLSearchParams(v));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", y), e && (document.addEventListener("mousemove", g, { passive: true }), document.addEventListener("focusin", h, { passive: true }), document.addEventListener("touchstart", h, { passive: true })), document.addEventListener("submit", E), onCleanup(() => {
      document.removeEventListener("click", y), e && (document.removeEventListener("mousemove", g), document.removeEventListener("focusin", h), document.removeEventListener("touchstart", h)), document.removeEventListener("submit", E);
    });
  };
}
function zt(e) {
  if (isServer) return jt(e);
  const t = () => {
    const r = window.location.pathname.replace(/^\/+/, "/") + window.location.search, a = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: r + window.location.hash, state: a };
  }, n = Fe();
  return Dt({ get: t, set({ value: r, replace: a, scroll: s, state: i }) {
    a ? window.history.replaceState(gt(i), "", r) : window.history.pushState(i, "", r), Gt(decodeURIComponent(window.location.hash.slice(1)), s), fe();
  }, init: (r) => $t(window, "popstate", vt(r, (a) => {
    if (a) return !n.confirm(a);
    {
      const s = t();
      return !n.confirm(s.value, { state: s.state });
    }
  })), create: Vt(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (r) => window.history.go(r), beforeLeave: n } })(e);
}
function Ie(e) {
  e = mergeProps({ inactiveClass: "inactive", activeClass: "active" }, e);
  const [, t] = splitProps(e, ["href", "state", "class", "activeClass", "inactiveClass", "end"]), n = Ct(() => e.href), r = Pt(n), a = he(), s = createMemo(() => {
    const i = n();
    if (i === void 0) return [false, false];
    const o = T(i.split(/[?#]/, 1)[0]).toLowerCase(), c = decodeURI(T(a.pathname).toLowerCase());
    return [e.end ? o === c : c.startsWith(o + "/") || c === o, o === c];
  });
  return ssrElement("a", mergeProps$1(t, { get href() {
    return r() || e.href;
  }, get state() {
    return JSON.stringify(e.state);
  }, get classList() {
    return { ...e.class && { [e.class]: true }, [e.inactiveClass]: !s()[0], [e.activeClass]: s()[0], ...t.classList };
  }, link: true, get "aria-current"() {
    return s()[1] ? "page" : void 0;
  } }), void 0, true);
}
const Wt = "https://ssgloghr.com/auth", z = "ssgl_access_tkn", pe = "auth_user";
function ge(e) {
  if (typeof document > "u") return null;
  const t = decodeURIComponent(document.cookie);
  for (const n of t.split("; ")) if (n.startsWith(e + "=")) return n.substring(e.length + 1);
  return null;
}
function Jt(e, t, n = 365) {
  if (typeof document > "u") return;
  const r = new Date(Date.now() + n * 24 * 60 * 60 * 1e3), a = typeof location < "u" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${e}=${t}; expires=${r.toUTCString()}; path=/; SameSite=Lax${a}`;
}
function Kt(e) {
  typeof document > "u" || (document.cookie = `${e}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`);
}
function Yt() {
  if (typeof localStorage > "u") return null;
  try {
    const e = localStorage.getItem(pe);
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
}
const [C, ze] = createSignal(Yt()), [Qt, We] = createSignal(ge(z)), [ne, F] = createSignal(true), re = () => !!Qt() && !!C();
function Ce() {
  var _a;
  return ((_a = C()) == null ? void 0 : _a.businessId) || "";
}
function Xt(e, t) {
  Jt(z, e), localStorage.setItem(pe, JSON.stringify(t)), We(e), ze(t);
}
function Q() {
  Kt(z), typeof localStorage < "u" && localStorage.removeItem(pe), We(null), ze(null);
}
async function Zt(e) {
  var _a, _b, _c;
  const t = e || ge(z);
  if (!t) return F(false), false;
  try {
    const n = await fetch(`${Wt}/verify-signature`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: t }, body: JSON.stringify({ token: t }) });
    if (n.status === 401 || n.status === 500) return Q(), F(false), false;
    if (!n.ok) throw new Error(`HTTP ${n.status}`);
    const r = await n.json();
    if ((r == null ? void 0 : r.valid) && (r == null ? void 0 : r.user)) {
      const a = { id: r.user.originalUserId || r.user.uid || r.user.id || "", originalUserId: r.user.originalUserId, email: r.user.email || "", name: r.user.displayName || r.user.name || "", picture: r.user.photoURL || r.user.picture || "", businessId: r.user.businessId || "", isAdmin: ((_b = (_a = r.user) == null ? void 0 : _a.permissions) == null ? void 0 : _b.isAdmin) || ((_c = r.user) == null ? void 0 : _c.isAdmin) || "" };
      return Xt(t, a), F(false), true;
    }
    return Q(), F(false), false;
  } catch {
    return Q(), F(false), false;
  }
}
async function en() {
  const e = ge(z);
  e ? await Zt(e) : (Q(), F(false));
}
var tn = ["<div", ' class="px-3 py-2 mb-1"><div class="text-sm font-medium text-gray-900 truncate">', '</div><div class="text-xs text-gray-500 truncate">', "</div></div>"], nn = ["<button", ' class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign out</button>'], rn = ["<div", ' class="min-h-screen flex"><aside class="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white"><div class="px-6 py-5 border-b border-gray-100"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">P</div><div><div class="font-semibold text-gray-900 leading-tight">Paito</div><div class="text-xs text-gray-500">Logistics</div></div></div></div><nav class="flex-1 px-3 py-4 space-y-1">', '</nav><div class="px-3 py-3 border-t border-gray-100">', '</div></aside><div class="flex-1 flex flex-col min-w-0"><header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-semibold">P</div><span class="font-semibold">Paito</span></div><nav class="flex items-center gap-1">', '</nav></header><main class="flex-1 overflow-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', "</div></main></div></div>"], an = ["<svg", ' class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path', "></path></svg>"];
const Pe = [{ href: "/", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" }, { href: "/invoices", label: "Invoices", icon: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6" }, { href: "/tariffs", label: "Tarifas", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" }, { href: "/inventory", label: "Inventario", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/ops", label: "Operaciones", icon: "M12 2l3 3-3 3M3 12h18M12 22l-3-3 3-3M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" }];
function sn(e) {
  const t = he(), n = (r) => r === "/" ? t.pathname === "/" : t.pathname.startsWith(r);
  return ssr(rn, ssrHydrationKey(), escape(createComponent(For, { each: Pe, children: (r) => createComponent(Ie, { get href() {
    return r.href;
  }, class: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", get classList() {
    return { "bg-brand-50 text-brand-700": n(r.href), "text-gray-700 hover:bg-gray-50 hover:text-gray-900": !n(r.href) };
  }, get children() {
    return [ssr(an, ssrHydrationKey(), ssrAttribute("d", escape(r.icon, true), false)), r.label];
  } }) })), escape(createComponent(Show, { get when() {
    return C();
  }, get children() {
    var _a, _b;
    return [ssr(tn, ssrHydrationKey(), escape((_a = C()) == null ? void 0 : _a.name), escape((_b = C()) == null ? void 0 : _b.email)), ssr(nn, ssrHydrationKey())];
  } })), escape(createComponent(For, { each: Pe, children: (r) => createComponent(Ie, { get href() {
    return r.href;
  }, class: "px-2 py-1 text-xs rounded-md", get classList() {
    return { "bg-brand-50 text-brand-700": n(r.href), "text-gray-600": !n(r.href) };
  }, get children() {
    return r.label;
  } }) })), escape(e.children));
}
var on = ["<svg", ' viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>'];
function cn(e) {
  var _a;
  return ssr(on, ssrHydrationKey() + ssrAttribute("class", escape(["animate-spin text-gray-400", (_a = e.class) != null ? _a : "w-5 h-5"].join(" "), true), false));
}
const q = { state: { get profile() {
  return C();
}, get user() {
  return C();
}, get stores() {
  return [];
} }, get currentUser() {
  return C();
}, getBusinessId() {
  return Ce();
}, getBusinessIds() {
  return [Ce()].filter(Boolean);
}, isAdmin() {
  var _a, _b, _c;
  return !!((_a = C()) == null ? void 0 : _a.isAdmin) || !!((_c = (_b = C()) == null ? void 0 : _b.permissions) == null ? void 0 : _c.isAdmin);
}, signOut() {
} }, H = (e = 4) => {
  const t = "0123456789BCDFGKSY";
  let n = "";
  for (let r = 0; r < e; r++) n += t.charAt(Math.floor(Math.random() * t.length));
  return n;
};
function ln(e) {
  const t = e + "=", r = decodeURIComponent(document.cookie).split("; ");
  let a;
  return r.forEach((s) => {
    s.indexOf(t) === 0 && (a = s.substring(t.length));
  }), a;
}
const un = async (e) => {
  var _a;
  const t = ln("ssgl_access_tkn") || "", r = await fetch("https://ssgloghr.com/api/query", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br", Authorization: t }, body: JSON.stringify(e) });
  if (r.status, !r.ok) throw new Error(`HTTP error! status: ${r.status}`);
  const a = await r.json();
  if (a.errors) throw new Error(((_a = a.errors[0]) == null ? void 0 : _a.message) || "GraphQL error");
  return a.data;
};
function U(e, t = {}) {
  const { params: n = {}, form: r, queryString: a, scope: s, extra: i } = t, o = { ...n };
  s !== false && (o.businessId = s === void 0 ? q.getBusinessId() : s);
  const c = { query: e, params: o, ...i != null ? i : {} };
  return r !== void 0 && (c.form = r), a !== void 0 && (c.queryString = a), un(c);
}
const Je = (e) => Array.from({ length: e }, (t, n) => `!* contain :search${n}`).join(" AND ");
Je(5);
Je(6);
const ae = () => {
  var _a, _b;
  return (_b = (_a = q.state) == null ? void 0 : _a.user) == null ? void 0 : _b.uid;
}, _e = () => (/* @__PURE__ */ new Date()).getTime(), se = () => (/* @__PURE__ */ new Date()).toISOString(), dn = { async list(e) {
  const t = {};
  return (e == null ? void 0 : e.method) && (t.method = e.method), (e == null ? void 0 : e.category) && (t.category = e.category), (await U("listTariffOffers", { params: t })).data || [];
}, async get(e) {
  const t = await U("getTariffOffer", { params: { id: e } });
  return t.data || t;
}, async create(e, t) {
  var _a, _b;
  const n = (t == null ? void 0 : t.businessId) || q.getBusinessId(), r = (t == null ? void 0 : t.code) || `${H(6)}_${H(6)}`, a = await U("createTariffOffer", { scope: n, params: { userId: ae(), timestamp: _e() }, form: { id: H(16), offerCode: r, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: n, data: e, createdAt: se(), updatedAt: se() } });
  return a.data || a;
}, async update(e, t, n) {
  const r = (n == null ? void 0 : n.originalBusinessId) || (n == null ? void 0 : n.businessId) || q.getBusinessId(), a = { data: t, updatedAt: se() };
  (n == null ? void 0 : n.name) && (a.offerName = n.name), (n == null ? void 0 : n.code) && (a.offerCode = n.code), (n == null ? void 0 : n.isActive) !== void 0 && (a.isActive = n.isActive), (n == null ? void 0 : n.isVisible) !== void 0 && (a.isVisible = n.isVisible), (n == null ? void 0 : n.businessId) && (a.businessId = n.businessId);
  const s = await U("updateTariffOffer", { scope: r, params: { id: e, userId: ae(), timestamp: _e() }, form: a });
  return s.data || s;
}, async delete(e) {
  try {
    return await U("deleteTariffOffer", { params: { id: e, userId: ae() } }), { success: true, message: "Tarifa eliminada exitosamente" };
  } catch (t) {
    return console.error("Error deleting tariff offer:", t), { success: false, message: (t == null ? void 0 : t.message) || "Error al eliminar tarifa" };
  }
}, async validate(e, t) {
  var _a, _b;
  const n = (t == null ? void 0 : t.businessId) || q.getBusinessId(), r = (t == null ? void 0 : t.code) || `${H(6)}_${H(6)}`, a = await U("validateTariffOffer", { scope: n, form: { offerCode: r, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: n, data: e } });
  return a.data || a;
} }, fn = [{ id: "kitchen_appliances", name: "Kitchen Appliances", nameEs: "Electrodom\xE9sticos de Cocina", icon: "\u{1F373}", items: [{ id: "batidora", name: "Blender/Mixer", nameEs: "Batidora", price: 3 }, { id: "hornilla", name: "Hot Plate/Burner", nameEs: "Hornilla", price: 3 }, { id: "ventilador", name: "Fan", nameEs: "Ventilador", price: 3 }, { id: "olla_arrocera", name: "Rice Cooker", nameEs: "Olla Arrocera", price: 4 }, { id: "olla_presion", name: "Pressure Cooker", nameEs: "Olla de Presi\xF3n", price: 4 }, { id: "freidora", name: "Air Fryer", nameEs: "Freidora", price: 4 }, { id: "cofitera", name: "Coffee Maker", nameEs: "Cafetera", price: 3 }] }, { id: "lighting", name: "Lighting", nameEs: "Iluminaci\xF3n", icon: "\u{1F4A1}", items: [{ id: "linterna", name: "Flashlight (all types)", nameEs: "Linterna (todo tipo)", price: 2.5 }] }, { id: "home", name: "Home & Furniture", nameEs: "Hogar", icon: "\u{1F3E0}", items: [{ id: "utiles_hogar", name: "Household Items", nameEs: "\xDAtiles del Hogar", price: 5 }, { id: "colchones", name: "Mattress", nameEs: "Colchones", price: 20 }, { id: "camas", name: "Bed Frame", nameEs: "Camas", price: 20 }, { id: "gavetero", name: "Dresser", nameEs: "Gavetero", price: 20 }, { id: "juego_muebles", name: "Furniture Set (Living/Dining/Patio)", nameEs: "Juego de Muebles (Sala/Comedor/Patio)", price: 150 }, { id: "sillon_electrico", name: "Electric Recliner", nameEs: "Sill\xF3n El\xE9ctrico", price: 30 }, { id: "sillon_normal", name: "Regular Armchair", nameEs: "Sill\xF3n Normal", price: 0, note: "Free" }, { id: "silla_enfermo", name: "Medical Chair", nameEs: "Silla de Enfermo", price: null, note: "Contact for quote" }, { id: "waterpump", name: "Water Pump", nameEs: "Turbina de Agua", price: 15 }, { id: "microwaveS", name: "Small Microwave", nameEs: "Microwave Pequeno", price: 4 }, { id: "microwaveB", name: "Big Microwave", nameEs: "Microwave Grande", price: 7 }] }, { id: "electronics", name: "Electronics", nameEs: "Electr\xF3nica", icon: "\u{1F4F1}", items: [{ id: "telefono", name: "Phone", nameEs: "Tel\xE9fono", price: 10 }, { id: "laptop", name: "Laptop", nameEs: "Laptop", price: 20, note: "+ weight charge" }, { id: "computadora", name: "Desktop Computer", nameEs: "Computadora", price: 80 }, { id: "tv_hasta_55", name: 'TV up to 55"', nameEs: 'Televisor hasta 55"', price: 60 }, { id: "tv_mas_55", name: 'TV over 55"', nameEs: 'Televisor m\xE1s de 55"', price: 80 }, { id: "playstation", name: "PlayStation", nameEs: "PlayStation", price: 150 }, { id: "speaker", name: "Speaker", nameEs: "Bocina", price: 20 }, { id: "generator", name: "Generator", nameEs: "Generador", price: 40 }, { id: "lithium_battery", name: "Lithium Battery", nameEs: "Bateria de Litio", price: 50 }] }, { id: "refrigeration", name: "Refrigeration", nameEs: "Refrigeraci\xF3n", icon: "\u2744\uFE0F", items: [{ id: "nevera", name: "Freezer", nameEs: "Nevera", price: 40 }, { id: "refrigerador", name: "Refrigerator", nameEs: "Refrigerador", price: 40 }, { id: "aire_acondicionado", name: "Air Conditioner", nameEs: "Aire Acondicionado", price: 20 }] }, { id: "security", name: "Security", nameEs: "Seguridad", icon: "\u{1F4F9}", items: [{ id: "sistema_camaras", name: "Camera System", nameEs: "Sistema de C\xE1maras", price: 150 }, { id: "camara_individual", name: "Individual Camera", nameEs: "C\xE1mara Individual", price: 20 }] }, { id: "tools", name: "Tools", nameEs: "Herramientas", icon: "\u{1F527}", items: [{ id: "herramientas_variadas", name: "Assorted Tools", nameEs: "Herramientas Variadas", price: 10 }, { id: "herramientas_motor", name: "Power Tools", nameEs: "Herramientas con Motor", price: 15 }] }, { id: "transport_recreation", name: "Transport & Recreation", nameEs: "Transporte y Recreaci\xF3n", icon: "\u{1F6B2}", items: [{ id: "scooter", name: "Scooter (large or small)", nameEs: "Scooter (grande o chica)", price: 40 }, { id: "equipos_gym", name: "Gym Equipment", nameEs: "Equipos de Gym", price: 60 }, { id: "bicicleta_normal", name: "Regular Bicycle", nameEs: "Bicicleta Normal", price: 30 }, { id: "bicicleta_electrica", name: "Electric Bicycle", nameEs: "Bicicleta El\xE9ctrica", price: 60 }, { id: "juguetes_bateria_10kg", name: "Battery Toys (up to 10kg)", nameEs: "Juguetes con Bater\xEDa (hasta 10kg)", price: 15 }, { id: "juguetes_bateria_mas_10kg", name: "Battery Toys (over 10kg)", nameEs: "Juguetes con Bater\xEDa (m\xE1s de 10kg)", price: 20 }, { id: "tires", name: "Tires", nameEs: "Gomas de Carro", price: 20 }] }, { id: "parts_by_weight", name: "Parts by Weight", nameEs: "Piezas por Peso", icon: "\u2696\uFE0F", items: [{ id: "piezas_hasta_10kg", name: "Parts up to 10kg (22lbs)", nameEs: "Piezas hasta 10kg", price: 40 }, { id: "piezas_10_20kg", name: "Parts 10-20kg (22-44lbs)", nameEs: "Piezas de 10kg a 20kg", price: 60 }, { id: "piezas_mas_20kg", name: "Parts over 20kg (44lbs+)", nameEs: "Piezas m\xE1s de 20kg", price: 80 }] }, { id: "essentials", name: "Essentials (Free)", nameEs: "Esenciales (Gratis)", icon: "\u{1F193}", items: [{ id: "comida", name: "Food", nameEs: "Comida", price: 0, note: "Gratis" }, { id: "medicina", name: "Medicine", nameEs: "Medicina", price: 0, note: "Gratis" }, { id: "aseo", name: "Toiletries/Hygiene", nameEs: "Aseo", price: 0, note: "Gratis" }, { id: "ropa", name: "Clothing", nameEs: "Ropa", price: 0, note: "Gratis" }, { id: "zapatos", name: "Shoes", nameEs: "Zapatos", price: 0, note: "Gratis" }] }, { id: "other", name: "Other", nameEs: "Otros", icon: "\u{1F4E6}", items: [{ id: "articulos_medicos", name: "Medical Equipment", nameEs: "Art\xEDculos de Uso M\xE9dico", price: 0, note: "Gratis" }, { id: "sistema_pesca", name: "Fishing Gear", nameEs: "Sistema de Pesca", price: 40 }, { id: "extraTariff", name: "Extra Tariff", nameEs: "Tarifas extras", price: 3 }] }], mn = { weekly: { tiers: [] }, biweekly: { tiers: [] }, special: { tiers: [] } }, hn = { weekly: { miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }, cycles: [{ id: "weekly", label: "Semanal", miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }], unit: "USD per lb", boxes: [{ id: "box_14x14x14", name: "Box 14x14x14", nameEs: "Caja 14x14x14", dimensions: "14x14x14", price: 60, maxLbs: 80 }] }, pn = [{ address: "4105 E 4 Ave", city: "Hialeah", zip: "33013", phone: "786-587-0068" }, { address: "6895 W 4 Ave", city: "Hialeah", zip: "33014", phone: "786-487-4037" }], ie = { company: "PAITO LOGISTICS", currency: "USD", coverage: "Env\xEDos a toda Cuba hasta la puerta de tu casa, incluyendo la Isla de la Juventud" }, gn = { MISCELANEAS: { over50items: 2.99, under50items: 3.99, description: "Ropa, zapatos, accesorios, art\xEDculos personales" }, DURADEROS: { price: 4.5, description: "Electr\xF3nicos, electrodom\xE9sticos, herramientas", arancel: { ranges: [{ min: 0, max: 5, cost: 5 }, { min: 5, max: 20, cost: 10 }, { min: 20, max: 50, cost: 20 }, { min: 50, max: 100, cost: 35 }, { min: 100, max: 1 / 0, cost: 50 }] } }, LITHIUM_BATTERIES: { price: 8.99, description: "Bater\xEDas de litio, power banks, equipos con bater\xEDa de litio" }, EXCLUSIVE: { price: 6.99, description: "TVs, computadoras, generadores (bulto exclusivo)" }, DOCUMENTS: { price: 1.99, description: "Documentos, papeles, certificados" }, baseTransportCost: 20 }, vn = { schemaVersion: 1, branding: { company: ie.company, currency: ie.currency, coverage: ie.coverage, locations: pn }, itemTariffs: fn, airShipping: mn, maritimeShipping: hn, dynamicPricing: gn }, Ke = "yaba-active-tariff-id", [yn, K] = createSignal(null), [On, oe] = createSignal(null), [Bn, bn] = createSignal([]), [Mn, Re] = createSignal(false), [Un, ce] = createSignal(null);
function wn(e) {
  var _a, _b, _c, _d, _e2;
  const t = (_c = (_b = (_a = e.dynamicPricing) == null ? void 0 : _a.DURADEROS) == null ? void 0 : _b.arancel) == null ? void 0 : _c.ranges;
  if (Array.isArray(t)) for (const n of t) (n.max === null || n.max === void 0) && (n.max = 1 / 0);
  for (const n of ["weekly", "biweekly", "special"]) {
    const r = (_e2 = (_d = e.airShipping) == null ? void 0 : _d[n]) == null ? void 0 : _e2.tiers;
    if (Array.isArray(r)) for (const a of r) (a.maxLbs === null || a.maxLbs === void 0) && (a.maxLbs = 1 / 0);
  }
  return e;
}
function Le(e) {
  try {
    const t = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data;
    if (!t) return null;
    const n = t.schemaVersion ? t : t.config;
    return !n || typeof n != "object" ? null : wn({ ...vn, ...n });
  } catch {
    return null;
  }
}
function En(e) {
  var _a, _b, _c;
  try {
    return ((_c = (_b = (_a = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data) == null ? void 0 : _a.isActive) != null ? _b : e == null ? void 0 : e.isActive) != null ? _c : true) !== false;
  } catch {
    return false;
  }
}
function An() {
  return typeof localStorage < "u" ? localStorage.getItem(Ke) : null;
}
function xn(e) {
  typeof localStorage < "u" && localStorage.setItem(Ke, e);
}
async function Sn(e) {
  try {
    Re(true), ce(null);
    const n = (await dn.list()).filter(En);
    if (bn(n), n.length === 0) return K(null), oe(null), null;
    const r = An(), a = e && n.find((o) => o.id === e) || r && n.find((o) => o.id === r) || n[0];
    let s = a, i = Le(s);
    if (!i) {
      for (const o of n) if (o !== a && (i = Le(o), i)) {
        s = o;
        break;
      }
    }
    return i ? (K(i), oe(s.id), xn(s.id), i) : (ce("No se pudo leer ninguna oferta de tarifa"), K(null), oe(null), null);
  } catch (t) {
    ce((t == null ? void 0 : t.message) || "Error loading tariff config");
    const n = yn();
    return n || K(null), n;
  } finally {
    Re(false);
  }
}
var In = ["<div", ' class="min-h-screen grid place-items-center">', "</div>"];
function Cn(e) {
  const t = he(), n = _t();
  return onMount(() => {
    en();
  }), createEffect(() => {
    if (ne()) return;
    const r = t.pathname === "/login";
    !re() && !r ? n("/login", { replace: true }) : re() && r && n("/", { replace: true });
  }), createEffect(() => {
    !ne() && re() && Sn();
  }), createComponent(Show, { get when() {
    return !ne();
  }, get fallback() {
    return ssr(In, ssrHydrationKey(), escape(createComponent(cn, { class: "w-8 h-8" })));
  }, get children() {
    return createComponent(Show, { get when() {
      return t.pathname !== "/login";
    }, get fallback() {
      return createComponent(Suspense, { get children() {
        return e.children;
      } });
    }, get children() {
      return createComponent(sn, { get children() {
        return createComponent(Suspense, { get children() {
          return e.children;
        } });
      } });
    } });
  } });
}
function Fn() {
  return createComponent(zt, { root: Cn, get children() {
    return createComponent(au, {});
  } });
}

export { Fn as default };
//# sourceMappingURL=app-CUvi6o6s.mjs.map
