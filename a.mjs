import datoFetch from './exports/dato-fetch.mjs'

const query = `query MyQuery($skip: IntType) {
  allTranslations(skip: $skip, first: 1) {
    name
  }
}
`
const data = await datoFetch(query, {
  fieldName: '',
  headers: {
    Authorization: `Bearer 16cfab01424050636a9f9eab608b9a`
  }
})

console.log(data)
