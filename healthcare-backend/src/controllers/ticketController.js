import Ticket from '../models/Ticket.js';

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Patient/Hospital)
export const createTicket = async (req, res) => {
    try {
        const { subject, message, raisedByRole } = req.body;
        
        if (!['HOSPITAL', 'PATIENT'].includes(raisedByRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role for raising a ticket.' });
        }

        const ticket = await Ticket.create({
            subject,
            message,
            raisedByRole,
            userId: req.user._id,
            status: 'Open'
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's own tickets
// @route   GET /api/tickets/my
// @access  Private (Patient/Hospital)
export const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active network tickets
// @route   GET /api/tickets
// @access  Private (Insurance/Admin)
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({}).populate('userId', 'name email role').sort({ createdAt: -1 });
        res.json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resolve a ticket
// @route   PUT /api/tickets/:id/resolve
// @access  Private (Insurance/Admin)
export const resolveTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.status = 'Resolved';
        ticket.resolvedBy = req.user._id;
        ticket.resolvedAt = Date.now();

        await ticket.save();

        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
