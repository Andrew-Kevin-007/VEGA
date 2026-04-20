## GitHub Copilot Chat

- Extension: 0.43.0 (prod)
- VS Code: 1.115.0 (41dd792b5e652393e7787322889ed5fdc58bd75b)
- OS: win32 10.0.26220 x64
- GitHub Account: Andrew-Kevin-007

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (31 ms)
- DNS ipv6 Lookup: Error (4 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: timed out after 10 seconds
timed out after 10 seconds

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (27 ms)
- DNS ipv6 Lookup: Error (4 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: timed out after 10 seconds
- Node.js fetch: Error (9421 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5293:5228)
	at async t.fetch (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5293:4540)
	at async u (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5325:186)
	at async Sg._executeContributedCommand (file:///c:/Users/kavin/AppData/Local/Programs/Microsoft%20VS%20Code/41dd792b5e/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: connect ECONNABORTED 140.82.114.22:443
  	at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)
  	at TCPConnectWrap.callbackTrampoline (node:internal/async_hooks:130:17)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: Error (5 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- DNS ipv6 Lookup: Error (3 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (5 ms)
- Electron fetch (configured): Error (6 ms): Error: net::ERR_INTERNET_DISCONNECTED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
	at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (20 ms): Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
	at GetAddrInfoReqWrap.callbackTrampoline (node:internal/async_hooks:130:17)
- Node.js fetch: Error (21 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5293:5228)
	at async t.fetch (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5293:4540)
	at async u (c:\Users\kavin\.vscode\extensions\github.copilot-chat-0.43.0\dist\extension.js:5325:186)
	at async Sg._executeContributedCommand (file:///c:/Users/kavin/AppData/Local/Programs/Microsoft%20VS%20Code/41dd792b5e/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
  	at GetAddrInfoReqWrap.callbackTrampoline (node:internal/async_hooks:130:17)

Connecting to https://mobile.events.data.microsoft.com: Error (3119 ms): Error: net::ERR_NETWORK_CHANGED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
	at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: timed out after 10 seconds
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: 