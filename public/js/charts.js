// Charts utility functions for Admin Panel
class ChartsManager {
    constructor() {
        this.chartInstances = {};
        this.defaultColors = [
            'rgba(212, 175, 55, 0.8)',    // Primary gold
            'rgba(139, 69, 19, 0.8)',     // Vintage brown
            'rgba(205, 127, 50, 0.8)',    // Ornate bronze
            'rgba(160, 82, 45, 0.8)',     // Saddle brown
            'rgba(139, 0, 0, 0.8)',       // Vintage red
            'rgba(184, 134, 11, 0.8)',    // Dark golden rod
            'rgba(218, 165, 32, 0.8)',    // Golden rod
            'rgba(245, 222, 179, 0.8)'    // Wheat
        ];
    }

    // Create or update bar chart
    createBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: options.showLegend !== false,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Crimson Text',
                            size: 14
                        },
                        color: '#2d1810'
                    }
                },
                title: {
                    display: !!options.title,
                    text: options.title,
                    font: {
                        family: 'Cinzel',
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#8b4513'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.2)'
                    },
                    ticks: {
                        font: {
                            family: 'Crimson Text'
                        },
                        color: '#2d1810'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(212, 175, 55, 0.2)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Crimson Text'
                        },
                        color: '#2d1810'
                    }
                }
            }
        };

        const chartConfig = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.label || 'Attendance Count',
                    data: data.values,
                    backgroundColor: options.backgroundColor || this.defaultColors[0],
                    borderColor: options.borderColor || '#8b4513',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: this.mergeOptions(defaultOptions, options.chartOptions || {})
        };

        this.chartInstances[canvasId] = new Chart(ctx, chartConfig);
        return this.chartInstances[canvasId];
    }

    // Create or update pie chart
    createPieChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Crimson Text',
                            size: 12
                        },
                        color: '#2d1810',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                title: {
                    display: !!options.title,
                    text: options.title,
                    font: {
                        family: 'Cinzel',
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#8b4513'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        const chartConfig = {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: this.defaultColors.slice(0, data.labels.length),
                    borderColor: '#8b4513',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: this.mergeOptions(defaultOptions, options.chartOptions || {})
        };

        this.chartInstances[canvasId] = new Chart(ctx, chartConfig);
        return this.chartInstances[canvasId];
    }

    // Create or update line chart
    createLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: options.showLegend !== false,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Crimson Text',
                            size: 14
                        },
                        color: '#2d1810'
                    }
                },
                title: {
                    display: !!options.title,
                    text: options.title,
                    font: {
                        family: 'Cinzel',
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#8b4513'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.2)'
                    },
                    ticks: {
                        font: {
                            family: 'Crimson Text'
                        },
                        color: '#2d1810'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(212, 175, 55, 0.2)'
                    },
                    ticks: {
                        font: {
                            family: 'Crimson Text'
                        },
                        color: '#2d1810'
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 3,
                    tension: 0.1
                },
                point: {
                    radius: 5,
                    hoverRadius: 8
                }
            }
        };

        const chartConfig = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.values,
                    borderColor: dataset.borderColor || this.defaultColors[index],
                    backgroundColor: dataset.backgroundColor || this.defaultColors[index].replace('0.8', '0.3'),
                    fill: dataset.fill || false
                }))
            },
            options: this.mergeOptions(defaultOptions, options.chartOptions || {})
        };

        this.chartInstances[canvasId] = new Chart(ctx, chartConfig);
        return this.chartInstances[canvasId];
    }

    // Create or update doughnut chart
    createDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Crimson Text',
                            size: 12
                        },
                        color: '#2d1810',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                title: {
                    display: !!options.title,
                    text: options.title,
                    font: {
                        family: 'Cinzel',
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#8b4513'
                }
            },
            cutout: '50%'
        };

        const chartConfig = {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: this.defaultColors.slice(0, data.labels.length),
                    borderColor: '#8b4513',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: this.mergeOptions(defaultOptions, options.chartOptions || {})
        };

        this.chartInstances[canvasId] = new Chart(ctx, chartConfig);
        return this.chartInstances[canvasId];
    }

    // Export chart as image
    exportChartAsImage(canvasId, filename) {
        const chart = this.chartInstances[canvasId];
        if (!chart) {
            console.error(`Chart with id ${canvasId} not found`);
            return false;
        }

        try {
            const url = chart.toBase64Image('image/png', 1.0);
            const link = document.createElement('a');
            link.download = filename || `chart-${canvasId}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return true;
        } catch (error) {
            console.error('Error exporting chart:', error);
            return false;
        }
    }

    // Get chart instance
    getChart(canvasId) {
        return this.chartInstances[canvasId];
    }

    // Destroy chart
    destroyChart(canvasId) {
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.keys(this.chartInstances).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }

    // Update chart data
    updateChartData(canvasId, newData) {
        const chart = this.chartInstances[canvasId];
        if (!chart) {
            console.error(`Chart with id ${canvasId} not found`);
            return false;
        }

        if (newData.labels) {
            chart.data.labels = newData.labels;
        }

        if (newData.datasets) {
            chart.data.datasets = newData.datasets;
        } else if (newData.values) {
            chart.data.datasets[0].data = newData.values;
        }

        chart.update();
        return true;
    }

    // Utility function to merge options
    mergeOptions(defaultOptions, customOptions) {
        return this.deepMerge(defaultOptions, customOptions);
    }

    // Deep merge utility function
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    // Check if value is object
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Format data for charts
    formatDataForChart(rawData, labelField, valueField) {
        return {
            labels: rawData.map(item => item[labelField]),
            values: rawData.map(item => parseInt(item[valueField]) || 0)
        };
    }

    // Generate date range for charts
    generateDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        return dates;
    }

    // Format date for display
    formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

// Create global instance
window.ChartsManager = new ChartsManager();

// Chart.js global configuration
Chart.defaults.font.family = 'Crimson Text';
Chart.defaults.color = '#2d1810';
Chart.defaults.backgroundColor = 'rgba(212, 175, 55, 0.8)';
Chart.defaults.borderColor = '#8b4513';

// Custom chart plugin for vintage styling
const vintagePlugin = {
    id: 'vintagePlugin',
    beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'rgba(245, 245, 220, 0.1)';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

Chart.register(vintagePlugin);
