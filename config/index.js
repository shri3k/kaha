module.exports = {
  "prod": {
    "name": "prod",
    "dbhost": "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 10191
  },
  "stage": {
    "name": "stage",
    "dbhost": "pub-redis-13914.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 13914
  },
  "dev": {
    "name": "dev",
    "dbhost": process.env.DB_PORT_6379_TCP_ADDR || 'localhost',
    "dbport": 6379
  }
}[process.env.NODE_ENV || "stage"];
