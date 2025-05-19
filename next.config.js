/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuração para módulos nativos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        readline: false,
      };
    }

    // Ignorar módulos problemáticos
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Ignorar arquivos específicos
    config.module.rules.push({
      test: /\.(html|map)$/,
      use: 'null-loader',
    });

    return config;
  },
  // Configuração para ignorar erros de build relacionados a módulos nativos
  experimental: {
    serverComponentsExternalPackages: ['odbc', 'oracledb'],
  },
}

module.exports = nextConfig 