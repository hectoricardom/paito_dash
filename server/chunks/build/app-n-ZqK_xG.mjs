import { createComponent, isServer, ssr, ssrHydrationKey, escape, getRequestEvent, delegateEvents, ssrAttribute, ssrElement, mergeProps as mergeProps$1 } from 'solid-js/web';
import { a as au } from '../nitro/nitro.mjs';
import { onMount, createEffect, Show, Suspense, createSignal, onCleanup, For, children, createMemo, getOwner, sharedConfig, useContext, mergeProps, splitProps, createRenderEffect, on, runWithOwner, createContext, untrack, createRoot, startTransition, resetErrorBoundaries, batch, createComponent as createComponent$1 } from 'solid-js';
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

function De() {
  let e = /* @__PURE__ */ new Set();
  function t(a) {
    return e.add(a), () => e.delete(a);
  }
  let r = false;
  function n(a, s) {
    if (r) return !(r = false);
    const i = { to: a, options: s, defaultPrevented: false, preventDefault: () => i.defaultPrevented = true };
    for (const o of e) o.listener({ ...i, from: o.location, retry: (c) => {
      c && (r = true), o.navigate(a, { ...s, resolve: false });
    } });
    return !i.defaultPrevented;
  }
  return { subscribe: t, confirm: n };
}
let le;
function me() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), le = window.history.state._depth;
}
isServer || me();
function bt(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function wt(e, t) {
  let r = false;
  return () => {
    const n = le;
    me();
    const a = n == null ? null : le - n;
    if (r) {
      r = false;
      return;
    }
    a && t(a) ? (r = true, window.history.go(-a)) : e();
  };
}
const Et = /^(?:[a-z0-9]+:)?\/\//i, At = /^\/+|(\/)\/+$/g, $e = "http://sr";
function T(e, t = false) {
  const r = e.replace(At, "$1");
  return r ? t || /^[?#]/.test(r) ? r : "/" + r : "";
}
function Q(e, t, r) {
  if (Et.test(t)) return;
  const n = T(e), a = r && T(r);
  let s = "";
  return !a || t.startsWith("/") ? s = n : a.toLowerCase().indexOf(n.toLowerCase()) !== 0 ? s = n + a : s = a, (s || "/") + T(t, !s);
}
function xt(e, t) {
  if (e == null) throw new Error(t);
  return e;
}
function St(e, t) {
  return T(e).replace(/\/*(\*.*)?$/g, "") + T(t);
}
function Ge(e) {
  const t = {};
  return e.searchParams.forEach((r, n) => {
    n in t ? Array.isArray(t[n]) ? t[n].push(r) : t[n] = [t[n], r] : t[n] = r;
  }), t;
}
function It(e, t, r) {
  const [n, a] = e.split("/*", 2), s = n.split("/").filter(Boolean), i = s.length;
  return (o) => {
    const c = o.split("/").filter(Boolean), l = c.length - i;
    if (l < 0 || l > 0 && a === void 0 && !t) return null;
    const m = { path: i ? "" : "/", params: {} }, v = (h) => r === void 0 ? void 0 : r[h];
    for (let h = 0; h < i; h++) {
      const g = s[h], E = g[0] === ":", u = E ? c[h] : c[h].toLowerCase(), d = E ? g.slice(1) : g.toLowerCase();
      if (E && re(u, v(d))) m.params[d] = u;
      else if (E || !re(u, d)) return null;
      m.path += `/${u}`;
    }
    if (a) {
      const h = l ? c.slice(-l).join("/") : "";
      if (re(h, v(a))) m.params[a] = h;
      else return null;
    }
    return m;
  };
}
function re(e, t) {
  const r = (n) => n === e;
  return t === void 0 ? true : typeof t == "string" ? r(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(r) : t instanceof RegExp ? t.test(e) : false;
}
function Pt(e) {
  const [t, r] = e.pattern.split("/*", 2), n = t.split("/").filter(Boolean);
  return n.reduce((a, s) => a + (s.startsWith(":") ? 2 : 3), n.length - (r === void 0 ? 0 : 1));
}
function He(e) {
  const t = /* @__PURE__ */ new Map(), r = getOwner();
  return new Proxy({}, { get(n, a) {
    return t.has(a) || runWithOwner(r, () => t.set(a, createMemo(() => e()[a]))), t.get(a)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  }, has(n, a) {
    return a in e();
  } });
}
function je(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let r = e.slice(0, t.index), n = e.slice(t.index + t[0].length);
  const a = [r, r += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(n); ) a.push(r += t[1]), n = n.slice(t[0].length);
  return je(n).reduce((s, i) => [...s, ...a.map((o) => o + i)], []);
}
const Ct = 100, qe = createContext(), he = createContext(), ee = () => xt(useContext(qe), "<A> and 'use' router primitives can be only used inside a Route."), _t = () => useContext(he) || ee().base, Rt = (e) => {
  const t = _t();
  return createMemo(() => t.resolvePath(e()));
}, Lt = (e) => {
  const t = ee();
  return createMemo(() => {
    const r = e();
    return r !== void 0 ? t.renderPath(r) : r;
  });
}, Tt = () => ee().navigatorFactory(), pe = () => ee().location;
function kt(e, t = "") {
  const { component: r, preload: n, load: a, children: s, info: i } = e, o = !s || Array.isArray(s) && !s.length, c = { key: e, component: r, preload: n || a, info: i };
  return Ve(e.path).reduce((l, m) => {
    for (const v of je(m)) {
      const h = St(t, v);
      let g = o ? h : h.split("/*", 1)[0];
      g = g.split("/").map((E) => E.startsWith(":") || E.startsWith("*") ? E : encodeURIComponent(E)).join("/"), l.push({ ...c, originalPath: m, pattern: g, matcher: It(g, !o, e.matchFilters) });
    }
    return l;
  }, []);
}
function Ot(e, t = 0) {
  return { routes: e, score: Pt(e[e.length - 1]) * 1e4 - t, matcher(r) {
    const n = [];
    for (let a = e.length - 1; a >= 0; a--) {
      const s = e[a], i = s.matcher(r);
      if (!i) return null;
      n.unshift({ ...i, route: s });
    }
    return n;
  } };
}
function Ve(e) {
  return Array.isArray(e) ? e : [e];
}
function ze(e, t = "", r = [], n = []) {
  const a = Ve(e);
  for (let s = 0, i = a.length; s < i; s++) {
    const o = a[s];
    if (o && typeof o == "object") {
      o.hasOwnProperty("path") || (o.path = "");
      const c = kt(o, t);
      for (const l of c) {
        r.push(l);
        const m = Array.isArray(o.children) && o.children.length === 0;
        if (o.children && !m) ze(o.children, l.pattern, r, n);
        else {
          const v = Ot([...r], n.length);
          n.push(v);
        }
        r.pop();
      }
    }
  }
  return r.length ? n : n.sort((s, i) => i.score - s.score);
}
function q(e, t) {
  for (let r = 0, n = e.length; r < n; r++) {
    const a = e[r].matcher(t);
    if (a) return a;
  }
  return [];
}
function Bt(e, t, r) {
  const n = new URL($e), a = createMemo((m) => {
    const v = e();
    try {
      return new URL(v, n);
    } catch {
      return console.error(`Invalid path ${v}`), m;
    }
  }, n, { equals: (m, v) => m.href === v.href }), s = createMemo(() => a().pathname), i = createMemo(() => a().search, true), o = createMemo(() => a().hash), c = () => "", l = on(i, () => Ge(a()));
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
  }, query: r ? r(l) : He(l) };
}
let L;
function Mt() {
  return L;
}
function Ut(e, t, r, n = {}) {
  const { signal: [a, s], utils: i = {} } = e, o = i.parsePath || ((f) => f), c = i.renderPath || ((f) => f), l = i.beforeLeave || De(), m = Q("", n.base || "");
  if (m === void 0) throw new Error(`${m} is not a valid base path`);
  m && !a().value && s({ value: m, replace: true, scroll: false });
  const [v, h] = createSignal(false);
  let g;
  const E = (f, p) => {
    p.value === u() && p.state === b() || (g === void 0 && h(true), L = f, g = p, startTransition(() => {
      g === p && (d(g.value), y(g.state), resetErrorBoundaries(), isServer || R[1]((A) => A.filter((k) => k.pending)));
    }).finally(() => {
      g === p && batch(() => {
        L = void 0, f === "navigate" && rt(g), h(false), g = void 0;
      });
    }));
  }, [u, d] = createSignal(a().value), [b, y] = createSignal(a().state), _ = Bt(u, b, i.queryWrapper), I = [], R = createSignal(isServer ? at() : []), G = createMemo(() => typeof n.transformUrl == "function" ? q(t(), n.transformUrl(_.pathname)) : q(t(), _.pathname)), be = () => {
    const f = G(), p = {};
    for (let A = 0; A < f.length; A++) Object.assign(p, f[A].params);
    return p;
  }, Ze = i.paramsWrapper ? i.paramsWrapper(be, t) : He(be), we = { pattern: m, path: () => m, outlet: () => null, resolvePath(f) {
    return Q(m, f);
  } };
  return createRenderEffect(on(a, (f) => E("native", f), { defer: true })), { base: we, location: _, params: Ze, isRouting: v, renderPath: c, parsePath: o, navigatorFactory: tt, matches: G, beforeLeave: l, preloadRoute: nt, singleFlight: n.singleFlight === void 0 ? true : n.singleFlight, submissions: R };
  function et(f, p, A) {
    untrack(() => {
      if (typeof p == "number") {
        p && (i.go ? i.go(p) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const k = !p || p[0] === "?", { replace: J, resolve: O, scroll: K, state: B } = { replace: false, resolve: !k, scroll: true, ...A }, M = O ? f.resolvePath(p) : Q(k && _.pathname || "", p);
      if (M === void 0) throw new Error(`Path '${p}' is not a routable path`);
      if (I.length >= Ct) throw new Error("Too many redirects");
      const Ee = u();
      if (M !== Ee || B !== b()) if (isServer) {
        const Ae = getRequestEvent();
        Ae && (Ae.response = { status: 302, headers: new Headers({ Location: M }) }), s({ value: M, replace: J, scroll: K, state: B });
      } else l.confirm(M, A) && (I.push({ value: Ee, replace: J, scroll: K, state: b() }), E("navigate", { value: M, state: B }));
    });
  }
  function tt(f) {
    return f = f || useContext(he) || we, (p, A) => et(f, p, A);
  }
  function rt(f) {
    const p = I[0];
    p && (s({ ...f, replace: p.replace, scroll: p.scroll }), I.length = 0);
  }
  function nt(f, p) {
    const A = q(t(), f.pathname), k = L;
    L = "preload";
    for (let J in A) {
      const { route: O, params: K } = A[J];
      O.component && O.component.preload && O.component.preload();
      const { preload: B } = O;
      p && B && runWithOwner(r(), () => B({ params: K, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: Ge(f), state: null, key: "" }, intent: "preload" }));
    }
    L = k;
  }
  function at() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function Ft(e, t, r, n) {
  const { base: a, location: s, params: i } = e, { pattern: o, component: c, preload: l } = n().route, m = createMemo(() => n().path);
  c && c.preload && c.preload();
  const v = l ? l({ params: i, location: s, intent: L || "initial" }) : void 0;
  return { parent: t, pattern: o, path: m, outlet: () => c ? createComponent$1(c, { params: i, location: s, data: v, get children() {
    return r();
  } }) : r(), resolvePath(g) {
    return Q(a.path(), g, m());
  } };
}
const We = (e) => (t) => {
  const { base: r } = t, n = children(() => t.children), a = createMemo(() => ze(n(), t.base || ""));
  let s;
  const i = Ut(e, a, () => s, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent(qe.Provider, { value: i, get children() {
    return createComponent(Nt, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(s = getOwner()) && null, createComponent(Dt, { routerState: i, get branches() {
        return a();
      } })];
    } });
  } });
};
function Nt(e) {
  const t = e.routerState.location, r = e.routerState.params, n = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: r, location: t, intent: Mt() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (a) => createComponent(a, { params: r, location: t, get data() {
    return n();
  }, get children() {
    return e.children;
  } }) });
}
function Dt(e) {
  if (isServer) {
    const a = getRequestEvent();
    if (a && a.router && a.router.dataOnly) {
      $t(a, e.routerState, e.branches);
      return;
    }
    a && ((a.router || (a.router = {})).matches || (a.router.matches = e.routerState.matches().map(({ route: s, path: i, params: o }) => ({ path: s.originalPath, pattern: s.pattern, match: i, params: o, info: s.info }))));
  }
  const t = [];
  let r;
  const n = createMemo(on(e.routerState.matches, (a, s, i) => {
    let o = s && a.length === s.length;
    const c = [];
    for (let l = 0, m = a.length; l < m; l++) {
      const v = s && s[l], h = a[l];
      i && v && h.route.key === v.route.key ? c[l] = i[l] : (o = false, t[l] && t[l](), createRoot((g) => {
        t[l] = g, c[l] = Ft(e.routerState, c[l - 1] || e.routerState.base, Pe(() => n()[l + 1]), () => {
          var _a;
          const E = e.routerState.matches();
          return (_a = E[l]) != null ? _a : E[0];
        });
      }));
    }
    return t.splice(a.length).forEach((l) => l()), i && o ? i : (r = c[0], c);
  }));
  return Pe(() => n() && r)();
}
const Pe = (e) => () => createComponent(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent(he.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function $t(e, t, r) {
  const n = new URL(e.request.url), a = q(r, new URL(e.router.previousUrl || e.request.url).pathname), s = q(r, n.pathname);
  for (let i = 0; i < s.length; i++) {
    (!a[i] || s[i].route !== a[i].route) && (e.router.dataOnly = true);
    const { route: o, params: c } = s[i];
    o.preload && o.preload({ params: c, location: t.location, intent: "preload" });
  }
}
function Gt([e, t], r, n) {
  return [e, n ? (a) => t(n(a)) : t];
}
function Ht(e) {
  let t = false;
  const r = (a) => typeof a == "string" ? { value: a } : a, n = Gt(createSignal(r(e.get()), { equals: (a, s) => a.value === s.value && a.state === s.state }), void 0, (a) => (!t && e.set(a), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), a));
  return e.init && onCleanup(e.init((a = e.get()) => {
    t = true, n[1](r(a)), t = false;
  })), We({ signal: n, create: e.create, utils: e.utils });
}
function jt(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function qt(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Vt(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function zt(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && Vt(t.request.url) || "" };
  return We({ signal: [() => r, (n) => Object.assign(r, n)] })(e);
}
const Wt = /* @__PURE__ */ new Map();
function Jt(e = true, t = false, r = "/_server", n) {
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
      const b = l(d), y = b ? d.href.baseVal : d.href;
      if ((b ? d.target.baseVal : d.target) || !y && !d.hasAttribute("state")) return;
      const I = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || I && I.includes("external")) return;
      const R = b ? new URL(y, document.baseURI) : new URL(y);
      if (!(R.origin !== window.location.origin || s && R.pathname && !R.pathname.toLowerCase().startsWith(s.toLowerCase()))) return [d, R];
    }
    function v(u) {
      const d = m(u);
      if (!d) return;
      const [b, y] = d, _ = a.parsePath(y.pathname + y.search + y.hash), I = b.getAttribute("state");
      u.preventDefault(), i(_, { resolve: false, replace: b.hasAttribute("replace"), scroll: !b.hasAttribute("noscroll"), state: I ? JSON.parse(I) : void 0 });
    }
    function h(u) {
      const d = m(u);
      if (!d) return;
      const [b, y] = d;
      n && (y.pathname = n(y.pathname)), a.preloadRoute(y, b.getAttribute("preload") !== "false");
    }
    function g(u) {
      clearTimeout(o);
      const d = m(u);
      if (!d) return c = null;
      const [b, y] = d;
      c !== b && (n && (y.pathname = n(y.pathname)), o = setTimeout(() => {
        a.preloadRoute(y, b.getAttribute("preload") !== "false"), c = b;
      }, 20));
    }
    function E(u) {
      if (u.defaultPrevented) return;
      let d = u.submitter && u.submitter.hasAttribute("formaction") ? u.submitter.getAttribute("formaction") : u.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const y = new URL(d, $e);
        if (d = a.parsePath(y.pathname + y.search), !d.startsWith(r)) return;
      }
      if (u.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const b = Wt.get(d);
      if (b) {
        u.preventDefault();
        const y = new FormData(u.target, u.submitter);
        b.call({ r: a, f: u.target }, u.target.enctype === "multipart/form-data" ? y : new URLSearchParams(y));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", v), e && (document.addEventListener("mousemove", g, { passive: true }), document.addEventListener("focusin", h, { passive: true }), document.addEventListener("touchstart", h, { passive: true })), document.addEventListener("submit", E), onCleanup(() => {
      document.removeEventListener("click", v), e && (document.removeEventListener("mousemove", g), document.removeEventListener("focusin", h), document.removeEventListener("touchstart", h)), document.removeEventListener("submit", E);
    });
  };
}
function Kt(e) {
  if (isServer) return zt(e);
  const t = () => {
    const n = window.location.pathname.replace(/^\/+/, "/") + window.location.search, a = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: n + window.location.hash, state: a };
  }, r = De();
  return Ht({ get: t, set({ value: n, replace: a, scroll: s, state: i }) {
    a ? window.history.replaceState(bt(i), "", n) : window.history.pushState(i, "", n), qt(decodeURIComponent(window.location.hash.slice(1)), s), me();
  }, init: (n) => jt(window, "popstate", wt(n, (a) => {
    if (a) return !r.confirm(a);
    {
      const s = t();
      return !r.confirm(s.value, { state: s.state });
    }
  })), create: Jt(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (n) => window.history.go(n), beforeLeave: r } })(e);
}
function Ce(e) {
  e = mergeProps({ inactiveClass: "inactive", activeClass: "active" }, e);
  const [, t] = splitProps(e, ["href", "state", "class", "activeClass", "inactiveClass", "end"]), r = Rt(() => e.href), n = Lt(r), a = pe(), s = createMemo(() => {
    const i = r();
    if (i === void 0) return [false, false];
    const o = T(i.split(/[?#]/, 1)[0]).toLowerCase(), c = decodeURI(T(a.pathname).toLowerCase());
    return [e.end ? o === c : c.startsWith(o + "/") || c === o, o === c];
  });
  return ssrElement("a", mergeProps$1(t, { get href() {
    return n() || e.href;
  }, get state() {
    return JSON.stringify(e.state);
  }, get classList() {
    return { ...e.class && { [e.class]: true }, [e.inactiveClass]: !s()[0], [e.activeClass]: s()[0], ...t.classList };
  }, link: true, get "aria-current"() {
    return s()[1] ? "page" : void 0;
  } }), void 0, true);
}
const Yt = "https://ssgloghr.com/auth", W = "ssgl_access_tkn", ge = "auth_user";
function ye(e) {
  if (typeof document > "u") return null;
  const t = decodeURIComponent(document.cookie);
  for (const r of t.split("; ")) if (r.startsWith(e + "=")) return r.substring(e.length + 1);
  return null;
}
function Qt(e, t, r = 365) {
  if (typeof document > "u") return;
  const n = new Date(Date.now() + r * 24 * 60 * 60 * 1e3), a = typeof location < "u" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${e}=${t}; expires=${n.toUTCString()}; path=/; SameSite=Lax${a}`;
}
function Xt(e) {
  typeof document > "u" || (document.cookie = `${e}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`);
}
function Zt() {
  if (typeof localStorage > "u") return null;
  try {
    const e = localStorage.getItem(ge);
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
}
const [P, Je] = createSignal(Zt()), [er, Ke] = createSignal(ye(W)), [ne, F] = createSignal(true), j = () => !!er() && !!P();
function ue(e) {
  if (typeof e == "boolean") return e;
  if (typeof e == "number") return e === 1;
  if (typeof e == "string") {
    const t = e.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes";
  }
  return false;
}
function Ye() {
  var _a;
  const e = P();
  return ue((_a = e == null ? void 0 : e.permissions) == null ? void 0 : _a.isAdmin) || ue(e == null ? void 0 : e.isAdmin);
}
function ve(e) {
  var _a, _b;
  return e ? j() ? Ye() ? true : ue((_b = (_a = P()) == null ? void 0 : _a.permissions) == null ? void 0 : _b[e]) : false : true;
}
function _e() {
  var _a;
  return ((_a = P()) == null ? void 0 : _a.businessId) || "";
}
function tr(e, t) {
  Qt(W, e), localStorage.setItem(ge, JSON.stringify(t)), Ke(e), Je(t);
}
function X() {
  Xt(W), typeof localStorage < "u" && localStorage.removeItem(ge), Ke(null), Je(null);
}
async function rr(e) {
  var _a, _b, _c, _d;
  const t = e || ye(W);
  if (!t) return F(false), false;
  try {
    const r = await fetch(`${Yt}/verify-signature`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: t }, body: JSON.stringify({ token: t }) });
    if (r.status === 401 || r.status === 500) return X(), F(false), false;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const n = await r.json();
    if ((n == null ? void 0 : n.valid) && (n == null ? void 0 : n.user)) {
      const a = { id: n.user.originalUserId || n.user.uid || n.user.id || "", originalUserId: n.user.originalUserId, email: n.user.email || "", name: n.user.displayName || n.user.name || "", picture: n.user.photoURL || n.user.picture || "", businessId: n.user.businessId || "", isAdmin: ((_b = (_a = n.user) == null ? void 0 : _a.permissions) == null ? void 0 : _b.isAdmin) || ((_c = n.user) == null ? void 0 : _c.isAdmin) || "", permissions: ((_d = n.user) == null ? void 0 : _d.permissions) || {} };
      return tr(t, a), F(false), true;
    }
    return X(), F(false), false;
  } catch {
    return X(), F(false), false;
  }
}
async function nr() {
  const e = ye(W);
  e ? await rr(e) : (X(), F(false));
}
var ar = ["<div", ' class="px-3 py-2 mb-1"><div class="text-sm font-medium text-gray-900 truncate">', '</div><div class="text-xs text-gray-500 truncate">', "</div></div>"], sr = ["<button", ' class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign out</button>'], ir = ["<div", ' class="min-h-screen flex"><aside class="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white"><div class="px-6 py-5 border-b border-gray-100"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">P</div><div><div class="font-semibold text-gray-900 leading-tight">Paito</div><div class="text-xs text-gray-500">Logistics</div></div></div></div><nav class="flex-1 px-3 py-4 space-y-1">', '</nav><div class="px-3 py-3 border-t border-gray-100">', '</div></aside><div class="flex-1 flex flex-col min-w-0"><header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-semibold">P</div><span class="font-semibold">Paito</span></div><nav class="flex items-center gap-1">', '</nav></header><main class="flex-1 overflow-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', "</div></main></div></div>"], or = ["<svg", ' class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path', "></path></svg>"];
const cr = [{ href: "/", label: "Dashboard", perm: null, icon: "M3 12l9-9 9 9M5 10v10h14V10" }, { href: "/invoices", label: "Invoices", perm: "invoiceAccess", icon: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6" }, { href: "/tariffs", label: "Tarifas", perm: "offersManagementAccess", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" }, { href: "/inventory", label: "Inventario", perm: "InventoryAccess", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" }, { href: "/ops", label: "Operaciones", perm: "OpsAccess", icon: "M12 2l3 3-3 3M3 12h18M12 22l-3-3 3-3M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" }, { href: "/loans", label: "Pr\xE9stamos", perm: "isAdmin", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }], Re = () => cr.filter((e) => ve(e.perm));
function lr(e) {
  const t = pe(), r = (n) => n === "/" ? t.pathname === "/" : t.pathname.startsWith(n);
  return ssr(ir, ssrHydrationKey(), escape(createComponent(For, { get each() {
    return Re();
  }, children: (n) => createComponent(Ce, { get href() {
    return n.href;
  }, class: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", get classList() {
    return { "bg-brand-50 text-brand-700": r(n.href), "text-gray-700 hover:bg-gray-50 hover:text-gray-900": !r(n.href) };
  }, get children() {
    return [ssr(or, ssrHydrationKey(), ssrAttribute("d", escape(n.icon, true), false)), n.label];
  } }) })), escape(createComponent(Show, { get when() {
    return P();
  }, get children() {
    var _a, _b;
    return [ssr(ar, ssrHydrationKey(), escape((_a = P()) == null ? void 0 : _a.name), escape((_b = P()) == null ? void 0 : _b.email)), ssr(sr, ssrHydrationKey())];
  } })), escape(createComponent(For, { get each() {
    return Re();
  }, children: (n) => createComponent(Ce, { get href() {
    return n.href;
  }, class: "px-2 py-1 text-xs rounded-md", get classList() {
    return { "bg-brand-50 text-brand-700": r(n.href), "text-gray-600": !r(n.href) };
  }, get children() {
    return n.label;
  } }) })), escape(e.children));
}
var ur = ["<svg", ' viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>'];
function dr(e) {
  var _a;
  return ssr(ur, ssrHydrationKey() + ssrAttribute("class", escape(["animate-spin text-gray-400", (_a = e.class) != null ? _a : "w-5 h-5"].join(" "), true), false));
}
const V = { state: { get profile() {
  return P();
}, get user() {
  return P();
}, get stores() {
  return [];
} }, get currentUser() {
  return P();
}, getBusinessId() {
  return _e();
}, getBusinessIds() {
  return [_e()].filter(Boolean);
}, isAdmin() {
  return Ye();
}, can(e) {
  return ve(e);
}, signOut() {
} }, H = (e = 4) => {
  const t = "0123456789BCDFGKSY";
  let r = "";
  for (let n = 0; n < e; n++) r += t.charAt(Math.floor(Math.random() * t.length));
  return r;
};
function fr(e) {
  const t = e + "=", n = decodeURIComponent(document.cookie).split("; ");
  let a;
  return n.forEach((s) => {
    s.indexOf(t) === 0 && (a = s.substring(t.length));
  }), a;
}
const mr = async (e) => {
  var _a;
  const t = fr("ssgl_access_tkn") || "", n = await fetch("https://ssgloghr.com/api/query", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br", Authorization: t }, body: JSON.stringify(e) });
  if (n.status, !n.ok) throw new Error(`HTTP error! status: ${n.status}`);
  const a = await n.json();
  if (a.errors) throw new Error(((_a = a.errors[0]) == null ? void 0 : _a.message) || "GraphQL error");
  return a.data;
};
function U(e, t = {}) {
  const { params: r = {}, form: n, queryString: a, scope: s, extra: i } = t, o = { ...r };
  s !== false && (o.businessId = s === void 0 ? V.getBusinessId() : s);
  const c = { query: e, params: o, ...i != null ? i : {} };
  return n !== void 0 && (c.form = n), a !== void 0 && (c.queryString = a), mr(c);
}
const Qe = (e) => Array.from({ length: e }, (t, r) => `!* contain :search${r}`).join(" AND ");
Qe(5);
Qe(6);
const ae = () => {
  var _a, _b;
  return (_b = (_a = V.state) == null ? void 0 : _a.user) == null ? void 0 : _b.uid;
}, Le = () => (/* @__PURE__ */ new Date()).getTime(), se = () => (/* @__PURE__ */ new Date()).toISOString(), hr = { async list(e) {
  const t = {};
  return (e == null ? void 0 : e.method) && (t.method = e.method), (e == null ? void 0 : e.category) && (t.category = e.category), (await U("listTariffOffers", { params: t })).data || [];
}, async get(e) {
  const t = await U("getTariffOffer", { params: { id: e } });
  return t.data || t;
}, async create(e, t) {
  var _a, _b;
  const r = (t == null ? void 0 : t.businessId) || V.getBusinessId(), n = (t == null ? void 0 : t.code) || `${H(6)}_${H(6)}`, a = await U("createTariffOffer", { scope: r, params: { userId: ae(), timestamp: Le() }, form: { id: H(16), offerCode: n, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: r, data: e, createdAt: se(), updatedAt: se() } });
  return a.data || a;
}, async update(e, t, r) {
  const n = (r == null ? void 0 : r.originalBusinessId) || (r == null ? void 0 : r.businessId) || V.getBusinessId(), a = { data: t, updatedAt: se() };
  (r == null ? void 0 : r.name) && (a.offerName = r.name), (r == null ? void 0 : r.code) && (a.offerCode = r.code), (r == null ? void 0 : r.isActive) !== void 0 && (a.isActive = r.isActive), (r == null ? void 0 : r.isVisible) !== void 0 && (a.isVisible = r.isVisible), (r == null ? void 0 : r.businessId) && (a.businessId = r.businessId);
  const s = await U("updateTariffOffer", { scope: n, params: { id: e, userId: ae(), timestamp: Le() }, form: a });
  return s.data || s;
}, async delete(e) {
  try {
    return await U("deleteTariffOffer", { params: { id: e, userId: ae() } }), { success: true, message: "Tarifa eliminada exitosamente" };
  } catch (t) {
    return console.error("Error deleting tariff offer:", t), { success: false, message: (t == null ? void 0 : t.message) || "Error al eliminar tarifa" };
  }
}, async validate(e, t) {
  var _a, _b;
  const r = (t == null ? void 0 : t.businessId) || V.getBusinessId(), n = (t == null ? void 0 : t.code) || `${H(6)}_${H(6)}`, a = await U("validateTariffOffer", { scope: r, form: { offerCode: n, offerName: (t == null ? void 0 : t.name) || "", isActive: (_a = t == null ? void 0 : t.isActive) != null ? _a : true, isVisible: (_b = t == null ? void 0 : t.isVisible) != null ? _b : true, businessId: r, data: e } });
  return a.data || a;
} }, pr = [{ id: "kitchen_appliances", name: "Kitchen Appliances", nameEs: "Electrodom\xE9sticos de Cocina", icon: "\u{1F373}", items: [{ id: "batidora", name: "Blender/Mixer", nameEs: "Batidora", price: 3 }, { id: "hornilla", name: "Hot Plate/Burner", nameEs: "Hornilla", price: 3 }, { id: "ventilador", name: "Fan", nameEs: "Ventilador", price: 3 }, { id: "olla_arrocera", name: "Rice Cooker", nameEs: "Olla Arrocera", price: 4 }, { id: "olla_presion", name: "Pressure Cooker", nameEs: "Olla de Presi\xF3n", price: 4 }, { id: "freidora", name: "Air Fryer", nameEs: "Freidora", price: 4 }, { id: "cofitera", name: "Coffee Maker", nameEs: "Cafetera", price: 3 }] }, { id: "lighting", name: "Lighting", nameEs: "Iluminaci\xF3n", icon: "\u{1F4A1}", items: [{ id: "linterna", name: "Flashlight (all types)", nameEs: "Linterna (todo tipo)", price: 2.5 }] }, { id: "home", name: "Home & Furniture", nameEs: "Hogar", icon: "\u{1F3E0}", items: [{ id: "utiles_hogar", name: "Household Items", nameEs: "\xDAtiles del Hogar", price: 5 }, { id: "colchones", name: "Mattress", nameEs: "Colchones", price: 20 }, { id: "camas", name: "Bed Frame", nameEs: "Camas", price: 20 }, { id: "gavetero", name: "Dresser", nameEs: "Gavetero", price: 20 }, { id: "juego_muebles", name: "Furniture Set (Living/Dining/Patio)", nameEs: "Juego de Muebles (Sala/Comedor/Patio)", price: 150 }, { id: "sillon_electrico", name: "Electric Recliner", nameEs: "Sill\xF3n El\xE9ctrico", price: 30 }, { id: "sillon_normal", name: "Regular Armchair", nameEs: "Sill\xF3n Normal", price: 0, note: "Free" }, { id: "silla_enfermo", name: "Medical Chair", nameEs: "Silla de Enfermo", price: null, note: "Contact for quote" }, { id: "waterpump", name: "Water Pump", nameEs: "Turbina de Agua", price: 15 }, { id: "microwaveS", name: "Small Microwave", nameEs: "Microwave Pequeno", price: 4 }, { id: "microwaveB", name: "Big Microwave", nameEs: "Microwave Grande", price: 7 }] }, { id: "electronics", name: "Electronics", nameEs: "Electr\xF3nica", icon: "\u{1F4F1}", items: [{ id: "telefono", name: "Phone", nameEs: "Tel\xE9fono", price: 10 }, { id: "laptop", name: "Laptop", nameEs: "Laptop", price: 20, note: "+ weight charge" }, { id: "computadora", name: "Desktop Computer", nameEs: "Computadora", price: 80 }, { id: "tv_hasta_55", name: 'TV up to 55"', nameEs: 'Televisor hasta 55"', price: 60 }, { id: "tv_mas_55", name: 'TV over 55"', nameEs: 'Televisor m\xE1s de 55"', price: 80 }, { id: "playstation", name: "PlayStation", nameEs: "PlayStation", price: 150 }, { id: "speaker", name: "Speaker", nameEs: "Bocina", price: 20 }, { id: "generator", name: "Generator", nameEs: "Generador", price: 40 }, { id: "lithium_battery", name: "Lithium Battery", nameEs: "Bateria de Litio", price: 50 }] }, { id: "refrigeration", name: "Refrigeration", nameEs: "Refrigeraci\xF3n", icon: "\u2744\uFE0F", items: [{ id: "nevera", name: "Freezer", nameEs: "Nevera", price: 40 }, { id: "refrigerador", name: "Refrigerator", nameEs: "Refrigerador", price: 40 }, { id: "aire_acondicionado", name: "Air Conditioner", nameEs: "Aire Acondicionado", price: 20 }] }, { id: "security", name: "Security", nameEs: "Seguridad", icon: "\u{1F4F9}", items: [{ id: "sistema_camaras", name: "Camera System", nameEs: "Sistema de C\xE1maras", price: 150 }, { id: "camara_individual", name: "Individual Camera", nameEs: "C\xE1mara Individual", price: 20 }] }, { id: "tools", name: "Tools", nameEs: "Herramientas", icon: "\u{1F527}", items: [{ id: "herramientas_variadas", name: "Assorted Tools", nameEs: "Herramientas Variadas", price: 10 }, { id: "herramientas_motor", name: "Power Tools", nameEs: "Herramientas con Motor", price: 15 }] }, { id: "transport_recreation", name: "Transport & Recreation", nameEs: "Transporte y Recreaci\xF3n", icon: "\u{1F6B2}", items: [{ id: "scooter", name: "Scooter (large or small)", nameEs: "Scooter (grande o chica)", price: 40 }, { id: "equipos_gym", name: "Gym Equipment", nameEs: "Equipos de Gym", price: 60 }, { id: "bicicleta_normal", name: "Regular Bicycle", nameEs: "Bicicleta Normal", price: 30 }, { id: "bicicleta_electrica", name: "Electric Bicycle", nameEs: "Bicicleta El\xE9ctrica", price: 60 }, { id: "juguetes_bateria_10kg", name: "Battery Toys (up to 10kg)", nameEs: "Juguetes con Bater\xEDa (hasta 10kg)", price: 15 }, { id: "juguetes_bateria_mas_10kg", name: "Battery Toys (over 10kg)", nameEs: "Juguetes con Bater\xEDa (m\xE1s de 10kg)", price: 20 }, { id: "tires", name: "Tires", nameEs: "Gomas de Carro", price: 20 }] }, { id: "parts_by_weight", name: "Parts by Weight", nameEs: "Piezas por Peso", icon: "\u2696\uFE0F", items: [{ id: "piezas_hasta_10kg", name: "Parts up to 10kg (22lbs)", nameEs: "Piezas hasta 10kg", price: 40 }, { id: "piezas_10_20kg", name: "Parts 10-20kg (22-44lbs)", nameEs: "Piezas de 10kg a 20kg", price: 60 }, { id: "piezas_mas_20kg", name: "Parts over 20kg (44lbs+)", nameEs: "Piezas m\xE1s de 20kg", price: 80 }] }, { id: "essentials", name: "Essentials (Free)", nameEs: "Esenciales (Gratis)", icon: "\u{1F193}", items: [{ id: "comida", name: "Food", nameEs: "Comida", price: 0, note: "Gratis" }, { id: "medicina", name: "Medicine", nameEs: "Medicina", price: 0, note: "Gratis" }, { id: "aseo", name: "Toiletries/Hygiene", nameEs: "Aseo", price: 0, note: "Gratis" }, { id: "ropa", name: "Clothing", nameEs: "Ropa", price: 0, note: "Gratis" }, { id: "zapatos", name: "Shoes", nameEs: "Zapatos", price: 0, note: "Gratis" }] }, { id: "other", name: "Other", nameEs: "Otros", icon: "\u{1F4E6}", items: [{ id: "articulos_medicos", name: "Medical Equipment", nameEs: "Art\xEDculos de Uso M\xE9dico", price: 0, note: "Gratis" }, { id: "sistema_pesca", name: "Fishing Gear", nameEs: "Sistema de Pesca", price: 40 }, { id: "extraTariff", name: "Extra Tariff", nameEs: "Tarifas extras", price: 3 }] }], gr = { weekly: { tiers: [] }, biweekly: { tiers: [] }, special: { tiers: [] } }, yr = { weekly: { miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }, cycles: [{ id: "weekly", label: "Semanal", miscellaneous: 0.99, durable: 1.5, freePromoLbs: 0, promoThreshold: 0 }], unit: "USD per lb", boxes: [{ id: "box_14x14x14", name: "Box 14x14x14", nameEs: "Caja 14x14x14", dimensions: "14x14x14", price: 60, maxLbs: 80 }] }, vr = [{ address: "4105 E 4 Ave", city: "Hialeah", zip: "33013", phone: "786-587-0068" }, { address: "6895 W 4 Ave", city: "Hialeah", zip: "33014", phone: "786-487-4037" }], ie = { company: "PAITO LOGISTICS", currency: "USD", coverage: "Env\xEDos a toda Cuba hasta la puerta de tu casa, incluyendo la Isla de la Juventud" }, br = { MISCELANEAS: { over50items: 2.99, under50items: 3.99, description: "Ropa, zapatos, accesorios, art\xEDculos personales" }, DURADEROS: { price: 4.5, description: "Electr\xF3nicos, electrodom\xE9sticos, herramientas", arancel: { ranges: [{ min: 0, max: 5, cost: 5 }, { min: 5, max: 20, cost: 10 }, { min: 20, max: 50, cost: 20 }, { min: 50, max: 100, cost: 35 }, { min: 100, max: 1 / 0, cost: 50 }] } }, LITHIUM_BATTERIES: { price: 8.99, description: "Bater\xEDas de litio, power banks, equipos con bater\xEDa de litio" }, EXCLUSIVE: { price: 6.99, description: "TVs, computadoras, generadores (bulto exclusivo)" }, DOCUMENTS: { price: 1.99, description: "Documentos, papeles, certificados" }, baseTransportCost: 20 }, wr = { schemaVersion: 1, branding: { company: ie.company, currency: ie.currency, coverage: ie.coverage, locations: vr }, itemTariffs: pr, airShipping: gr, maritimeShipping: yr, dynamicPricing: br }, Xe = "yaba-active-tariff-id", [Er, Y] = createSignal(null), [Ur, oe] = createSignal(null), [Fr, Ar] = createSignal([]), [Nr, Te] = createSignal(false), [Dr, ce] = createSignal(null);
function xr(e) {
  var _a, _b, _c, _d, _e2;
  const t = (_c = (_b = (_a = e.dynamicPricing) == null ? void 0 : _a.DURADEROS) == null ? void 0 : _b.arancel) == null ? void 0 : _c.ranges;
  if (Array.isArray(t)) for (const r of t) (r.max === null || r.max === void 0) && (r.max = 1 / 0);
  for (const r of ["weekly", "biweekly", "special"]) {
    const n = (_e2 = (_d = e.airShipping) == null ? void 0 : _d[r]) == null ? void 0 : _e2.tiers;
    if (Array.isArray(n)) for (const a of n) (a.maxLbs === null || a.maxLbs === void 0) && (a.maxLbs = 1 / 0);
  }
  return e;
}
function ke(e) {
  try {
    const t = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data;
    if (!t) return null;
    const r = t.schemaVersion ? t : t.config;
    return !r || typeof r != "object" ? null : xr({ ...wr, ...r });
  } catch {
    return null;
  }
}
function Sr(e) {
  var _a, _b, _c;
  try {
    return ((_c = (_b = (_a = typeof (e == null ? void 0 : e.data) == "string" ? JSON.parse(e.data) : e == null ? void 0 : e.data) == null ? void 0 : _a.isActive) != null ? _b : e == null ? void 0 : e.isActive) != null ? _c : true) !== false;
  } catch {
    return false;
  }
}
function Ir() {
  return typeof localStorage < "u" ? localStorage.getItem(Xe) : null;
}
function Pr(e) {
  typeof localStorage < "u" && localStorage.setItem(Xe, e);
}
async function Cr(e) {
  try {
    Te(true), ce(null);
    const r = (await hr.list()).filter(Sr);
    if (Ar(r), r.length === 0) return Y(null), oe(null), null;
    const n = Ir(), a = e && r.find((o) => o.id === e) || n && r.find((o) => o.id === n) || r[0];
    let s = a, i = ke(s);
    if (!i) {
      for (const o of r) if (o !== a && (i = ke(o), i)) {
        s = o;
        break;
      }
    }
    return i ? (Y(i), oe(s.id), Pr(s.id), i) : (ce("No se pudo leer ninguna oferta de tarifa"), Y(null), oe(null), null);
  } catch (t) {
    ce((t == null ? void 0 : t.message) || "Error loading tariff config");
    const r = Er();
    return r || Y(null), r;
  } finally {
    Te(false);
  }
}
var _r = ["<div", ' class="min-h-screen grid place-items-center">', "</div>"];
function Rr(e) {
  const t = pe(), r = Tt();
  onMount(() => {
    nr();
  });
  const n = () => t.pathname === "/login" || t.pathname === "/callback", a = { "/invoices": "invoiceAccess", "/tariffs": "offersManagementAccess", "/inventory": "InventoryAccess", "/ops": "OpsAccess", "/loans": "isAdmin" }, s = () => {
    const i = Object.keys(a).find((o) => t.pathname.startsWith(o));
    return i ? a[i] : null;
  };
  return createEffect(() => {
    ne() || (!j() && !n() ? r("/login", { replace: true }) : j() && t.pathname === "/login" ? r("/", { replace: true }) : j() && !ve(s()) && r("/", { replace: true }));
  }), createEffect(() => {
    !ne() && j() && Cr();
  }), createComponent(Show, { get when() {
    return !ne();
  }, get fallback() {
    return ssr(_r, ssrHydrationKey(), escape(createComponent(dr, { class: "w-8 h-8" })));
  }, get children() {
    return createComponent(Show, { get when() {
      return !n();
    }, get fallback() {
      return createComponent(Suspense, { get children() {
        return e.children;
      } });
    }, get children() {
      return createComponent(lr, { get children() {
        return createComponent(Suspense, { get children() {
          return e.children;
        } });
      } });
    } });
  } });
}
function $r() {
  return createComponent(Kt, { root: Rr, get children() {
    return createComponent(au, {});
  } });
}

export { $r as default };
//# sourceMappingURL=app-n-ZqK_xG.mjs.map
