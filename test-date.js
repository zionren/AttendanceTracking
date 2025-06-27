// Test date handling for datetime-local inputs
console.log('Testing date handling...');

// Simulate what happens when user selects a custom time
const testDateTime = "2025-06-27T14:30"; // Example datetime-local value

console.log('Input value:', testDateTime);

// Add seconds if not present
const dateTimeString = testDateTime.includes(':') && testDateTime.split(':').length === 2 
    ? testDateTime + ':00' 
    : testDateTime;

console.log('With seconds:', dateTimeString);

// Create date object
const dateObj = new Date(dateTimeString);
console.log('Date object:', dateObj);
console.log('Is valid:', !isNaN(dateObj.getTime()));
console.log('ISO String:', dateObj.toISOString());

// Test formatting for input
const year = dateObj.getFullYear();
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
const day = String(dateObj.getDate()).padStart(2, '0');
const hours = String(dateObj.getHours()).padStart(2, '0');
const minutes = String(dateObj.getMinutes()).padStart(2, '0');

const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
console.log('Formatted for input:', formattedDateTime);
