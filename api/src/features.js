
const SphericalMercator = require('@mapbox/sphericalmercator')
const merc = new SphericalMercator({ size: 256 })
const Feature = require('./models/Feature')
const vtpbf = require('vt-pbf');
const geojsonVt = require('geojson-vt');

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

  let options = {
    index: `local-spatial`,
    project: 'knifecreek',
    recordType: 'vri',
    bounds: boundsToPolygon(bounds),
    zoom: tile.z
  }

  let request = new Feature(options)
  request.get().then((data) => {
    console.log(`Returned ${data.hits.hits.length} features from dev-spatial for tile `)

    let feats = data.hits.hits.length ? data.hits.hits : null
    let _tile = null;

    if (feats) {
      // needs to be a collection
      feats = {
	      "type": "FeatureCollection",
	      "features": feats.map(feat => feat._source)
      }

      feats = geojsonVt(feats, {
	      maxZoom: 14,  // max zoom to preserve detail on; can't be higher than 24
	      tolerance: 3, // simplification tolerance (higher means simpler)
	      extent: 4096, // tile extent (both width and height)
	      buffer: 64,   // tile buffer on each side
	      debug: 2,     // logging level (0 to disable, 1 or 2)
	      lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
	      promoteId: null,    // name of a feature property to promote to feature.id. Cannot be used with `generateId`
	      generateId: false,  // whether to generate feature ids. Cannot be used with `promoteId`
	      indexMaxZoom: 12,       // max zoom in the initial tile index
	      indexMaxPoints: 100000 // max number of points per tile in the index
      })

      _tile = feats.getTile(parseInt(tile.z), parseInt(tile.x), parseInt(tile.y)) || {features: []};
    } else {
      // if no features, return empty feature
      _tile = {features: []}
    }

    let pbf = vtpbf.fromGeojsonVt({'geojsonLayer': _tile});

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
