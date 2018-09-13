
const SphericalMercator = require('@mapbox/sphericalmercator')
const merc = new SphericalMercator({ size: 256 })
const Feature = require('./models/Feature')

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
  let bounds = merc.bbox(tile.x, tile.y, tile.z)

  options = {
    index: `local-spatial`,
    project: 'knifecreek',
    recordType: 'vri',
    bounds: boundsToPolygon(bounds),
    zoom: tile.z
  }

  let request = new Feature(options)
  request.get().then((data) => {
    console.log(`Returned ${data.hits.hits.length} features from local-spatial for tile `)
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Credentials' : true,
        'content-type': 'application/json'
      },
      body: JSON.stringify({data})
    })
  })

};
