module.exports = {
  "prod": {
    "name": "prod",
    "dbhost": "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 10191
  },
  "stage": {
    "name": "dev",
    "dbhost": "pub-redis-13914.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 13914
  },
  "dev": {
    "name": "dev",
    "dbhost": "localhost",
    "dbport": 6379
  }
}[process.env.NODE_ENV || "stage"];
