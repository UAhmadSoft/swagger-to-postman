require("dotenv").config()
const fs = require('fs');
const axios = require('axios');
const fetch = require('node-fetch');
const converter = require('openapi-to-postmanv2');
/**
 * Configuration Section
 * Replace these values with your own.
 */
const SWAGGER_URL = 'http://localhost:6011/api-json';   // URL where your NestJS Swagger is available
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
const POSTMAN_COLLECTION_UID = process.env.POSTMAN_COLLECTION_UID;

(async () => {
  try {
    // 1. Fetch the Swagger JSON from the running NestJS app
    const { data: swaggerSpec } = await axios.get(SWAGGER_URL);

    // 2. Convert the Swagger/OpenAPI spec to a Postman Collection
    // The converter expects a callback style invocation
    converter.convert({ type: 'json', data: swaggerSpec }, {}, (err, conversionResult) => {
      if (err) {
        console.error('Conversion error:', err);
        return;
      }

      if (!conversionResult.result) {
        console.error('Could not convert OpenAPI to Postman:', conversionResult.reason);
        return;
      }

      const postmanCollection = {
        collection: conversionResult.output[0].data
      };

      // console.log('postmanCollection', JSON.stringify(postmanCollection))
      // Save the new Postman collection data to a file
      fs.writeFileSync('updated_postman_collection.json', JSON.stringify(postmanCollection, null, 2), 'utf-8');
      console.log('Postman collection saved to updated_postman_collection.json');

      // 3. Update the Postman collection using the Postman API
      console.log('POSTMAN_API_KEY', POSTMAN_API_KEY)
      console.log('POSTMAN_COLLECTION_UID', POSTMAN_COLLECTION_UID)
      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://api.getpostman.com/collections/${POSTMAN_COLLECTION_UID}`,
        headers: {
          'X-API-Key': POSTMAN_API_KEY,
        },
        data: postmanCollection
      };

      axios.request(config).then(res => {
        console.log('Postman collection updated:', res.data);
      })
        .catch(error => {
          // console.error('Error updating Postman collection:', error.response.data);
          console.log('error', error.response.data)

        });
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
