const PC = require('../models/PC');

// @desc    Get all PCs
// @route   GET /api/pcs
// @access  Private
const getPCs = async (req, res) => {
    try {
        const pcs = await PC.find({});
        res.json(pcs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new PC
// @route   POST /api/pcs
// @access  Private/Admin
const addPC = async (req, res) => {
    try {
        const { pcId, location } = req.body;
        
        const pcExists = await PC.findOne({ pcId });
        if (pcExists) {
            return res.status(400).json({ message: 'PC already exists' });
        }

        const pc = await PC.create({ pcId, location });
        res.status(201).json(pc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update PC status (e.g. out-of-order)
// @route   PUT /api/pcs/:id/status
// @access  Private/Admin
const updatePCStatus = async (req, res) => {
    try {
        const { status, issueReported } = req.body;
        const pc = await PC.findById(req.params.id);

        if (pc) {
            pc.status = status || pc.status;
            pc.issueReported = issueReported || pc.issueReported;
            if (status !== 'out-of-order') {
                pc.issueReported = null; // Clear issue if fixed
            }
            const updatedPC = await pc.save();
            res.json(updatedPC);
        } else {
            res.status(404).json({ message: 'PC not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPCs, addPC, updatePCStatus };
