// Minimaler Hash-Router: funktioniert auf GitHub Pages ohne Server-Konfiguration.

export type Tab = 'learn' | 'history' | 'settings';

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const raw = decodeURI(location.hash.replace(/^#/, '')) || '/';
  const [path, qs = ''] = raw.split('?');
  const clean = path.startsWith('/') ? path : '/' + path;
  return { path: clean, segments: clean.split('/').filter(Boolean), query: new URLSearchParams(qs) };
}

export function tabOf(route: Route): Tab | null {
  const first = route.segments[0];
  if (first === 'history') return 'history';
  if (first === 'settings') return 'settings';
  if (first === 'study') return null;
  return 'learn';
}

const tabRoots: Record<Tab, string> = { learn: '/', history: '/history', settings: '/settings' };

class Router {
  route = $state<Route>(parse());
  /** Anzahl Navigationsschritte innerhalb der App (für sicheres "Zurück"). */
  depth = 0;
  private lastByTab: Record<Tab, string> = { ...tabRoots };

  constructor() {
    window.addEventListener('hashchange', () => {
      this.route = parse();
      this.remember();
    });
  }

  private remember() {
    const tab = tabOf(this.route);
    if (tab) this.lastByTab[tab] = this.route.path + (this.route.query.size ? '?' + this.route.query : '');
  }

  go(path: string, opts: { replace?: boolean } = {}) {
    if (opts.replace) {
      history.replaceState(null, '', '#' + path);
      this.route = parse();
      this.remember();
    } else {
      this.depth++;
      location.hash = path;
    }
  }

  back(fallback = '/') {
    if (this.depth > 0) {
      this.depth--;
      history.back();
    } else {
      this.go(fallback, { replace: true });
    }
  }

  openTab(tab: Tab) {
    const current = tabOf(this.route);
    // Erneutes Tippen auf den aktiven Tab führt zurück zum Anfang des Tabs.
    const target = current === tab ? tabRoots[tab] : this.lastByTab[tab];
    if (target !== this.route.path) this.go(target, { replace: true });
    this.depth = 0;
  }
}

export const router = new Router();
