module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'C:\\Projetos\\Mithra_next',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      log_file: 'C:\\Projetos\\Mithra_next\\logs\\combined.log',
      out_file: 'C:\\Projetos\\Mithra_next\\logs\\out.log',
      error_file: 'C:\\Projetos\\Mithra_next\\logs\\error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true
    }
  ]
}; 