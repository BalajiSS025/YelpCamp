   //Mapbox script

   mapboxgl.accessToken = mapToken
   const map = new mapboxgl.Map({
   container: 'map', // container ID
   style: 'mapbox://styles/mapbox/streets-v11', // style URL
   center: camps.geometry.coordinates, // starting position [lng, lat]
   zoom: 9, // starting zoom
   projection: 'globe' // display the map as a 3D globe
   });
   map.on('style.load', () => {
   map.setFog({}); // Set the default atmosphere style
   });
   map.addControl(new mapboxgl.NavigationControl({
      showCompass:true,
      showZoom:true
  }
  ));
   const popup = new mapboxgl.Popup({ offset: 25}).setHTML(`<h4>${camps.title}</h4><p>${camps.location}</p>`)

const marker = new mapboxgl.Marker({color: "#ff0000"})
.setLngLat(camps.geometry.coordinates)
.setPopup(popup)
.addTo(map);
