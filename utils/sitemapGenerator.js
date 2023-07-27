const
  configs = require('../configs'),
  SitemapGenerator = require('sitemap-generator');
// create 
generator_host = process.env.NODE_ENV !== 'production' ? 'http://localhost:' + configs.port : configs.host
const generator = SitemapGenerator(generator_host, {
  stripQuerystring: false
});
// register event listeners
generator.on('done', () => {
  console.log('sitemaps created')
});

module.exports = generator;