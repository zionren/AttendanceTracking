const express = require('express');
const { client } = require('../database/schema');
const router = express.Router();

// Admin authentication
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'RenZion' && password === 'Zion102%') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get daily attendance statistics for bar chart
router.get('/daily-stats', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const daysInt = parseInt(days);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInt);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        
        const stats = await client`
            SELECT 
                login_time::date as date,
                COUNT(*) as count
            FROM attendance
            WHERE login_time::date >= ${cutoffDateStr}::date
            GROUP BY login_time::date
            ORDER BY date DESC
        `;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({ error: 'Failed to fetch daily statistics' });
    }
});

// Get attendance by main for pie chart
router.get('/main-stats', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const stats = await client`
            SELECT 
                m.display_name as main,
                COUNT(a.id) as count
            FROM mains m
            LEFT JOIN attendance a ON m.name = a.main 
                AND DATE(a.login_time) = ${targetDate}
            WHERE m.is_active = true
            GROUP BY m.name, m.display_name
            ORDER BY 
                CASE 
                    WHEN m.name = 'council' THEN 999 
                    ELSE CAST(m.name AS INTEGER) 
                END
        `;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching main stats:', error);
        res.status(500).json({ error: 'Failed to fetch main statistics' });
    }
});

// Get attendance records for specific main or all mains
router.get('/main-attendance/:main', async (req, res) => {
    try {
        const { main } = req.params;
        const { date, startDate, endDate } = req.query;

        let query;
        const isAllMains = main === 'all';

        if (date) {
            if (isAllMains) {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE DATE(login_time) = ${date}
                    ORDER BY login_time DESC
                `;
            } else {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE main = ${main} AND DATE(login_time) = ${date}
                    ORDER BY login_time DESC
                `;
            }
        } else if (startDate && endDate) {
            if (isAllMains) {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE DATE(login_time) BETWEEN ${startDate} AND ${endDate}
                    ORDER BY login_time DESC
                `;
            } else {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE main = ${main} 
                    AND DATE(login_time) BETWEEN ${startDate} AND ${endDate}
                    ORDER BY login_time DESC
                `;
            }
        } else {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            if (isAllMains) {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE DATE(login_time) = ${today}
                    ORDER BY login_time DESC
                `;
            } else {
                query = client`
                    SELECT id, name, main, login_time, is_custom_time
                    FROM attendance
                    WHERE main = ${main} AND DATE(login_time) = ${today}
                    ORDER BY login_time DESC
                `;
            }
        }

        const attendance = await query;
        res.json(attendance);
    } catch (error) {
        console.error('Error fetching main attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get Gantt chart data
router.get('/gantt-data', async (req, res) => {
    try {
        const { main, startDate, endDate } = req.query;
        
        const defaultEndDate = new Date().toISOString().split('T')[0];
        const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let whereClause = `WHERE DATE(login_time) BETWEEN '${startDate || defaultStartDate}' AND '${endDate || defaultEndDate}'`;
        if (main && main !== 'all') {
            whereClause += ` AND main = '${main}'`;
        }

        const ganttData = await client`
            SELECT 
                name,
                main,
                DATE(login_time) as date,
                MIN(login_time) as first_login,
                MAX(login_time) as last_login,
                COUNT(*) as login_count
            FROM attendance
            ${client.unsafe(whereClause)}
            GROUP BY name, main, DATE(login_time)
            ORDER BY name, date
        `;

        res.json(ganttData);
    } catch (error) {
        console.error('Error fetching Gantt data:', error);
        res.status(500).json({ error: 'Failed to fetch Gantt chart data' });
    }
});

// Create new main
router.post('/mains', async (req, res) => {
    try {
        const { name, displayName } = req.body;

        if (!name || !displayName) {
            return res.status(400).json({ error: 'Name and display name are required' });
        }

        const result = await client`
            INSERT INTO mains (name, display_name)
            VALUES (${name.toLowerCase()}, ${displayName})
            RETURNING id, name, display_name
        `;

        res.status(201).json({
            message: 'Main created successfully',
            main: result[0]
        });

    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Main with this name already exists' });
        } else {
            console.error('Error creating main:', error);
            res.status(500).json({ error: 'Failed to create main' });
        }
    }
});

// Get all mains for admin
router.get('/mains', async (req, res) => {
    try {
        const mains = await client`
            SELECT id, name, display_name, is_active, created_at
            FROM mains
            ORDER BY 
                CASE 
                    WHEN name = 'council' THEN 999 
                    ELSE CAST(
                        CASE 
                            WHEN name ~ '^[0-9]+$' THEN name::INTEGER
                            ELSE 998
                        END
                    AS INTEGER)
                END
        `;

        res.json(mains);
    } catch (error) {
        console.error('Error fetching mains:', error);
        res.status(500).json({ error: 'Failed to fetch mains' });
    }
});

// Get attendance data for PDF export
router.get('/export-data', async (req, res) => {
    try {
        const { mains, startDate, endDate } = req.query;
        
        let whereClause = `WHERE 1=1`;
        
        if (startDate && endDate) {
            whereClause += ` AND DATE(login_time) BETWEEN '${startDate}' AND '${endDate}'`;
        }
        
        if (mains && mains !== 'all') {
            const mainsList = mains.split(',').map(m => `'${m}'`).join(',');
            whereClause += ` AND main IN (${mainsList})`;
        }

        const attendanceData = await client`
            SELECT 
                a.name,
                m.display_name as main,
                a.login_time,
                a.is_custom_time
            FROM attendance a
            JOIN mains m ON a.main = m.name
            ${client.unsafe(whereClause)}
            ORDER BY a.login_time DESC
        `;

        res.json(attendanceData);
    } catch (error) {
        console.error('Error fetching export data:', error);
        res.status(500).json({ error: 'Failed to fetch export data' });
    }
});

// Update main
router.put('/mains/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, displayName } = req.body;

        if (!name || !displayName) {
            return res.status(400).json({ error: 'Name and display name are required' });
        }

        const result = await client`
            UPDATE mains 
            SET name = ${name.toLowerCase()}, display_name = ${displayName}
            WHERE id = ${id}
            RETURNING id, name, display_name, is_active
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Main not found' });
        }

        res.json({
            message: 'Main updated successfully',
            main: result[0]
        });

    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Main with this name already exists' });
        } else {
            console.error('Error updating main:', error);
            res.status(500).json({ error: 'Failed to update main' });
        }
    }
});

// Delete main
router.delete('/mains/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if main is used in attendance records
        const attendanceCount = await client`
            SELECT COUNT(*) as count
            FROM attendance a
            JOIN mains m ON a.main = m.name
            WHERE m.id = ${id}
        `;

        if (parseInt(attendanceCount[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete main with existing attendance records. Archive it instead.' 
            });
        }

        const result = await client`
            DELETE FROM mains 
            WHERE id = ${id}
            RETURNING id, name, display_name
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Main not found' });
        }

        res.json({
            message: 'Main deleted successfully',
            main: result[0]
        });

    } catch (error) {
        console.error('Error deleting main:', error);
        res.status(500).json({ error: 'Failed to delete main' });
    }
});

// Toggle main active status
router.patch('/mains/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await client`
            UPDATE mains 
            SET is_active = NOT is_active
            WHERE id = ${id}
            RETURNING id, name, display_name, is_active
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Main not found' });
        }

        res.json({
            message: 'Main status updated successfully',
            main: result[0]
        });

    } catch (error) {
        console.error('Error toggling main status:', error);
        res.status(500).json({ error: 'Failed to update main status' });
    }
});

// Edit attendance record
router.put('/attendance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, main, login_time, is_custom_time } = req.body;

        if (!name || !main || !login_time) {
            return res.status(400).json({ error: 'Name, main, and login time are required' });
        }

        // Check if record exists
        const existingRecord = await client`
            SELECT id FROM attendance WHERE id = ${id}
        `;

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        // Check for duplicate attendance (same person, same main, same date, different ID)
        const recordDate = new Date(login_time).toISOString().split('T')[0];
        const duplicateCheck = await client`
            SELECT id FROM attendance 
            WHERE name = ${name} 
            AND main = ${main} 
            AND DATE(login_time) = ${recordDate}
            AND id != ${id}
        `;

        if (duplicateCheck.length > 0) {
            return res.status(409).json({ 
                error: 'Duplicate attendance: This person already has attendance for this main on this date.' 
            });
        }

        // Update the record
        const result = await client`
            UPDATE attendance 
            SET name = ${name}, 
                main = ${main}, 
                login_time = ${login_time}, 
                is_custom_time = ${is_custom_time || false}
            WHERE id = ${id}
            RETURNING id, name, main, login_time, is_custom_time
        `;

        res.json({
            message: 'Attendance record updated successfully',
            attendance: result[0]
        });

    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({ error: 'Failed to update attendance record' });
    }
});

// Delete attendance record
router.delete('/attendance/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if record exists
        const existingRecord = await client`
            SELECT id, name FROM attendance WHERE id = ${id}
        `;

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        // Delete the record
        await client`
            DELETE FROM attendance WHERE id = ${id}
        `;

        res.json({
            message: 'Attendance record deleted successfully',
            deletedRecord: existingRecord[0]
        });

    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ error: 'Failed to delete attendance record' });
    }
});

module.exports = router;
