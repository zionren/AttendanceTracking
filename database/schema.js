const { drizzle } = require('drizzle-orm/postgres-js');
const { pgTable, serial, varchar, timestamp, text, boolean } = require('drizzle-orm/pg-core');
const postgres = require('postgres');

// Database connection
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Clean up the connection string - remove any leading hyphens
connectionString = connectionString.replace(/^-+/, '');

// Parse URL manually to handle special characters in password
const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!match) {
    throw new Error('Invalid DATABASE_URL format');
}

const [, username, password, host, port, database] = match;

// Create client with individual connection parameters to avoid URL encoding issues
const client = postgres({
    host: host,
    port: parseInt(port),
    database: database,
    username: username,
    password: password,
    ssl: { rejectUnauthorized: false },
    onnotice: () => {} // Suppress notices
});
const db = drizzle(client);

// Define tables
const attendance = pgTable('attendance', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    main: varchar('main', { length: 20 }).notNull(),
    loginTime: timestamp('login_time', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    isCustomTime: boolean('is_custom_time').default(false)
});

const mains = pgTable('mains', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    isActive: boolean('is_active').default(true)
});

// Initialize default mains
async function initializeDatabase() {
    try {
        // Create tables if they don't exist
        await client`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                main VARCHAR(20) NOT NULL,
                login_time TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_custom_time BOOLEAN DEFAULT FALSE
            )
        `;

        // Create unique index for preventing duplicate daily attendance  
        try {
            await client`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_daily_unique 
                ON attendance (name, main, (login_time::date))
            `;
        } catch (indexError) {
            console.log('Index creation skipped (may already exist)');
        }

        await client`
            CREATE TABLE IF NOT EXISTS mains (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_active BOOLEAN DEFAULT TRUE
            )
        `;

        // Insert default mains if they don't exist
        const defaultMains = [
            { name: '1', displayName: 'Main 1' },
            { name: '2', displayName: 'Main 2' },
            { name: '3', displayName: 'Main 3' },
            { name: '4', displayName: 'Main 4' },
            { name: 'council', displayName: 'Council' }
        ];

        for (const main of defaultMains) {
            await client`
                INSERT INTO mains (name, display_name)
                VALUES (${main.name}, ${main.displayName})
                ON CONFLICT (name) DO NOTHING
            `;
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Initialize database on startup
initializeDatabase();

module.exports = { db, client, attendance, mains };
