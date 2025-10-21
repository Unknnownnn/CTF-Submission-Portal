module.exports = {
  apps: [
    {
      name: 'CTF-Submission-Portal',
      script: './server/server.js',
      cwd: '/home/deploy/CTF-Submission-Portal',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};