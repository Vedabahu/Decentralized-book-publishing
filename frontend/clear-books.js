const { MongoClient } = require('mongodb');

async function clearBooks() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('bookstore');
        const result = await db.collection('books').deleteMany({});
        console.log(`Deleted ${result.deletedCount} books from database`);
    } finally {
        await client.close();
    }
}

clearBooks().catch(console.error);