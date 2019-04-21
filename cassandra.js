const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
    contactPoints:['10.3.5.14'],
    keyspace: 'ste',
    localDataCenter: 'datacenter1'
});

module.exports = client;
