const AuditLog = require('../models/AuditLog');

const logAction = async ({
    userId,
    userModel = 'Admin',
    operatorName = 'System',
    role = 'System',
    action,
    module,
    recordId = '',
    description,
    previousValues = null,
    newValues = null,
    ipAddress = '',
    deviceInfo = ''
}) => {
    try {
        await AuditLog.create({
            userId,
            userModel,
            operatorName,
            role,
            action,
            module,
            recordId,
            description,
            previousValues,
            newValues,
            ipAddress,
            deviceInfo
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

module.exports = { logAction };
