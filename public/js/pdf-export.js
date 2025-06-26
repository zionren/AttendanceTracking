// PDF Export Utility for Gazelvouer Academy Attendance System
class PDFExporter {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
        if (!this.jsPDF) {
            console.error('jsPDF library not loaded');
            return;
        }
        
        // Academy branding colors
        this.colors = {
            primary: [212, 175, 55],      // Gold
            secondary: [139, 69, 19],     // Vintage brown
            accent: [205, 127, 50],       // Bronze
            text: [45, 24, 16],           // Dark brown
            light: [245, 245, 220],       // Cream
            border: [212, 175, 55]        // Gold border
        };
        
        this.fonts = {
            heading: 'times',
            body: 'helvetica'
        };
    }

    // Export attendance data to PDF
    exportAttendanceData(data, options = {}) {
        if (!this.jsPDF) {
            alert('PDF export library not available');
            return;
        }

        try {
            const doc = new this.jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            
            let yPosition = margin;

            // Add header
            yPosition = this.addHeader(doc, yPosition, pageWidth);
            yPosition += 10;

            // Add title
            doc.setFont(this.fonts.heading, 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...this.colors.secondary);
            
            let title = 'Attendance Report';
            if (options.startDate && options.endDate) {
                title += ` (${this.formatDate(options.startDate)} - ${this.formatDate(options.endDate)})`;
            }
            
            const titleWidth = doc.getTextWidth(title);
            doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
            yPosition += 15;

            // Add filters info
            if (options.mains && options.mains.length > 0 && !options.mains.includes('all')) {
                doc.setFont(this.fonts.body, 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...this.colors.text);
                doc.text(`Selected Mains: ${options.mains.join(', ')}`, margin, yPosition);
                yPosition += 8;
            }

            // Add summary statistics
            yPosition = this.addSummaryStats(doc, data, yPosition, margin, contentWidth);
            yPosition += 10;

            // Add data table
            if (data.length > 0) {
                yPosition = this.addDataTable(doc, data, yPosition, margin, contentWidth, pageHeight);
            } else {
                doc.setFont(this.fonts.body, 'italic');
                doc.setFontSize(12);
                doc.setTextColor(...this.colors.accent);
                doc.text('No attendance records found for the selected criteria.', margin, yPosition);
            }

            // Add footer
            this.addFooter(doc, pageHeight);

            // Save the PDF
            const filename = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            return true;

        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
            return false;
        }
    }

    // Export chart as PDF
    exportChartAsPDF(chartCanvas, title, filename) {
        if (!this.jsPDF) {
            alert('PDF export library not available');
            return false;
        }

        try {
            const doc = new this.jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            
            let yPosition = margin;

            // Add header
            yPosition = this.addHeader(doc, yPosition, pageWidth);
            yPosition += 10;

            // Add title
            doc.setFont(this.fonts.heading, 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...this.colors.secondary);
            const titleWidth = doc.getTextWidth(title);
            doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
            yPosition += 20;

            // Add chart image
            if (chartCanvas) {
                const chartDataURL = chartCanvas.toDataURL('image/png', 1.0);
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (imgWidth * chartCanvas.height) / chartCanvas.width;
                
                // Check if image fits on page
                if (yPosition + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                doc.addImage(chartDataURL, 'PNG', margin, yPosition, imgWidth, imgHeight);
            }

            // Add footer
            this.addFooter(doc, pageHeight);

            // Save the PDF
            const pdfFilename = filename || `chart-export-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(pdfFilename);

            return true;

        } catch (error) {
            console.error('Error exporting chart to PDF:', error);
            alert('Failed to export chart to PDF. Please try again.');
            return false;
        }
    }

    // Export Gantt chart data as PDF
    exportGanttData(ganttData, options = {}) {
        if (!this.jsPDF) {
            alert('PDF export library not available');
            return false;
        }

        try {
            const doc = new this.jsPDF('l', 'mm', 'a4'); // Landscape orientation
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            
            let yPosition = margin;

            // Add header
            yPosition = this.addHeader(doc, yPosition, pageWidth);
            yPosition += 10;

            // Add title
            doc.setFont(this.fonts.heading, 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...this.colors.secondary);
            
            let title = 'Attendance Gantt Chart';
            if (options.startDate && options.endDate) {
                title += ` (${this.formatDate(options.startDate)} - ${this.formatDate(options.endDate)})`;
            }
            
            const titleWidth = doc.getTextWidth(title);
            doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
            yPosition += 20;

            // Create simplified Gantt representation
            if (ganttData && ganttData.length > 0) {
                // Group data by person
                const peopleData = {};
                ganttData.forEach(record => {
                    const key = `${record.name} (${record.main})`;
                    if (!peopleData[key]) {
                        peopleData[key] = [];
                    }
                    peopleData[key].push(record.date);
                });

                // Add table headers
                doc.setFont(this.fonts.body, 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...this.colors.text);
                
                const headers = ['Name (Main)', 'Attendance Dates', 'Total Days'];
                const colWidths = [80, 140, 40];
                let xPosition = margin;

                // Draw header background
                doc.setFillColor(...this.colors.primary);
                doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 10, 'F');

                headers.forEach((header, index) => {
                    doc.text(header, xPosition + 2, yPosition);
                    xPosition += colWidths[index];
                });
                yPosition += 10;

                // Add data rows
                doc.setFont(this.fonts.body, 'normal');
                doc.setFontSize(9);
                
                Object.keys(peopleData).forEach((person, rowIndex) => {
                    const dates = peopleData[person].sort();
                    const dateText = dates.length > 10 
                        ? `${dates.slice(0, 10).join(', ')}... (+${dates.length - 10} more)`
                        : dates.join(', ');
                    
                    // Alternate row colors
                    if (rowIndex % 2 === 0) {
                        doc.setFillColor(...this.colors.light);
                        doc.rect(margin, yPosition - 3, pageWidth - (margin * 2), 8, 'F');
                    }
                    
                    xPosition = margin;
                    doc.text(person, xPosition + 2, yPosition);
                    xPosition += colWidths[0];
                    
                    // Wrap long date text
                    const wrappedText = doc.splitTextToSize(dateText, colWidths[1] - 4);
                    doc.text(wrappedText, xPosition + 2, yPosition);
                    xPosition += colWidths[1];
                    
                    doc.text(dates.length.toString(), xPosition + 2, yPosition);
                    
                    yPosition += Math.max(8, wrappedText.length * 4);
                    
                    // Check for page break
                    if (yPosition > pageHeight - 40) {
                        doc.addPage();
                        yPosition = margin;
                    }
                });
            } else {
                doc.setFont(this.fonts.body, 'italic');
                doc.setFontSize(12);
                doc.setTextColor(...this.colors.accent);
                doc.text('No Gantt chart data available for the selected criteria.', margin, yPosition);
            }

            // Add footer
            this.addFooter(doc, pageHeight);

            // Save the PDF
            const filename = `gantt-chart-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            return true;

        } catch (error) {
            console.error('Error exporting Gantt chart to PDF:', error);
            alert('Failed to export Gantt chart to PDF. Please try again.');
            return false;
        }
    }

    // Add header with academy branding
    addHeader(doc, yPosition, pageWidth) {
        // Academy title
        doc.setFont(this.fonts.heading, 'bold');
        doc.setFontSize(24);
        doc.setTextColor(...this.colors.primary);
        
        const title = 'GAZELVOUER ACADEMY';
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
        yPosition += 8;

        // Subtitle
        doc.setFont(this.fonts.heading, 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...this.colors.secondary);
        
        const subtitle = 'Attendance Management System';
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition);
        yPosition += 8;

        // Decorative line
        doc.setDrawColor(...this.colors.border);
        doc.setLineWidth(0.5);
        doc.line(20, yPosition, pageWidth - 20, yPosition);

        return yPosition + 5;
    }

    // Add footer with timestamp and page numbers
    addFooter(doc, pageHeight) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setFont(this.fonts.body, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...this.colors.accent);
            
            // Timestamp
            const timestamp = `Generated on ${new Date().toLocaleString()}`;
            doc.text(timestamp, 20, pageHeight - 10);
            
            // Page number
            const pageText = `Page ${i} of ${pageCount}`;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - 20 - pageTextWidth, pageHeight - 10);
            
            // Footer line
            doc.setDrawColor(...this.colors.border);
            doc.setLineWidth(0.2);
            doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
        }
    }

    // Add summary statistics
    addSummaryStats(doc, data, yPosition, margin, contentWidth) {
        if (!data || data.length === 0) return yPosition;

        // Calculate statistics
        const totalRecords = data.length;
        const uniqueNames = new Set(data.map(record => record.name)).size;
        const mainStats = {};
        
        data.forEach(record => {
            const main = record.main || 'Unknown';
            mainStats[main] = (mainStats[main] || 0) + 1;
        });

        // Draw summary box
        doc.setDrawColor(...this.colors.border);
        doc.setFillColor(...this.colors.light);
        doc.roundedRect(margin, yPosition, contentWidth, 25, 2, 2, 'FD');

        doc.setFont(this.fonts.body, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...this.colors.secondary);
        doc.text('Summary Statistics', margin + 5, yPosition + 8);

        doc.setFont(this.fonts.body, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...this.colors.text);
        
        doc.text(`Total Records: ${totalRecords}`, margin + 5, yPosition + 15);
        doc.text(`Unique Students: ${uniqueNames}`, margin + 60, yPosition + 15);
        
        // Main breakdown
        const mainBreakdown = Object.entries(mainStats)
            .map(([main, count]) => `${main}: ${count}`)
            .join(', ');
        doc.text(`By Main: ${mainBreakdown}`, margin + 5, yPosition + 22);

        return yPosition + 30;
    }

    // Add data table using autoTable plugin
    addDataTable(doc, data, yPosition, margin, contentWidth, pageHeight) {
        if (!doc.autoTable) {
            // Fallback if autoTable plugin is not available
            return this.addSimpleTable(doc, data, yPosition, margin, contentWidth);
        }

        const tableData = data.map(record => [
            record.name || '',
            record.main || '',
            this.formatDateTime(record.login_time),
            record.is_custom_time ? 'Custom' : 'System'
        ]);

        doc.autoTable({
            head: [['Name', 'Main', 'Login Time', 'Time Type']],
            body: tableData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
                font: this.fonts.body,
                fontSize: 9,
                textColor: this.colors.text
            },
            headStyles: {
                fillColor: this.colors.primary,
                textColor: this.colors.text,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [250, 248, 240]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 50 },
                3: { cellWidth: 25 }
            }
        });

        return doc.lastAutoTable.finalY + 10;
    }

    // Simple table fallback
    addSimpleTable(doc, data, yPosition, margin, contentWidth) {
        const headers = ['Name', 'Main', 'Login Time', 'Time Type'];
        const colWidths = [40, 25, 50, 25];
        
        // Draw headers
        doc.setFont(this.fonts.body, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...this.colors.text);
        doc.setFillColor(...this.colors.primary);
        doc.rect(margin, yPosition, contentWidth, 8, 'F');

        let xPosition = margin;
        headers.forEach((header, index) => {
            doc.text(header, xPosition + 2, yPosition + 6);
            xPosition += colWidths[index];
        });
        yPosition += 8;

        // Draw data rows
        doc.setFont(this.fonts.body, 'normal');
        doc.setFontSize(9);
        
        data.forEach((record, index) => {
            if (index % 2 === 0) {
                doc.setFillColor(250, 248, 240);
                doc.rect(margin, yPosition, contentWidth, 6, 'F');
            }
            
            xPosition = margin;
            const rowData = [
                record.name || '',
                record.main || '',
                this.formatDateTime(record.login_time),
                record.is_custom_time ? 'Custom' : 'System'
            ];
            
            rowData.forEach((cell, cellIndex) => {
                doc.text(String(cell), xPosition + 2, yPosition + 4);
                xPosition += colWidths[cellIndex];
            });
            
            yPosition += 6;
        });

        return yPosition + 5;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format datetime for display
    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

// Create global PDF exporter instance
window.PDFExporter = new PDFExporter();

// Export specific functions for use in other scripts
window.exportAttendanceToPDF = function(data, options) {
    return window.PDFExporter.exportAttendanceData(data, options);
};

window.exportChartToPDF = function(chartCanvas, title, filename) {
    return window.PDFExporter.exportChartAsPDF(chartCanvas, title, filename);
};

window.exportGanttToPDF = function(ganttData, options) {
    return window.PDFExporter.exportGanttData(ganttData, options);
};

// Utility function to export chart from Chart.js instance
window.exportChartInstanceToPDF = function(chartId, title, filename) {
    const chart = Chart.getChart(chartId);
    if (!chart) {
        alert('Chart not found');
        return false;
    }
    
    return window.PDFExporter.exportChartAsPDF(chart.canvas, title, filename);
};
