module.exports = {
  "prod": {
    "host": "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com",
    "port": 10191,
  },
  "dev": {
    "host": "localhost",
    "port": 6379
  }
}[process.env.NODE_ENV || "prod"];
