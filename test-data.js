const { client } = require('./database/schema');

async function addTestData() {
    try {
        // Add a test main if it doesn't exist
        const mainExists = await client`SELECT * FROM mains WHERE name = '5'`;
        if (mainExists.length === 0) {
            await client`INSERT INTO mains (name, display_name) VALUES ('5', 'Main 5')`;
            console.log('Added test main');
        }

        // Add a test attendance record for today
        const today = new Date();
        const testRecord = await client`
            INSERT INTO attendance (name, main, login_time, is_custom_time)
            VALUES ('John Smith', '5', ${today.toISOString()}, false)
            ON CONFLICT DO NOTHING
            RETURNING *
        `;
        
        if (testRecord.length > 0) {
            console.log('Added test attendance record:', testRecord[0]);
        } else {
            console.log('Test record already exists or conflict occurred');
        }

        // Check what records exist for today
        const todayStr = today.toISOString().split('T')[0];
        const todayRecords = await client`
            SELECT * FROM attendance 
            WHERE login_time::date = ${todayStr}::date
            ORDER BY login_time DESC
        `;
        
        console.log(`Found ${todayRecords.length} records for today (${todayStr}):`, todayRecords);

        process.exit(0);
    } catch (error) {
        console.error('Error adding test data:', error);
        process.exit(1);
    }
}

addTestData();
