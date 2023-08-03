const local_port = 3000,
    config = module.exports = {
    dev: {
        port: local_port,
        axios: {
            api: {
                baseURL: 'https://api.xx.com/api/v1',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Version': '0.0.1',
                }
            },
            cache: {
                baseURL: 'http://localhost:'+local_port+'/api/v1',
            }
        },
        name: 'resources',
        redis: {
            enabled: true,
            url: 'localhost',
            port: 6379,
        },
        domain: 'https://www.xx.com',
        host: ''
    },
    prod: {
        axios: {
            api: {
                baseURL: 'https://api.xx.com/api/v1',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Zilly-Resource-Guide-Version': '1.0.0',
                }
            },
            cache: {
                baseURL: 'https://www.xx.com/api/v1'
            }
        },
        name: 'resources',
        redis: {
            enabled: false,
            url: 'resource-guide-prod.s2b5kv.ng.0001.usw2.cache.amazonaws.com',
            port: 6379,
        },
        domain: 'https://www.xx.com',
        host: 'https://www.xx.com'
    }
} [process.env.NODE_ENV || 'dev']

module.exports.axios.data = (!! config.redis.enabled ? config.axios.cache : config.axios.api)