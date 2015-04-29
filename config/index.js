module.exports = {
  "prod": {
    "name": "prod",
    "dbhost": "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 10191
  },
  "dev": {
    "name": "dev",
    "dbhost": "pub-redis-13914.us-east-1-4.2.ec2.garantiadata.com",
    "dbport": 13914
  }
}[process.env.NODE_ENV || "dev"];
