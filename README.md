# Swagger to Postman Converter

A Node.js tool that automatically converts Swagger/OpenAPI specifications to Postman collections and updates them via the Postman API.

## Features

- 🔄 Fetch Swagger/OpenAPI specs from a remote URL
- 📦 Convert OpenAPI specifications to Postman Collection v2 format
- ☁️ Automatically update existing Postman collections via the Postman API
- 💾 Save generated collections locally as JSON files
- 🔐 Secure configuration using environment variables

## Prerequisites

- Node.js (v12 or higher)
- A running API with Swagger/OpenAPI documentation
- Postman API key
- Postman collection UID (the collection you want to update)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/UAhmadSoft/swagger-to-postman.git
cd swagger-to-postman
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
SWAGGER_URL=https://your-api.com/api-json
POSTMAN_API_KEY=your-postman-api-key
POSTMAN_COLLECTION_UID=your-collection-uid
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SWAGGER_URL` | URL to your Swagger/OpenAPI JSON endpoint | `https://api.example.com/api-json` |
| `POSTMAN_API_KEY` | Your Postman API key | `PMAK-xxxxxxxxxxxxx` |
| `POSTMAN_COLLECTION_UID` | The UID of your Postman collection | `12345678-1234-1234-1234-123456789012` |

### Getting Your Postman API Key

1. Log in to [Postman](https://www.postman.com/)
2. Go to your [API Keys page](https://web.postman.co/settings/me/api-keys)
3. Generate a new API key
4. Copy the key and add it to your `.env` file

### Getting Your Collection UID

1. Open your collection in Postman
2. Click on the collection's "..." menu
3. Select "Share" → "Via API"
4. Copy the Collection UID from the URL or API documentation

## Usage

Run the conversion script:

```bash
npm start
```

The script will:
1. Fetch the Swagger/OpenAPI specification from your configured URL
2. Convert it to a Postman Collection v2 format
3. Save the collection locally to `updated_postman_collection.json`
4. Update the specified Postman collection via the Postman API

## Output

After successful execution, you'll see:
- A local file `updated_postman_collection.json` containing your converted collection
- Console logs confirming the Postman collection update

## Error Handling

The script includes error handling for:
- Swagger specification fetching failures
- Conversion errors
- Postman API update failures

Check the console output for detailed error messages if something goes wrong.

## Dependencies

- **axios** - HTTP client for fetching Swagger specs and calling Postman API
- **dotenv** - Environment variable management
- **node-fetch** - Additional fetch support
- **openapi-to-postmanv2** - Core conversion library for OpenAPI to Postman format

## Use Cases

- **CI/CD Integration**: Automatically update Postman collections when API changes are deployed
- **API Documentation**: Keep Postman collections in sync with your API documentation
- **Testing**: Ensure your test collections always reflect the latest API structure
- **Team Collaboration**: Share updated API collections with your team automatically

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

UAhmadSoft

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
