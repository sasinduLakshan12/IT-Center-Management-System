const Department = require('../models/Department');
const { logAction } = require('../utils/auditLogger');

// Get all departments
const getDepartments = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const departments = await Department.find(query).sort({ name: 1 });
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a department
const createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: 'Name and Code are required.' });
        }

        const exists = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
        if (exists) {
            return res.status(400).json({ message: 'Department with this name or code already exists.' });
        }

        const dept = await Department.create({
            name,
            code: code.toUpperCase(),
            description
        });

        // Audit Log
        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Create Department',
            module: 'Academic',
            recordId: dept._id.toString(),
            description: `Admin created department ${name} (${code.toUpperCase()}).`
        });

        res.status(201).json({ success: true, message: 'Department created successfully', data: dept });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update department
const updateDepartment = async (req, res) => {
    try {
        const { name, code, description, status } = req.body;
        const dept = await Department.findById(req.params.id);

        if (!dept) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        const oldValues = dept.toObject();

        dept.name = name || dept.name;
        dept.code = code ? code.toUpperCase() : dept.code;
        dept.description = description !== undefined ? description : dept.description;
        dept.status = status || dept.status;

        const updated = await dept.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Update Department',
            module: 'Academic',
            recordId: dept._id.toString(),
            description: `Admin updated department ${dept.name}.`,
            previousValues: oldValues,
            newValues: updated.toObject()
        });

        res.json({ success: true, message: 'Department updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        await Department.findByIdAndDelete(req.params.id);

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Delete Department',
            module: 'Academic',
            recordId: req.params.id,
            description: `Admin deleted department ${dept.name} (${dept.code}).`
        });

        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
