require("dotenv").config()
const fs = require('fs');
const axios = require('axios');
const fetch = require('node-fetch');
const converter = require('openapi-to-postmanv2');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Configuration Section
 * Replace these values with your own.
 */
const SWAGGER_URL = process.env.SWAGGER_URL;   // URL where your NestJS Swagger is available
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
const POSTMAN_COLLECTION_UID = process.env.POSTMAN_COLLECTION_UID;

// Banner
console.log(chalk.cyan.bold('\n╔══════════════════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║                                                      ║'));
console.log(chalk.cyan.bold('║') + chalk.yellow.bold('     🔄 SWAGGER TO POSTMAN CONVERTER 🔄           ') + chalk.cyan.bold('║'));
console.log(chalk.cyan.bold('║                                                      ║'));
console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════╝\n'));

(async () => {
  let fetchSpinner, convertSpinner, updateSpinner;

  try {
    // 1. Fetch the Swagger JSON from the running NestJS app
    fetchSpinner = ora({
      text: chalk.blue.bold('Fetching Swagger/OpenAPI specification...'),
      spinner: 'dots'
    }).start();

    const { data: swaggerSpec } = await axios.get(SWAGGER_URL);

    fetchSpinner.succeed(chalk.green.bold('✓ Swagger specification fetched successfully!'));
    console.log(chalk.gray(`   URL: ${SWAGGER_URL}\n`));

    // 2. Convert the Swagger/OpenAPI spec to a Postman Collection
    convertSpinner = ora({
      text: chalk.blue.bold('Converting to Postman Collection v2...'),
      spinner: 'dots'
    }).start();

    // The converter expects a callback style invocation
    converter.convert({ type: 'json', data: swaggerSpec }, {}, (err, conversionResult) => {
      if (err) {
        convertSpinner.fail(chalk.red.bold('✗ Conversion failed!'));
        console.error(chalk.red('Error:'), err);
        return;
      }

      if (!conversionResult.result) {
        convertSpinner.fail(chalk.red.bold('✗ Could not convert OpenAPI to Postman!'));
        console.error(chalk.red('Reason:'), conversionResult.reason);
        return;
      }

      convertSpinner.succeed(chalk.green.bold('✓ Conversion completed successfully!'));

      const postmanCollection = {
        collection: conversionResult.output[0].data
      };

      // Save the new Postman collection data to a file
      const saveSpinner = ora({
        text: chalk.blue.bold('Saving collection to file...'),
        spinner: 'dots'
      }).start();

      fs.writeFileSync('updated_postman_collection-file.json', JSON.stringify(postmanCollection, null, 2), 'utf-8');

      saveSpinner.succeed(chalk.green.bold('✓ Collection saved to updated_postman_collection-file.json\n'));

      // 3. Update the Postman collection using the Postman API
      console.log(chalk.magenta.bold('📡 Postman API Configuration:'));
      console.log(chalk.gray(`   API Key: ${POSTMAN_API_KEY ? chalk.green('✓ Set') : chalk.red('✗ Missing')}`));
      console.log(chalk.gray(`   Collection UID: ${POSTMAN_COLLECTION_UID ? chalk.green('✓ Set') : chalk.red('✗ Missing')}\n`));

      updateSpinner = ora({
        text: chalk.blue.bold('Updating Postman collection via API...'),
        spinner: 'dots'
      }).start();

      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://api.getpostman.com/collections/${POSTMAN_COLLECTION_UID}`,
        headers: {
          'X-API-Key': POSTMAN_API_KEY,
        },
        data: postmanCollection
      };

      // Before updating, fetch the existing collection to preserve its name
      const getConfig = {
        method: 'get',
        url: `https://api.getpostman.com/collections/${POSTMAN_COLLECTION_UID}`,
        headers: {
          'X-API-Key': POSTMAN_API_KEY,
        }
      };

      axios.request(getConfig).then(getRes => {
        const existingName = getRes.data.collection?.info?.name;
        if (existingName) {
          // The Postman update endpoint expects the collection payload under `collection` with `info.name`.
          // Ensure we set the existing name so the PUT won't rename the collection.
          if (!postmanCollection.collection.info) postmanCollection.collection.info = {};
          postmanCollection.collection.info.name = existingName;
        }

        // Now perform the PUT to update collection contents without changing name
        axios.request(config).then(res => {
          updateSpinner.succeed(chalk.green.bold('✓ Postman collection updated successfully!'));
          console.log(chalk.cyan('\n📦 Collection Details:'));
          console.log(chalk.gray(`   Name: ${postmanCollection.collection.info?.name || 'N/A'}`));
          console.log(chalk.gray(`   UID: ${res.data.collection?.uid || POSTMAN_COLLECTION_UID}`));
          console.log(chalk.green.bold('\n🎉 All operations completed successfully!\n'));
        })
          .catch(error => {
            updateSpinner.fail(chalk.red.bold('✗ Failed to update Postman collection!'));
            console.error(chalk.red.bold('\n❌ Error Details:'));
            if (error.response?.data) {
              console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
            } else {
              console.error(chalk.red(error.message));
            }
            console.log(chalk.yellow('\n💡 Tip: Check your API key and Collection UID in the .env file\n'));
          });

      }).catch(err => {
        // If we can't fetch the existing collection, proceed with PUT but warn the user
        console.log(chalk.yellow('⚠️ Could not fetch existing collection name. The collection name might be changed by this update.'));
        axios.request(config).then(res => {
          updateSpinner.succeed(chalk.green.bold('✓ Postman collection updated successfully!'));
          console.log(chalk.cyan('\n📦 Collection Details:'));
          console.log(chalk.gray(`   Name: ${res.data.collection?.name || postmanCollection.collection.info?.name || 'N/A'}`));
          console.log(chalk.gray(`   UID: ${res.data.collection?.uid || POSTMAN_COLLECTION_UID}`));
          console.log(chalk.green.bold('\n🎉 All operations completed successfully!\n'));
        })
          .catch(error => {
            updateSpinner.fail(chalk.red.bold('✗ Failed to update Postman collection!'));
            console.error(chalk.red.bold('\n❌ Error Details:'));
            if (error.response?.data) {
              console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
            } else {
              console.error(chalk.red(error.message));
            }
            console.log(chalk.yellow('\n💡 Tip: Check your API key and Collection UID in the .env file\n'));
          });
      });
    });
  } catch (error) {
    if (fetchSpinner) fetchSpinner.fail(chalk.red.bold('✗ Failed to fetch Swagger specification!'));
    console.error(chalk.red.bold('\n❌ An error occurred:'));
    console.error(chalk.red(error.message));

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('\n💡 Tip: Make sure your API server is running and the SWAGGER_URL is correct\n'));
    }
    process.exit(1);
  }
})();
