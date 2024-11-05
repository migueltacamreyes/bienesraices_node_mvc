(function(){
  // Logical Or
  const lat = 14.6761451;
  const lng = -90.4908473;
  const mapa = L.map('mapa-inicio').setView([lat, lng], 16);

  let markers = new L.FeatureGroup().addTo(mapa);

  let propiedades = [];

  //Filtros
  const filtros = {
    categoria: '',
    precio: ''
  }
   
  const categoriaSelet = document.querySelector("#categorias");
  const precioSelet = document.querySelector("#precios");


  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);
  
  //Filtrado de categorias y precios
  categoriaSelet.addEventListener('change', e => {
    filtros.categoria = +e.target.value;
    filtrarPropiedades();
  })

  precioSelet.addEventListener('change', e => {
    filtros.precio = +e.target.value;
    filtrarPropiedades();
  })


  const obtenerPropiedades = async () => {
    try {
      const url = 'api/propiedades';
      const respuesta = await fetch(url);

      propiedades = await respuesta.json();

      //console.log(propiedades);

      mostrarProiedades(propiedades);

    } catch (error) {
      console.log(error)
    }
  }
  const mostrarProiedades = propiedades => {

    //limpiar Markers previos
    markers.clearLayers();

    propiedades.forEach(propiedad => {
      const marker = new L.marker([propiedad?.lat, propiedad?.lng],{
        autoPan: true
      })
      .addTo(mapa)
      .bindPopup(`
        <p class="text-gray-600 font-bold">${propiedad?.categoria.nombre}</p>
        <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
        <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad">
        <p class="text-gray-600 font-bold">${propiedad?.precio.nombre}</p>
        <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercas">Ver Propiedad</a>
        `)

      markers.addLayer(marker);
    });
  }

  const filtrarPropiedades = () => {
    const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);
    mostrarProiedades(resultado);
  }

  const filtrarCategoria = (propiedad) => {
    return filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad
  }

  const filtrarPrecio = (propiedad) => {
    return filtros.precio ? propiedad.precioId === filtros.precio : propiedad
  }

  obtenerPropiedades();

})()