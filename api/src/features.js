
const SphericalMercator = require('@mapbox/sphericalmercator')
const merc = new SphericalMercator({ size: 256 })
const Feature = require('./models/Feature')
const geobuf = require('geobuf')
const Pbf = require('pbf')

function boundsToPolygon(bounds) {
  let poly = []
  poly.push([bounds[0], bounds[1]])
  poly.push([bounds[0], bounds[3]])
  poly.push([bounds[2], bounds[3]])
  poly.push([bounds[2], bounds[1]])
  poly.push([bounds[0], bounds[1]])
  return poly
}

module.exports = (event, context, callback) => {
  let tile = event.pathParameters
  console.log(tile)
  let bounds = merc.bbox(tile.x, tile.y, tile.z)

  options = {
    index: `dev-spatial`,
    project: 'knifecreek',
    recordType: 'vri',
    bounds: boundsToPolygon(bounds),
    zoom: tile.z
  }

  let request = new Feature(options)
  request.get().then((data) => {
    console.log(`Returned ${data.hits.hits.length} features from dev-spatial for tile `)

    let firstFeature = data.hits.hits[0]._source
    let pbf = geobuf.encode(firstFeature, new Pbf())

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Credentials' : true,
        'content-type': 'application/x-protobuf'
      },
      body: Buffer.from(pbf).toString('base64'),
      isBase64Encoded: true
    })
  })

};
