const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { sendToCelery } = require('../services/queueService');


// Helper to create PDF Stream
const createPDF = (res, title, generateContent) => {
    const doc = new PDFDocument({ margin: 50 });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('MediConnect', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(title, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    doc.moveDown();

    // Content
    generateContent(doc);

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text('Confidential - MediConnect Internal Report', 50, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const orders = await Order.find({ createdAt: { $gte: startOfMonth } })
            .populate('patient', 'name email');

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        createPDF(res, 'Monthly Report', (doc) => {
            doc.fontSize(12).text(`Total Orders: ${orders.length}`);
            doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`);
            doc.moveDown();

            doc.text('Recent Orders:', { underline: true });
            doc.moveDown();

            orders.slice(0, 10).forEach((order, index) => {
                doc.text(`${index + 1}. ${order.orderId || order._id} - Rs. ${order.totalAmount} - ${new Date(order.createdAt).toLocaleDateString()}`);
            });
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

exports.triggerMonthlyReport = async (req, res) => {
    try {
        // Send task to Celery (Python worker)
        await sendToCelery('tasks.generate_monthly_report', ['monthly']);
        res.json({ message: 'Monthly report generation started in background' });
    } catch (error) {
        console.error('Error triggering report:', error);
        res.status(500).json({ message: 'Failed to trigger background task' });
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        // Aggregate revenue by status
        const revenueStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        createPDF(res, 'Revenue Report', (doc) => {
            doc.fontSize(12).text('Revenue Breakdown by Status:', { underline: true });
            doc.moveDown();

            let totalRev = 0;
            revenueStats.forEach(stat => {
                doc.text(`${stat._id}: Rs. ${stat.total.toFixed(2)} (${stat.count} orders)`);
                totalRev += stat.total;
            });

            doc.moveDown();
            doc.fontSize(14).text(`Total Revenue: Rs. ${totalRev.toFixed(2)}`, { bold: true });
        });
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

exports.getUserGrowthReport = async (req, res) => {
    try {
        const doctors = await Doctor.countDocuments();
        const patients = await User.countDocuments({ role: 'patient' });
        const pharmacists = await User.countDocuments({ role: 'pharmacist' }); // Assuming role based lookup

        createPDF(res, 'User Growth Report', (doc) => {
            doc.fontSize(12).text('Current User Statistics:', { underline: true });
            doc.moveDown();

            doc.text(`Patients: ${patients}`);
            doc.text(`Doctors: ${doctors}`);
            doc.text(`Pharmacists: ${pharmacists}`); // Placeholder
            doc.moveDown();
            doc.text(`Total Users: ${doctors + patients + pharmacists}`, { bold: true });
        });
    } catch (error) {
        console.error('Error generating user growth report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

exports.getPerformanceReport = async (req, res) => {
    try {
        // Mock performance data or fetch real if available
        const metrics = {
            uptime: '99.9%',
            averageResponseTime: '120ms',
            activeSessions: 'Mock Data',
            serverLoad: 'Low'
        };

        createPDF(res, 'Performance Report', (doc) => {
            doc.fontSize(12).text('System Performance Metrics:', { underline: true });
            doc.moveDown();

            Object.entries(metrics).forEach(([key, value]) => {
                doc.text(`${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}`);
            });
        });
    } catch (error) {
        console.error('Error generating performance report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};
