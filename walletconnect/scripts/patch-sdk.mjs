/**
 * Patches @hiero-ledger/sdk to use the browser entry point.
 *
 * The SDK's package.json exports field has no "browser" condition,
 * so Angular's esbuild-based builder resolves to the Node entry
 * (which pulls in @grpc/grpc-js and Node built-ins).
 *
 * This replaces the "import" target with the browser build.
 */
import { readFileSync, writeFileSync } from 'fs';

const pkgPath = './node_modules/@hiero-ledger/sdk/package.json';

try {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.exports['.'].import = './lib/browser.js';
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('Patched @hiero-ledger/sdk exports to use browser entry');
} catch (e) {
  console.warn('Could not patch @hiero-ledger/sdk:', e.message);
}
