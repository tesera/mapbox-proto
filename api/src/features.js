const Feature = require('./models/Feature')
const jwt_decode = require('jwt-decode')
const geobuf = require('geobuf')
const Pbf = require('pbf')
const textEncoding = require('text-encoding')
const geojsonvt = require('geojson-vt')


function boundsToPolygon(bounds) {
  let poly = []
  poly.push([bounds._southWest.lng, bounds._southWest.lat])
  poly.push([bounds._southWest.lng, bounds._northEast.lat])
  poly.push([bounds._northEast.lng, bounds._northEast.lat])
  poly.push([bounds._northEast.lng, bounds._southWest.lat])
  poly.push([bounds._southWest.lng, bounds._southWest.lat])
  return poly
}

function Auth0Error(message, stack = false) {
  this.name = 'Auth0Error'
  this.message = message
  this.stack = stack || (new Error()).stack
}

module.exports = (event, context, callback) => {
  // let body = JSON.parse(event.body)
  // let project = body.project;
  // let recordType = body.recordType;
  let params = event.pathParameters;
  let z = params.z
  let x = params.x
  let y = params.y
  // let token = body.token && jwt_decode(body.token)
  // let email = token && token.email || false

  let lon = tile2long(x,z);
  let lat = tile2lat(y,z);
  let lat_rad = tile2lat_rad(y,z);

// 52.047581604695345, -121.83571815490724
  // let zoomV = 10;
  // let latV = 52.047581604695345 ;
  // let lonV = -121.83571815490724;
  // { _southWest: { lat: 52.014472235614164, lng: -121.92386627197266 },
  //   _northEast: { lat: 52.08066646107138, lng: -121.74757003784181 } }
  // { _southWest: { lng: -120.42139117320511, lat: 53.62328680279588 },
  //   _southEast: { lng: -123.56298382679489, lat: 53.62328680279588 },
  //   _northWest: { lng: -120.42139117320511, lat: 50.481694149206085 },
  //   _northEast: { lng: -123.56298382679489, lat: 50.481694149206085 } }

  // console.log('KC TILES LON', long2tile(lonV,zoomV)) 338
  // console.log('KC TILES LAT', lat2tile(latV,zoomV)) 165 10


 function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
 function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

  function tile2long(x,z) {
    return (x/Math.pow(2,z)*360-180);
  }
  function tile2lat(y,z) {
    var n = Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
  }
  function tile2lat_rad(y,z) {
    var n = Math.PI-2*Math.PI*y/Math.pow(2,z);
    return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  }


  let north = lat + lat_rad;
  let south = lat - lat_rad;
  let east = lon + lat_rad;
  let west = lon - lat_rad;

  let bounds = {
    _southWest: {lng: west, lat: south},
    _northEast: {lng: east, lat: north}
  };


  console.log(bounds);
  // console.log(lat, lon, lat_rad)


        options = {
          index: `${process.env.VIEWERENV}-spatial`
          // project: 'knifecreek',
          // recordType: 'vri'
        }

        if(bounds) options.bounds = boundsToPolygon(bounds)
        if(params.z) options.zoom = params.z

  return new Feature(options).get()
    .then((data) => {
      // console.log('Returned1', data.hits.hits)



      console.log('000',data.hits.hits[0])
      let geoJSON = data.hits.hits.map( x => geojsonvt(x._source))


      // console.log('HITS', geoJSON)

      // const buffer = geobuf.encode(geoJSON, new Pbf());
      //
      // var string = new TextDecoder('utf-8').decode(buffer);
      console.log('BUFFER1', geoJSON[0])


      return geoJSON
    })
    .then(tiles => {

      const TextDecoder = textEncoding.TextDecoder;
      // const string = new TextDecoder('utf-8').decode(tiles);

      // var tileIndex = geojsonvt(string);

      console.log('BUFFER2', tiles)

      let string = JSON.stringify(tiles)






      // console.log('BUFFER222', string)
      callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials' : true,
            'content-type': 'application/json'
        },
        body: string
      });
    })
    .catch((err) => {
      console.error(err)
      callback(null, {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          error: err.message
        })
      })
    })

};
