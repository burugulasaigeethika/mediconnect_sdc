const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

// Create Elasticsearch client
const esClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'changeme'
    },
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false
});

// Test connection on startup
async function testConnection() {
    try {
        const health = await esClient.cluster.health();
        console.log('✅ Elasticsearch connected successfully');
        console.log(`   Cluster: ${health.cluster_name}`);
        console.log(`   Status: ${health.status}`);
        console.log(`   Nodes: ${health.number_of_nodes}`);
        return true;
    } catch (error) {
        console.error('❌ Elasticsearch connection failed:', error.message);
        console.error('   Please ensure Elasticsearch is running and credentials are correct');
        return false;
    }
}

// Create index with mappings
async function createIndex(indexName, mappings) {
    try {
        const exists = await esClient.indices.exists({ index: indexName });

        if (!exists) {
            await esClient.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 0,
                        analysis: {
                            analyzer: {
                                autocomplete_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'autocomplete_filter']
                                }
                            },
                            filter: {
                                autocomplete_filter: {
                                    type: 'edge_ngram',
                                    min_gram: 2,
                                    max_gram: 20
                                }
                            }
                        }
                    },
                    mappings
                }
            });
            console.log(`✅ Created index: ${indexName}`);
        } else {
            console.log(`ℹ️  Index already exists: ${indexName}`);
        }
    } catch (error) {
        console.error(`❌ Error creating index ${indexName}:`, error.message);
        throw error;
    }
}

// Initialize all indices
async function initializeIndices() {
    try {
        // Medicines index
        await createIndex('medicines', {
            properties: {
                name: {
                    type: 'text',
                    fields: {
                        keyword: { type: 'keyword' },
                        autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' }
                    }
                },
                category: { type: 'keyword' },
                manufacturer: { type: 'text' },
                description: { type: 'text' },
                price: { type: 'float' },
                stock: { type: 'integer' },
                requiresPrescription: { type: 'boolean' },
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' }
            }
        });

        // Doctors index
        await createIndex('doctors', {
            properties: {
                fullName: {
                    type: 'text',
                    fields: {
                        keyword: { type: 'keyword' },
                        autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' }
                    }
                },
                email: { type: 'keyword' },
                specialization: { type: 'keyword' },
                qualifications: { type: 'text' },
                experience: { type: 'integer' },
                consultationFee: { type: 'float' },
                rating: { type: 'float' },
                availableSlots: { type: 'nested' },
                isAvailable: { type: 'boolean' },
                createdAt: { type: 'date' }
            }
        });

        console.log('✅ All indices initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing indices:', error.message);
    }
}

module.exports = {
    esClient,
    testConnection,
    initializeIndices
};
