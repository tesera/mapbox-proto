
class ESModel {

  constructor (options) {
    this.options = options || {}

    if(!this.options.hosts)
      this.options.hosts = [process.env.ES_HOST || "http://localhost:9200"]

    if(this.options.hosts[0].indexOf('es.amazonaws.com') >= 0)
      this.options.connectionClass = require('http-aws-es')

    if(!this.options.httpAuth && process.env.ES_AUTH)
      this.options.httpAuth = process.env.ES_AUTH
  }

  connect () {
    return new Promise((resolve, reject) => {
      console.log("Connecting..", this.options)
      const client = require('elasticsearch').Client(Object.assign({}, this.options))
      return client
        .ping({ requestTimeout: this.options.requestTimeout || 3000 })
        .then(() => resolve(client))
        .catch((error) => {
            reject({msg: "Error from ESModel.js", err: error, config: this.options})
        })
    })
  }
}

module.exports = ESModel
