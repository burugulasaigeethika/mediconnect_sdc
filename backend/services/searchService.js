const { Client } = require('@elastic/elasticsearch');

let client = null;

const connectToElastic = () => {
    if (!process.env.ELASTICSEARCH_NODE) {
        console.warn('⚠️ Elasticsearch not configured');
        return;
    }

    client = new Client({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD || 'changeme'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    client.info()
        .then(response => console.log('✅ Connected to Elasticsearch:', response.name))
        .catch(error => console.error('❌ Elasticsearch Connection Error:', error));
};

const createIndices = async () => {
    if (!client) return;

    try {
        const indexExists = await client.indices.exists({ index: 'doctors' });
        if (!indexExists) {
            await client.indices.create({
                index: 'doctors',
                body: {
                    mappings: {
                        properties: {
                            name: { type: 'text' },
                            specialization: { type: 'keyword' },
                            email: { type: 'keyword' }
                        }
                    }
                }
            });
            console.log('📝 Created index: doctors');
        }
    } catch (error) {
        console.error('Error creating indices:', error);
    }
};

const indexDocument = async (index, id, body) => {
    if (!client) return;
    try {
        await client.index({
            index,
            id,
            document: body
        });
        console.log(`🔍 Indexed document in ${index}: ${id}`);
    } catch (error) {
        console.error(`Error indexing document in ${index}:`, error);
    }
};

const searchDoctors = async (query) => {
    if (!client) return [];
    try {
        const result = await client.search({
            index: 'doctors',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['name', 'specialization', 'email']
                    }
                }
            }
        });
        return result.hits.hits.map(hit => hit._source);
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
};

module.exports = { connectToElastic, createIndices, indexDocument, searchDoctors };
