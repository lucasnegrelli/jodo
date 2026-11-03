
import "@/styles/tokens.css";
import "@/styles/globals.css";
import Script from 'next/script'
import TransicaoGlobal from "@/components/comum/TransicaoGlobal";
export const metadata = {
  title: "JODO",
  description: "Porque ainda estamos aqui ?",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager Script */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MTTQC2G3');
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-62N248KES8"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-62N248KES8');
          `}
        </Script>
      </head>
      <body className="helvetica-now-display">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MTTQC2G3"
        height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {children}
        <TransicaoGlobal />
      </body>
    </html>
  );
}
