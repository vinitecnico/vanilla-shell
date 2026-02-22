const MFE_CONFIG = {
  cliente: 'http://localhost:4200',
  produto: 'http://localhost:5173'
};

// 1. Exportação Global para o onclick do HTML
window.navigate = (path) => {
  window.history.pushState({}, '', path);
  updateRoute();
};

function updateRoute() {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const routeDisplay = document.getElementById('route-path');

  if (routeDisplay) routeDisplay.innerText = path;

  // Extração do ID da rota (ex: /cliente/123/edit -> 123)
  const segments = path.split('/').filter(Boolean);
  const routeId = segments[1] || null; 

  const context = {
    url: window.location.href,
    path: path,
    token: "ABC-123-XYZ", 
    routeParams: { id: routeId }, // ID extraído da URL
    queryParams: Object.fromEntries(urlParams.entries()),
    timestamp: new Date().getTime()
  };

  const mfeKey = path.startsWith('/cliente') ? 'cliente' : 
                 path.startsWith('/produto') ? 'produto' : null;

  if (mfeKey) {
    // Mantém a query string na navegação do iframe
    const targetUrl = `${MFE_CONFIG[mfeKey]}${path}${window.location.search}`;
    renderIframe(targetUrl, context);
  }
}

function renderIframe(url, context) {
  const container = document.getElementById('iframe-container');
  if (!container) return;

  let iframe = container.querySelector('iframe');

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'mfe-viewport';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    container.appendChild(iframe);
  }

  // Se a URL mudar, carregamos e enviamos o contexto no onload
  if (iframe.src !== url) {
    iframe.src = url;
    iframe.onload = () => sendContextToMFE(iframe, context);
  } else {
    // Se for a mesma página (ex: mudou só query param), envia o contexto direto
    sendContextToMFE(iframe, context);
  }
}

function sendContextToMFE(iframe, context) {
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({
      type: 'SHELL_CONTEXT',
      payload: context
    }, "*");
  }
}

// 2. Listener de Mensagens (Comunicação MFE -> Chassi)
// Movido para fora do DOMContentLoaded para escuta global
window.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  console.log('Mensagem recebida do MFE:', type, payload);

  if (type === 'NAVIGATE_REQUEST') {
    window.navigate(payload.path);
  }
});

// 3. Inicialização e Navegação do Browser
document.addEventListener('DOMContentLoaded', () => {
  updateRoute();
});

window.addEventListener('popstate', updateRoute);