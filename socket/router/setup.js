import app from '../app';
const {
  demand,
  demandJs,
  demandLang,
  componentMethods,
  utility: {
    cnsl,
    assign,
    each,
    isString,
    rest,
    camelCase,
    omit,
    last,
    batch,
    eventAdd,
    has,
    whileArray,
  },
} = app;
const ractive = window.Ractive;
const router = {};
const hostname = window.location.hostname;
const origin = window.location.origin;
cnsl('ROUTER ONLINE', 'important');
assign(router, {
  add(item) {
    each(item, router.addObject);
  },
  addObject(item, key) {
    const reg = new RegExp(key);
    router.routes.push(() => {
      return router.routeChecker(item, reg);
    });
  },
  attachEvents() {
    eventAdd(window, 'popstate', (domEvent) => {
      router.saveState();
      router.updateLocation();
      router.loadState();
      domEvent.preventDefault();
    }, true);
  },
  closeState(previousStateObject) {
    if (previousStateObject) {
      if (!previousStateObject.closed) {
        router.forceClose(previousStateObject);
      }
    }
  },
  forceClose(sourceState) {
    app.view.set('navState', false);
    const nullCurrentState = Boolean(sourceState);
    const currentStateObject = sourceState || router.currentStateObject;
    if (currentStateObject) {
      if (router.currentStateObject.watchers) {
        router.currentStateObject.watchers.stop();
      }
      currentStateObject.closed = true;
      if (currentStateObject.close) {
        batch(currentStateObject.close);
      }
      if (!nullCurrentState) {
        router.currentStateObject = null;
      }
    }
  },
  async go(route) {
    await router.openState(route);
    if (router.analytics) {
      router.analytics();
    }
  },
  async importRoute(data, routeRequire, routePath) {
    if (!data.loaded && routeRequire) {
      console.log(`${routeRequire}`, 'Loading Route Dependencies');
      await demand(routeRequire);
    }
    console.log(`routes${routePath}`, 'Loading Route');
    const componentRoute = await demand(`routes${routePath}`);
    const languageRoute = await demandLang(routePath);
    if (componentRoute.component && componentRoute.component.then) {
      await componentRoute.component;
    }
    componentRoute.assets = componentRoute.assets || {};
    if (languageRoute) {
      componentRoute.assets.language = languageRoute;
    }
    if (componentRoute.compile) {
      await componentRoute.compile();
    }
    router.objectRoutes[routePath] = componentRoute;
    router.go(componentRoute);
    data.loaded = true;
  },
  isCurrentModel(model, success, failure) {
    const check = (router.currentStateObject) ? router.currentStateObject === model : false;
    if (check) {
      if (success) {
        success();
      }
    } else if (failure) {
      failure();
    }
    return check;
  },
  loadState() {
    cnsl('Router Loading State', 'notify');
    whileArray(router.routes, (item) => {
      return Boolean(item()) === false;
    });
  },
  location: {
    previous: {},
  },
  objectRoutes: {},
  async openState(openModel) {
    console.log(openModel.name, 'openState Start');
    const previousStateObject = router.currentStateObject;
    if (openModel) {
      router.currentStateObject = openModel;
      if (!openModel.panel) {
        router.closeState(previousStateObject);
      }
      if (openModel.closed || openModel.closed === undefined) {
        if (openModel.open) {
          openModel.open();
        }
        openModel.closed = false;
      }
    } else {
      router.currentStateObject = null;
      router.closeState(previousStateObject);
    }
    console.log(router.currentStateObject.name, 'openState End');
    if (router.currentStateObject && router.currentStateObject.component) {
      await app.view.set('navState', false);
      ractive.components.navState = router.currentStateObject.component;
      await app.view.set('navState', true);
      if (router.currentStateObject.watchers) {
        router.currentStateObject.watchers.start();
      }
    }
  },
  async pushState(url) {
    if (url) {
      await router.saveState();
      await router.setState(url, url);
      await router.updateLocation();
      await router.loadState();
    }
  },
  reloadState(sourceState) {
    const currentStateObject = sourceState || router.currentStateObject;
    if (currentStateObject) {
      if (currentStateObject.reload) {
        batch(currentStateObject.reload);
      }
    }
  },
  routeChecker(data, reg) {
    const matching = router.location.pathname.match(reg);
    if (matching) {
      console.log(matching, 'Router Matched');
      router.match = matching;
      const route = data.route();
      let routePath = (last(route.path) === '/') ? route.path : `${route.path}/`;
      routePath = (routePath[0] === '/') ? routePath : `/${routePath}`;
      route.path = routePath;
      const routeRequire = data.require;
      if (router.objectRoutes[routePath]) {
        router.go(router.objectRoutes[routePath]);
      } else {
        router.importRoute(data, routeRequire, routePath);
      }
    }
    return matching;
  },
  routes: [],
  saveState() {
    assign(router.location.previous, omit(router.location, ['previous']));
  },
  setState(url, title, object) {
    // pushState
    if (hostname + url === hostname + window.location.pathname) {
      router.reloadState();
    } else {
      history.pushState(object, title, url);
    }
  },
  setup() {
    router.updateLocation();
    router.attachEvents();
    router.loadState();
  },
  updateLocation() {
    each(top.location, (item, index) => {
      if (isString(item)) {
        router.location[index] = item;
      }
    });
  }
});
componentMethods.routerLoad = (componentView) => {
  componentView.on({
    routerBack() {
      if (router.location.previous.hostname) {
        window.history.back();
      } else {
        router.pushState('/');
      }
    },
    routerForward() {
      if (router.location.previous.hostname) {
        window.history.forward();
      } else {
        router.pushState('/');
      }
    },
    routerLoad(componentEvent) {
      const href = componentEvent.node.href;
      const node = componentEvent.node;
      if (!href) {
        router.pushState(componentEvent.get('href') || node.getAttribute('data-href'));
      } else if (has(href, origin) || has(href, hostname)) {
        componentEvent.preventDefault();
        router.pushState(node.getAttribute('href'));
      }
      return false;
    },
  });
};
assign(app, {
  router,
});
