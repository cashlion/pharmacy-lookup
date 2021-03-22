const fetch = require('node-fetch')

const run = async () => {

  let raw = await fetch(`https://www.vaccinespotter.org/api/v0/states/TN.json`)

  let data = await raw.json()

  let stores = data.features.filter(row => row.properties.provider === 'walmart')
    .map(row => {
      return {
        name: row.properties.name,
        city: row.properties.city,
        state: row.properties.state,
        postal_code: row.properties.postal_code,
        provider_location_id: row.properties.provider_location_id
      }
    })

  let meta = []

  await asyncForEach(stores, async store => {
    let url = `https://www.walmart.com/store/${store.provider_location_id}-${store.city.toLowerCase()}-${store.state.toLowerCase()}`;

    let raw = await fetch(url)

    let data = await raw.text();

    try {
      let match = data.match(/<script>window\.__WML_REDUX_INITIAL_STATE__ = (.*);<\/script>/)

      let services = JSON.parse(match[1]).store.primaryServices;

      let pharmacy = services.find(ser => ser.name === 'PHARMACY')

      meta.push({
        ...store,
        ...{phone: pharmacy.phone}
      });
    } catch (e) {
      meta.push({...store})
    }
  })

  console.log(JSON.stringify(meta));
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index]);
  }
}



run()