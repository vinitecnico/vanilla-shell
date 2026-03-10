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


-------------------------------------------

cy.window().then((win) => {
  const script = win.document.createElement('script');
  script.src = 'assets/context.js?t=' + new Date().getTime(); // Cache bust para garantir recarregamento
  
  script.onload = () => {
    // O arquivo context.js acabou de rodar e definir o window.context original
    // Agora nós forçamos o valor que queremos para o teste
    win.context = {
      ...win.context,
      api_url: 'http://localhost:9999',
      debug: true
    };
    console.log('Contexto atualizado para o teste!');
  };

  win.document.head.appendChild(script);
});

-------------------------------------------

// 1. Intercepta a chamada ao arquivo JS
cy.intercept('GET', '**/assets/context.js*', (req) => {
  req.reply({
    body: `window.context = { "user": "test_user", "role": "admin", "mocked": true };`,
    headers: { 'content-type': 'application/javascript' }
  });
}).as('getContext');

// 2. Visita a página ou dispara a lógica que carrega o script
cy.visit('index.html');

// 3. Garante que o script foi carregado com o seu mock
cy.wait('@getContext');

-------------------------------------------

it('configura o contexto antes do carregamento da página', () => {
  cy.visit('index.html', {
    onBeforeLoad(win) {
      // Definimos o objeto no window antes da página carregar
      win.context = {
        ambiente: 'test',
        token: '123'
      };
    },
  });
});

-------------------------------------------

it('deve alterar o contexto e validar a alteração', () => {
  cy.visit('index.html');

  cy.window().then((win) => {
    // Verifica se o objeto já existe (devido ao async)
    // Se não existir, você pode criá-lo ou esperar
    win.context = {
      ...win.context,
      novaPropriedade: 'valor_alterado',
      usuario: 'teste_cypress'
    };
  });

  // Prossiga com os testes que dependem desse novo valor
  cy.get('#botao-teste').click();
});