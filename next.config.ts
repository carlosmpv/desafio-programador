import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instruí o Turbopack e o Node.js a carregar o módulo diretamente do node_modules
  serverExternalPackages: ["pdf-oxide-wasm"],

  // Silencia o aviso e confirma que o Turbopack deve gerenciar o projeto
  experimental: {
    // Mantém a chave vazia de turbopack se não precisar de loaders customizados
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  turbopack: {},
};

export default nextConfig;