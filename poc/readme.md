como importar imagens no mfe

iconUrl = new URL('../../../assets/icons/user.svg', import.meta.url).toString();

<img [src]="iconUrl" />

✅ ÚNICA solução possível só no MFE

Você pode fazer o MFE publicar as fontes com caminho absoluto.

No angular.json do MFE:

"build": {
  "options": {
    "deployUrl": "http://localhost:4201/"
  }
}

Ou em produção:

"deployUrl": "https://release.app.com/"


No main.ts do MFE:

declare let __webpack_public_path__: string;

// Pega a origem do remoteEntry.js
__webpack_public_path__ = new URL(document.currentScript!.src).origin + '/';

OU (mais seguro):

declare let __webpack_public_path__: string;

const script = document.currentScript as HTMLScriptElement;
if (script?.src) {
  const url = new URL(script.src);
  __webpack_public_path__ = url.origin + url.pathname.replace('remoteEntry.js', '');
}



Seu main.ts ficaria assim:

declare let __webpack_public_path__: string;

(function () {
  const script = document.currentScript as HTMLScriptElement;
  if (script?.src) {
    const url = new URL(script.src);
    __webpack_public_path__ =
      url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
  }
})();

import('./bootstrap')
  .catch(err => console.error(err));