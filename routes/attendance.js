const express = require('express');
const { client } = require('../database/schema');
const router = express.Router();

// Submit attendance
router.post('/submit', async (req, res) => {
    try {
        const { name, main, loginTime, isCustomTime } = req.body;

        if (!name || !main || !loginTime) {
            return res.status(400).json({ error: 'Name, main, and login time are required' });
        }

        // Check for duplicate attendance (same person, same main, same date)
        const today = new Date(loginTime).toISOString().split('T')[0];
        const duplicateCheck = await client`
            SELECT id FROM attendance 
            WHERE name = ${name} 
            AND main = ${main} 
            AND DATE(login_time) = ${today}
        `;

        if (duplicateCheck.length > 0) {
            return res.status(409).json({ 
                error: 'Duplicate attendance: You have already logged in today for this main.' 
            });
        }

        // Insert attendance record
        const result = await client`
            INSERT INTO attendance (name, main, login_time, is_custom_time)
            VALUES (${name}, ${main}, ${loginTime}, ${isCustomTime || false})
            RETURNING id, name, main, login_time, is_custom_time
        `;

        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendance: result[0]
        });

    } catch (error) {
        console.error('Attendance submission error:', error);
        res.status(500).json({ error: 'Failed to record attendance' });
    }
});

// Get available mains
router.get('/mains', async (req, res) => {
    try {
        const mains = await client`
            SELECT name, display_name FROM mains 
            WHERE is_active = true 
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

module.exports = router;
