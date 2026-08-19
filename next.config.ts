import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instruí o Turbopack e o Node.js a carregar o módulo diretamente do node_modules
  outputFileTracingExcludes: {
    '/**': ['./node_modules/@embedpdf/**'],
  },
  // Ensure the WASM package is explicitly included in the traced files
  // so Vercel bundles it with the server build rather than referencing
  // a hashed external module that can't be resolved at runtime.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/pdf-oxide-wasm/**'],
  },
  serverExternalPackages: ["pdf-oxide-wasm"],
  // Removed `output: 'standalone'` because Vercel's build expects the
  // default serverless behavior and the standalone output can prevent
  // generation of the expected NFT trace file during deployment.

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