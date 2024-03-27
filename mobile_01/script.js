mapboxgl.accessToken =
  "pk.eyJ1IjoicmlyeSIsImEiOiJjbHAwZzRiNHQwNzNxMmtucmpzdmNqdjF2In0.oqz1XjgNIMwoT4i-uRwexQ";

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

function successLocation(position) {
  const { latitude, longitude } = position.coords;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [longitude, latitude],
    zoom: 15,
  });

  mapboxgl.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"
  );
  map.addControl(
    new MapboxLanguage({
      defaultLanguage: "ja",
    })
  );

  //地図の拡大縮小
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  //サーチ
  const geocoder = new MapboxGeocoder(
    {
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    },
    "right"
  );

  //現在地表示
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: false },
      trackUserLocation: true,
      showUserLocation: true,
    }),
    "bottom-right"
  );

  map.addControl(geocoder);

  const layerList = document.getElementById("menu");
  const checkbox = document.getElementById("traffic");

  function switchLayer() {
    const layerId = checkbox.id;
    if (checkbox.checked) {
      map.setStyle("mapbox://styles/mapbox/navigation-preview-day-v4");
      map.removeLayer("places");
      map.removeSource("places");
    } else {
      map.setStyle("mapbox://styles/mapbox/streets-v11");
    }
  }

  checkbox.addEventListener("change", switchLayer);

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("click", function (e) {
      switchLayer(e);
      map.addControl(
        new MapboxLanguage({
          defaultLanguage: "ja",
        })
      );
    });
  }

  geocoder.on("result", function (e) {
    const coordinates = e.result.center;

    if (map.getSource("search-marker")) {
      map.removeLayer("search-marker");
      map.removeSource("search-marker");
    }

    map.addSource("search-marker", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: coordinates,
            },
          },
        ],
      },
    });

    map.addLayer({
      id: "search-marker",
      type: "circle",
      source: "search-marker",
      paint: {
        "circle-radius": 10,
        "circle-color": "orange",
      },
    });

    map.flyTo({
      center: coordinates,
      zoom: 15,
    });
  });
}

function errorLocation() {
  console.log("位置情報を取得できませんでした。");
}
