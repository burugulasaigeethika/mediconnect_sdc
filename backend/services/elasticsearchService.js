const { esClient } = require('../config/elasticsearchClient');

/**
 * Index a document in Elasticsearch
 */
async function indexDocument(index, id, document) {
    try {
        await esClient.index({
            index,
            id: id.toString(),
            body: document,
            refresh: 'wait_for'
        });
        return { success: true };
    } catch (error) {
        console.error(`Error indexing document in ${index}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update a document in Elasticsearch
 */
async function updateDocument(index, id, document) {
    try {
        await esClient.update({
            index,
            id: id.toString(),
            body: { doc: document },
            refresh: 'wait_for'
        });
        return { success: true };
    } catch (error) {
        console.error(`Error updating document in ${index}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a document from Elasticsearch
 */
async function deleteDocument(index, id) {
    try {
        await esClient.delete({
            index,
            id: id.toString(),
            refresh: 'wait_for'
        });
        return { success: true };
    } catch (error) {
        console.error(`Error deleting document from ${index}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Search medicines with filters and pagination
 */
async function searchMedicines(query, filters = {}) {
    const { category, minPrice, maxPrice, requiresPrescription, page = 1, limit = 20 } = filters;

    const must = [];
    const filter = [];

    // Text search query
    if (query && query.trim()) {
        must.push({
            multi_match: {
                query,
                fields: ['name^3', 'description', 'manufacturer', 'tags'],
                fuzziness: 'AUTO'
            }
        });
    }

    // Apply filters
    if (category) {
        filter.push({ term: { category } });
    }

    if (requiresPrescription !== undefined) {
        filter.push({ term: { requiresPrescription } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        const range = { price: {} };
        if (minPrice !== undefined) range.price.gte = minPrice;
        if (maxPrice !== undefined) range.price.lte = maxPrice;
        filter.push({ range });
    }

    try {
        const result = await esClient.search({
            index: 'medicines',
            body: {
                from: (page - 1) * limit,
                size: limit,
                query: {
                    bool: {
                        must: must.length > 0 ? must : [{ match_all: {} }],
                        filter
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { name: { order: 'asc' } }
                ]
            }
        });

        return {
            success: true,
            data: result.hits.hits.map(hit => ({
                id: hit._id,
                score: hit._score,
                ...hit._source
            })),
            total: result.hits.total.value,
            page,
            limit
        };
    } catch (error) {
        console.error('Error searching medicines:', error.message);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Search doctors with filters
 */
async function searchDoctors(query, filters = {}) {
    const { specialization, minFee, maxFee, isAvailable, page = 1, limit = 20 } = filters;

    const must = [];
    const filter = [];

    // Text search query
    if (query && query.trim()) {
        must.push({
            multi_match: {
                query,
                fields: ['fullName^3', 'specialization^2', 'qualifications'],
                fuzziness: 'AUTO'
            }
        });
    }

    // Apply filters
    if (specialization) {
        filter.push({ term: { specialization } });
    }

    if (isAvailable !== undefined) {
        filter.push({ term: { isAvailable } });
    }

    if (minFee !== undefined || maxFee !== undefined) {
        const range = { consultationFee: {} };
        if (minFee !== undefined) range.consultationFee.gte = minFee;
        if (maxFee !== undefined) range.consultationFee.lte = maxFee;
        filter.push({ range });
    }

    try {
        const result = await esClient.search({
            index: 'doctors',
            body: {
                from: (page - 1) * limit,
                size: limit,
                query: {
                    bool: {
                        must: must.length > 0 ? must : [{ match_all: {} }],
                        filter
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { rating: { order: 'desc' } },
                    { fullName: { order: 'asc' } }
                ]
            }
        });

        return {
            success: true,
            data: result.hits.hits.map(hit => ({
                id: hit._id,
                score: hit._score,
                ...hit._source
            })),
            total: result.hits.total.value,
            page,
            limit
        };
    } catch (error) {
        console.error('Error searching doctors:', error.message);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Autocomplete suggestions
 */
async function autocomplete(query, index = 'medicines', field = 'name') {
    if (!query || query.trim().length < 2) {
        return { success: true, suggestions: [] };
    }

    try {
        const result = await esClient.search({
            index,
            body: {
                size: 10,
                query: {
                    match: {
                        [`${field}.autocomplete`]: {
                            query,
                            operator: 'and'
                        }
                    }
                },
                _source: [field]
            }
        });

        return {
            success: true,
            suggestions: result.hits.hits.map(hit => ({
                id: hit._id,
                text: hit._source[field]
            }))
        };
    } catch (error) {
        console.error('Error getting autocomplete suggestions:', error.message);
        return { success: false, error: error.message, suggestions: [] };
    }
}

/**
 * Bulk index documents
 */
async function bulkIndex(index, documents) {
    if (!documents || documents.length === 0) {
        return { success: true, indexed: 0 };
    }

    const body = documents.flatMap(doc => [
        { index: { _index: index, _id: doc._id || doc.id } },
        doc
    ]);

    try {
        const result = await esClient.bulk({
            body,
            refresh: 'wait_for'
        });

        const errors = result.items.filter(item => item.index.error);

        return {
            success: errors.length === 0,
            indexed: result.items.length - errors.length,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        console.error('Error bulk indexing documents:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    indexDocument,
    updateDocument,
    deleteDocument,
    searchMedicines,
    searchDoctors,
    autocomplete,
    bulkIndex
};
