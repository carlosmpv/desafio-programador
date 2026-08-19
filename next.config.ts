import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instruí o Turbopack e o Node.js a carregar o módulo diretamente do node_modules
  outputFileTracingExcludes: {
    '*': ['./node_modules/@embedpdf/**', './node_modules/pdf-oxide-wasm/**'],
  },
  serverExternalPackages: ["pdf-oxide-wasm"],
  output: 'standalone',

  // Silencia o aviso e confirma que o Turbopack deve gerenciar o projeto
  experimental: {
    // Mantém a chave vazia de turbopack se não precisar de loaders customizados
    serverActions: {
      bodySizeLimit: '10mb'
    },
    serverComponentsExternalPackages: [
      'pdf-parse',
      'pdf-oxide-wasm',
      '@react-pdf/renderer',
      '@prisma/client'
    ]
  },
  turbopack: {},
};

export default nextConfig;