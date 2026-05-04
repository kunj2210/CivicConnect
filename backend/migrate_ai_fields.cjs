const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.PG_CONNECTION_STRING
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const queries = [
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR(255) DEFAULT 'Pending'",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_confidence_score FLOAT",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_suggested_category VARCHAR(255)"
        ];

        for (const query of queries) {
            await client.query(query);
            console.log(`Executed: ${query}`);
        }

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
