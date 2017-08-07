'use strict';

const Queue = require('bull');
const redisHost = process.env.redisHost || '127.0.0.1';
const redisPort = process.env.redisPort || '637';

const auditQueue = new Queue('audit queue', {redis: {port: redisPort, host: redisHost}} );

module.exports = auditQueue;
