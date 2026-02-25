import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

const SDK_PKG = '@hiero-ledger/sdk';

export default {
  name: 'hiero-browser-resolve',
  setup(build) {
    let browserMap = null;
    let sdkDir = null;

    function loadBrowserMap(resolveDir) {
      if (browserMap) return;
      let dir = resolveDir;
      while (dir !== dirname(dir)) {
        const pkgPath = resolve(dir, 'node_modules', '@hiero-ledger', 'sdk', 'package.json');
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
          sdkDir = dirname(pkgPath);
          browserMap = pkg.browser || {};
          return;
        } catch { /* keep walking */ }
        dir = dirname(dir);
      }
    }

    build.onResolve({ filter: /^@hiero-ledger\/sdk$/ }, (args) => {
      loadBrowserMap(args.resolveDir);
      if (sdkDir) {
        return { path: resolve(sdkDir, 'lib', 'browser.js') };
      }
    });
  },
};
