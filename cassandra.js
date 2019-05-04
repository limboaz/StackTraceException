const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
    contactPoints:['192.168.122.31'],
    keyspace: 'ste',
    localDataCenter: 'datacenter1'
});

module.exports = client;
