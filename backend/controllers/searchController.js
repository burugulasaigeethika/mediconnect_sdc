const { searchDoctors: searchDoctorsDB } = require('../services/searchService');
const esService = require('../services/elasticsearchService');

// Search doctors (with Elasticsearch fallback to DB)
exports.searchDoctors = async (req, res) => {
    try {
        const { query, specialization, minFee, maxFee, isAvailable, page, limit } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        // Try Elasticsearch first
        const filters = {
            specialization,
            minFee: minFee ? parseFloat(minFee) : undefined,
            maxFee: maxFee ? parseFloat(maxFee) : undefined,
            isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        };

        const esResult = await esService.searchDoctors(query, filters);

        if (esResult.success && esResult.data.length > 0) {
            return res.json({
                success: true,
                source: 'elasticsearch',
                data: esResult.data,
                pagination: {
                    total: esResult.total,
                    page: esResult.page,
                    limit: esResult.limit,
                    pages: Math.ceil(esResult.total / esResult.limit)
                }
            });
        }

        // Fallback to database search
        const results = await searchDoctorsDB(query);
        res.json({
            success: true,
            source: 'database',
            count: results.length,
            results
        });
    } catch (error) {
        console.error('Search controller error:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
};

// Search medicines
exports.searchMedicines = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, requiresPrescription, page, limit } = req.query;

        const filters = {
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            requiresPrescription: requiresPrescription === 'true' ? true : requiresPrescription === 'false' ? false : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        };

        const result = await esService.searchMedicines(query || '', filters);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Search failed',
                error: result.error
            });
        }

        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                pages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        console.error('Medicine search error:', error);
        res.status(500).json({ message: 'Error searching medicines' });
    }
};

// Autocomplete suggestions
exports.autocomplete = async (req, res) => {
    try {
        const { q, type = 'medicines', field } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const index = type === 'doctors' ? 'doctors' : 'medicines';
        const searchField = field || (type === 'doctors' ? 'fullName' : 'name');

        const result = await esService.autocomplete(q, index, searchField);
        res.json(result);
    } catch (error) {
        console.error('Autocomplete error:', error);
        res.status(500).json({ message: 'Error getting suggestions' });
    }
};

// Index a medicine document
exports.indexMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicineData = req.body;

        const result = await esService.indexDocument('medicines', id, medicineData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Indexing failed',
                error: result.error
            });
        }

        res.json({
            success: true,
            message: 'Medicine indexed successfully'
        });
    } catch (error) {
        console.error('Error indexing medicine:', error);
        res.status(500).json({ message: 'Error indexing medicine' });
    }
};

// Index a doctor document
exports.indexDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorData = req.body;

        const result = await esService.indexDocument('doctors', id, doctorData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Indexing failed',
                error: result.error
            });
        }

        res.json({
            success: true,
            message: 'Doctor indexed successfully'
        });
    } catch (error) {
        console.error('Error indexing doctor:', error);
        res.status(500).json({ message: 'Error indexing doctor' });
    }
};

