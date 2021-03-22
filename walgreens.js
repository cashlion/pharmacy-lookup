const fetch = require('node-fetch')

const run = async () => {

  let raw = await fetch(`https://www.vaccinespotter.org/api/v0/states/TN.json`)

  let data = await raw.json()

  let stores = data.features.filter(row => row.properties.provider === 'walgreens')
    .map(row => {
      return {
        name: row.properties.name,
        address: row.properties.address,
        city: row.properties.city,
        state: row.properties.state,
        postal_code: row.properties.postal_code,
        provider_location_id: row.properties.provider_location_id
      }
    })

  let meta = []

  await asyncForEach(stores, async store => {
    let url = `https://www.walgreens.com/locator/walgreens-${store.postal_code}/id=${store.provider_location_id}`;

    let raw = await fetch(url)

    let data = await raw.text();

    try {
      let match = data.match(/<a href="tel:([0-9\-]+)/)

      meta.push({
        ...store,
        ...{phone: match[1]}
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