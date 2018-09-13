
const SphericalMercator = require('@mapbox/sphericalmercator')
const merc = new SphericalMercator({ size: 256 })

function tile2long(x,z) {
  return (x/Math.pow(2,z)*360-180);
}

function tile2lat(y,z) {
  let n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

module.exports = (event, context, callback) => {
  let bounds = merc.bbox(event.pathParameters.x, event.pathParameters.y, event.pathParameters.z)

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Credentials' : true,
      'content-type': 'application/json'
    },
    body: JSON.stringify({bounds})
  })

};
