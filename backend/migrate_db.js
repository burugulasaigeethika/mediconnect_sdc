const { MongoClient } = require('mongodb');

async function migrateDatabase() {
    const remoteUri = process.argv[2];
    
    if (!remoteUri) {
        console.error('❌ Error: Please provide the target MongoDB Atlas connection string as an argument.');
        console.error('Example: node migrate_db.js "mongodb+srv://username:password@cluster.mongodb.net/mediconnect?retryWrites=true&w=majority"\n');
        process.exit(1);
    }

    const localUri = 'mongodb://localhost:27017/mediconnect';
    
    console.log('--------------------------------------------------');
    console.log('           MEDICONNECT DATABASE MIGRATOR          ');
    console.log('--------------------------------------------------');
    console.log(`Source: ${localUri}`);
    
    // Parse target database name from URI
    let targetDbName = 'test';
    try {
        const parsed = new URL(remoteUri.replace('mongodb+srv://', 'http://')); // URL parser helper
        const path = parsed.pathname.substring(1);
        if (path) {
            targetDbName = path.split('?')[0];
        } else {
            console.warn('⚠️  Warning: No database name specified in Atlas URI path. It will default to "test".');
            console.warn('We highly recommend appending "/mediconnect" before the "?" in your connection string.');
        }
    } catch (e) {
        // Fallback for non-standard URIs
        const match = remoteUri.match(/\/([^/?]+)(\?|$)/);
        if (match && match[1]) {
            targetDbName = match[1];
        }
    }
    
    console.log(`Target Database: ${targetDbName}`);
    console.log('--------------------------------------------------\n');

    let localClient, remoteClient;

    try {
        console.log('Connecting to local database...');
        localClient = await MongoClient.connect(localUri);
        const localDb = localClient.db();
        console.log('✅ Connected to Local MongoDB.');

        console.log('Connecting to remote MongoDB Atlas...');
        remoteClient = await MongoClient.connect(remoteUri);
        const remoteDb = remoteClient.db();
        console.log('✅ Connected to MongoDB Atlas.\n');

        const collections = await localDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`Found ${collectionNames.length} collections in local database:`);
        console.log(collectionNames.map(name => ` - ${name}`).join('\n') + '\n');

        for (const name of collectionNames) {
            console.log(`Processing collection: "${name}"...`);
            
            const localColl = localDb.collection(name);
            const remoteColl = remoteDb.collection(name);

            // Fetch all documents from local collection
            const docs = await localColl.find({}).toArray();
            console.log(` - Read ${docs.length} documents from local "${name}".`);

            if (docs.length === 0) {
                console.log(` - Skipping migration for empty collection "${name}".\n`);
                continue;
            }

            // Check if remote collection already has data
            const remoteCount = await remoteColl.countDocuments();
            if (remoteCount > 0) {
                console.warn(` ⚠️  Warning: Target collection "${name}" already contains ${remoteCount} documents.`);
                console.log(` - Inserting new documents without clearing existing ones...`);
            }

            // Insert many
            const result = await remoteColl.insertMany(docs);
            console.log(` ✅ Successfully migrated ${result.insertedCount} documents to Atlas "${name}".\n`);
        }

        console.log('--------------------------------------------------');
        console.log('🎉 Migration completed successfully!');
        console.log('--------------------------------------------------\n');

    } catch (error) {
        console.error('❌ Migration failed with error:', error);
    } finally {
        if (localClient) await localClient.close();
        if (remoteClient) await remoteClient.close();
    }
}

migrateDatabase();
