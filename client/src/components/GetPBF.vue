<template>
  <div class="hello">
  <input v-model="x" placeholder="x"/>
  <input v-model="y" placeholder="y"/>
  <input v-model="z" placeholder="z"/>
    <button @click="getPBF">Get PBF</button>
    <mapbox
      id="map"
      @map-load="mapLoaded"
      access-token=""
      :map-options="{
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-121.83571815490724, 52.047581604695345],
        zoom: 13
      }"
      >
      </mapbox>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue';
import mapboxgl from 'mapbox-gl';
export default {
  name: 'GetPBF',
  components: { Mapbox },
  data () {
    return {
      x: 165,
      y: 338,
      z: 10,
      layers:[]
    }
  },
  beforeMount () {
    this.getPBF()
  },
  methods: {
    mapLoaded(map) {
      return this.layers.forEach(x => {
        console.log('add',x.tiles[0], x ,x.tiles)
        map.addLayer(x.tiles)
      })
      console.log('MAP', map)
    },
    getPBF () {
      // eslint-disable-next-line
      console.log('key', process.env.MAPBOX_KEY)
      this.$http.post('http://localhost:3000' + `/features/${this.x}/${this.y}/${this.z}` , {
        before (request) {
          if (this.previousRequest) this.previousRequest.abort()
          this.previousRequest = request
        }
      })
        .then((response) => {

          //let byteArray = new Uint8Array(response.body.buffer);
          //var res = new TextEncoder('utf-8').encode(response.bodyText);
          //var obj = new Pbf(res);
          //let buf =  Buffer.from(res)
          //var obj = Test.read(pbf);
          //var pbf = new Pbf(buf);
          //Test.write(obj, pbf);
           //var pbf = new Pbf();
           //Test.write(res, pbf);
           //var buffer = pbf.finish();

          // eslint-disable-next-line
          //let parsed = JSON.parse(response.body);
          // eslint-disable-next-line
          console.log('BYTE', response.body)
          this.layers = response.body
          console.log('THIS', this.layers)
          //let res1 = Buffer.from(response.body.buffer)
          // eslint-disable-next-line
          return response.body
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#map {
  height: 500px;
  width: 1000px;
  margin-right: 600px;
}
input {max-width: 25px;}
</style>
