
const SphericalMercator = require('@mapbox/sphericalmercator')
const merc = new SphericalMercator({ size: 256 })
const Feature = require('./models/Feature')
const geobuf = require('geobuf')
const Pbf = require('pbf')
const fs = require('fs')
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
    index: `dev-spatial`,
    project: 'knifecreek',
    recordType: 'vri',
    bounds: boundsToPolygon(bounds),
    zoom: tile.z
  }

	// LOCAL TEST
	// let orig = JSON.parse(fs.readFileSync('area.json'))
	// let tileindex = geojsonVt(orig, {
	// 	maxZoom: 14,  // max zoom to preserve detail on; can't be higher than 24
	// 	tolerance: 3, // simplification tolerance (higher means simpler)
	// 	extent: 4096, // tile extent (both width and height)
	// 	buffer: 64,   // tile buffer on each side
	// 	debug: 2,     // logging level (0 to disable, 1 or 2)
	// 	lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
	// 	promoteId: null,    // name of a feature property to promote to feature.id. Cannot be used with `generateId`
	// 	generateId: false,  // whether to generate feature ids. Cannot be used with `promoteId`
	// 	indexMaxZoom: 12,       // max zoom in the initial tile index
	// 	indexMaxPoints: 100000 // max number of points per tile in the index
	// })
	// console.log('tileindex: ', JSON.stringify(tileindex));
	// let test_tile = tileindex.getTile(tile.z,tile.x,tile.y) || {features: []};
	//
	// console.log('test_tile: ', test_tile)

	// console.log('tha orig', orig)
	//
	// console.log('the geojsonVt', tileindex)
	// console.log('the geojsonVt test_tile', JSON.stringify(test_tile))

	// pass in an object mapping layername -> tile object
	// var pbf = vtpbf.fromGeojsonVt({ 'geojsonLayer': test_tile || {} })

  let request = new Feature(options)
  request.get().then((data) => {
    console.log(`Returned ${data.hits.hits.length} features from dev-spatial for tile `)
  //
    let firstFeature = data.hits.hits[0]._source
  //
    let feat = geojsonVt(firstFeature)
    let _tile = feat.getTile(tile.z, tile.x, tile.y) || {features: []};
    let pbf = vtpbf.fromGeojsonVt({'geojsonLayer': _tile});
  //   // let pbf = geobuf.encode(firstFeature, new Pbf())
  //
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
