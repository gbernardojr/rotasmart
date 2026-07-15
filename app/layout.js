import './globals.css';

export const metadata = {
  title: 'RotaSmart - Otimizacao de Entregas',
  description: 'Otimizacao de trajeto multi-parada para entregas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RotaSmart',
  },
};

export const viewport = {
  themeColor: '#4361ee',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#4361ee" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RotaSmart" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(r){console.log('SW registered:',r.scope)}).catch(function(e){console.log('SW error:',e)});});}" }} />
      </body>
    </html>
  );
}
