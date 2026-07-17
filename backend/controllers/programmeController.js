const DegreeProgramme = require('../models/DegreeProgramme');
const { logAction } = require('../utils/auditLogger');

// Get all degree programmes
const getProgrammes = async (req, res) => {
    try {
        const { search, department, status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }
        if (department) {
            query.department = department;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const programmes = await DegreeProgramme.find(query)
            .populate('department')
            .sort({ name: 1 });

        res.json({ success: true, data: programmes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a programme
const createProgramme = async (req, res) => {
    try {
        const { name, code, department, duration } = req.body;

        if (!name || !code || !department || !duration) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const exists = await DegreeProgramme.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
        if (exists) {
            return res.status(400).json({ message: 'Programme with this name or code already exists.' });
        }

        const prog = await DegreeProgramme.create({
            name,
            code: code.toUpperCase(),
            department,
            duration
        });

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Create Programme',
            module: 'Academic',
            recordId: prog._id.toString(),
            description: `Admin created degree programme ${name} (${code.toUpperCase()}).`
        });

        res.status(201).json({ success: true, message: 'Programme created successfully', data: prog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update programme
const updateProgramme = async (req, res) => {
    try {
        const { name, code, department, duration, status } = req.body;
        const prog = await DegreeProgramme.findById(req.params.id);

        if (!prog) {
            return res.status(404).json({ message: 'Programme not found.' });
        }

        const oldValues = prog.toObject();

        prog.name = name || prog.name;
        prog.code = code ? code.toUpperCase() : prog.code;
        prog.department = department || prog.department;
        prog.duration = duration || prog.duration;
        prog.status = status || prog.status;

        const updated = await prog.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Update Programme',
            module: 'Academic',
            recordId: prog._id.toString(),
            description: `Admin updated degree programme ${prog.name}.`,
            previousValues: oldValues,
            newValues: updated.toObject()
        });

        res.json({ success: true, message: 'Programme updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete programme
const deleteProgramme = async (req, res) => {
    try {
        const prog = await DegreeProgramme.findById(req.params.id);
        if (!prog) {
            return res.status(404).json({ message: 'Programme not found.' });
        }

        await DegreeProgramme.findByIdAndDelete(req.params.id);

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Delete Programme',
            module: 'Academic',
            recordId: req.params.id,
            description: `Admin deleted degree programme ${prog.name} (${prog.code}).`
        });

        res.json({ success: true, message: 'Programme deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProgrammes,
    createProgramme,
    updateProgramme,
    deleteProgramme
};
