const ESModel = require('../lib/ESModel')
const BodyBuilder = require('bodybuilder')
class Feature extends ESModel {

  getByBounds(bounds, zoom) {

    console.log('zoom', zoom)
    console.log('index', this.options.index)

    return this.connect().then((client) => {

      const query = (new BodyBuilder())
        .query('match', 'project', this.options.project)
        .query('match', 'recordType', this.options.recordType)
        .query('nested', {path:'properties'}, q => {
          return q
            .query('range', 'properties.zoom_level_upper', {gte: zoom})
            .query('range', 'properties.zoom_level_lower', {lte: zoom})
        })
        .query('geo_shape', 'geometry', {
            "relation": "intersects",
            "shape": {
              "type": "polygon",
              "coordinates": [bounds]
            }
          })
        .build()

      console.log(`Searching index=${this.options.index}, project=${this.options.project}, type=${this.options.recordType}`)

      return client.search({
        index: this.options.index,
        type: '_doc',
        from: 0,
        size: process.env.FEATURE_LIMIT || 5000,
        body: query
      })

    })
  }

  get() {
    return this.connect().then((client) => {

      let query = (new BodyBuilder())

      if(this.options.project)
        query = query.query('match', 'project', this.options.project)

      if(this.options.recordType)
        query = query.query('match', 'recordType', this.options.recordType)

        let type = this.options.recordType === 'sample' ? 'point' : 'polygon'

      if(this.options.zoom && this.options.recordType !== 'sample')
        query = query.query('nested', {path:'properties'}, q => {
          return q
            .query('range', 'properties.zoom_level_upper', {gte: this.options.zoom})
            .query('range', 'properties.zoom_level_lower', {lte: this.options.zoom})
        })

      if(this.options.bounds)
        query = query.query('geo_shape', 'geometry', {
          "relation": "intersects",
          "shape": {
            "type": 'polygon',
            "coordinates": [this.options.bounds]
          }
        })


      return client.search({
        index: this.options.index,
        type: '_doc',
        from: 0,
        size: process.env.FEATURE_LIMIT || 5000,
        body: query.build()
      })


    })
  }

}

module.exports = Feature
