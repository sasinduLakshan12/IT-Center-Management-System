import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { 
    Monitor, ShieldCheck, Clock, AlertTriangle, Users, 
    Check, X, Trash2, Plus, Ban, CheckCircle2, MessageSquare, Search
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pcs, setPcs] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    
    // Search states
    const [userSearch, setUserSearch] = useState('');
    
    // Add PC form state
    const [newPc, setNewPc] = useState({ pcId: '', location: 'Row A' });

    // Loading states
    const [loadingStats, setLoadingStats] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    // Fetch stats, pcs, pending approvals, sessions, users, issues
    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', config);
            setStats(res.data);
            setLoadingStats(false);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchPCs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/pcs', config);
            setPcs(res.data);
        } catch (error) {
            console.error('Failed to fetch PCs');
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/pending-approvals', config);
            setPendingUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch pending approvals');
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/sessions', config);
            setSessions(res.data);
        } catch (error) {
            console.error('Failed to fetch active sessions');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const fetchIssues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/issues', config);
            setIssues(res.data);
        } catch (error) {
            console.error('Failed to fetch issues');
        }
    };

    const loadTabData = () => {
        fetchStats();
        switch (activeTab) {
            case 'overview':
                fetchPCs();
                break;
            case 'approvals':
                fetchPendingUsers();
                break;
            case 'pcs':
                fetchPCs();
                break;
            case 'sessions':
                fetchSessions();
                break;
            case 'users':
                fetchUsers();
                break;
            case 'issues':
                fetchIssues();
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        loadTabData();
        const interval = setInterval(loadTabData, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // Handlers for User Approvals
    const handleApproveUser = async (userId) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve-user/${userId}`, {}, config);
            toast.success('User approved successfully!');
            fetchPendingUsers();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/reject-user/${userId}`, config);
            toast.info('Registration rejected and deleted.');
            fetchPendingUsers();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Rejection failed');
        }
    };

    // Handlers for PC Management
    const handleAddPC = async (e) => {
        e.preventDefault();
        if (!newPc.pcId.trim()) return toast.error('PC ID is required');
        try {
            await axios.post('http://localhost:5000/api/pcs', newPc, config);
            toast.success('PC added successfully!');
            setNewPc({ pcId: '', location: 'Row A' });
            fetchPCs();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add PC');
        }
    };

    const handleDeletePC = async (id) => {
        if (!window.confirm('Are you sure you want to delete this PC? This will delete all active sessions linked to this PC.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/pcs/${id}`, config);
            toast.success('PC deleted successfully.');
            fetchPCs();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete PC');
        }
    };

    const handleManualStatusChange = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/pcs/${id}/status`, { status }, config);
            toast.success('PC status updated.');
            fetchPCs();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update PC');
        }
    };

    // Handlers for Sessions
    const handleForceCancelSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to force check-out/terminate this session?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/sessions/${sessionId}`, config);
            toast.success('Session terminated successfully.');
            fetchSessions();
            fetchStats();
        } catch (error) {
            toast.error('Failed to terminate session');
        }
    };

    // Handlers for User Blocking
    const handleToggleBlock = async (userId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/block`, {}, config);
            toast.success(res.data.message);
            fetchUsers();
        } catch (error) {
            toast.error('Block toggle failed');
        }
    };

    // Handlers for Issues
    const handleResolveIssue = async (pcId) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/issues/${pcId}/resolve`, {}, config);
            toast.success('Issue resolved. PC is now available!');
            fetchIssues();
            fetchStats();
        } catch (error) {
            toast.error('Failed to resolve issue');
        }
    };

    const getStatusTextBadge = (status) => {
        switch (status) {
            case 'available': return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">Available</span>;
            case 'occupied': return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">Occupied</span>;
            case 'booked': return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">Booked</span>;
            case 'out-of-order': return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full">Out of Order</span>;
            default: return null;
        }
    };

    // Filtered lists
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.studentId.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                
                {/* Dashboard Header Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 shadow-xl text-white mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-4.5 h-4.5 stroke-[2.5]" /> Admin Command Center
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">IT Center Administrator</h1>
                        <p className="text-blue-100 mt-1 font-medium">Manage PCs, review pending registrations, and monitor real-time user bookings.</p>
                    </div>
                </div>

                {/* Dashboard Stats Overview cards */}
                {loadingStats ? (
                    <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-blue-100 transition-all duration-250">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Monitor className="w-6 h-6" /></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total PCs</div>
                                <div className="text-2xl font-bold text-gray-800">{stats?.pcs?.total}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-emerald-100 transition-all duration-250">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Available</div>
                                <div className="text-2xl font-bold text-gray-800">{stats?.pcs?.available}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-250">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-6 h-6" /></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Sessions</div>
                                <div className="text-2xl font-bold text-gray-800">{stats?.sessions?.active}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-amber-100 transition-all duration-250">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users className="w-6 h-6" /></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pending Signups</div>
                                <div className={`text-2xl font-bold ${stats?.users?.pendingApprovals > 0 ? 'text-amber-600 animate-pulse' : 'text-gray-800'}`}>
                                    {stats?.users?.pendingApprovals}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 col-span-2 md:col-span-1 hover:-translate-y-1 hover:shadow-md hover:border-rose-100 transition-all duration-250">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Issues / Broken</div>
                                <div className={`text-2xl font-bold ${stats?.pcs?.outOfOrder > 0 ? 'text-rose-600' : 'text-gray-800'}`}>
                                    {stats?.pcs?.outOfOrder}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8 flex gap-2 overflow-x-auto pb-1">
                    {[
                        { id: 'overview', label: 'Overview & Map', icon: <Monitor className="w-4 h-4" /> },
                        { id: 'approvals', label: `Pending Approvals (${pendingUsers.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
                        { id: 'pcs', label: 'PC Manager', icon: <Monitor className="w-4 h-4" /> },
                        { id: 'sessions', label: 'Active Sessions', icon: <Clock className="w-4 h-4" /> },
                        { id: 'users', label: 'Registered Users', icon: <Users className="w-4 h-4" /> },
                        { id: 'issues', label: `Issue Tickets (${issues.length})`, icon: <MessageSquare className="w-4 h-4" /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition duration-150 cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-850 hover:bg-gray-100/50'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Panels */}
                <div className="bg-white rounded-3xl border shadow-sm p-6 min-h-[400px]">

                    {/* OVERVIEW PANEL */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">IT Center Live Seating View</h2>
                                <p className="text-gray-500 text-sm mt-1">Live PC booking states. Click on a PC block to execute manual status overrides.</p>
                            </div>
                            
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {pcs.map((pc) => (
                                    <div 
                                        key={pc._id}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center font-bold text-sm relative group cursor-pointer ${
                                            pc.status === 'available' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' :
                                            pc.status === 'occupied' ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100' :
                                            pc.status === 'booked' ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' :
                                            'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="text-xs mb-1 uppercase tracking-wide opacity-75">{pc.location.split(' ')[1]}</span>
                                        <span className="text-base">{pc.pcId}</span>
                                        
                                        {/* Status Context Hover Menu */}
                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white p-2 rounded-xl text-xs space-y-1.5 shadow-xl w-36 z-30">
                                            <div className="font-bold border-b border-white/10 pb-1 text-center">{pc.pcId} Menu</div>
                                            <button 
                                                onClick={() => handleManualStatusChange(pc._id, 'available')}
                                                className="w-full text-left px-1.5 py-0.5 hover:bg-white/10 rounded font-semibold text-emerald-400"
                                            >
                                                Make Available
                                            </button>
                                            <button 
                                                onClick={() => handleManualStatusChange(pc._id, 'out-of-order')}
                                                className="w-full text-left px-1.5 py-0.5 hover:bg-white/10 rounded font-semibold text-rose-400"
                                            >
                                                Mark Out of Order
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePC(pc._id)}
                                                className="w-full text-left px-1.5 py-0.5 hover:bg-rose-600 rounded font-semibold text-red-200"
                                            >
                                                Delete PC
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PENDING APPROVALS PANEL */}
                    {activeTab === 'approvals' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Pending User Approvals</h2>
                                <p className="text-gray-500 text-sm mt-1">Review registrations for new students and staff before activating their logins.</p>
                            </div>
                            
                            {pendingUsers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed">
                                    No pending user registrations found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Role</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pendingUsers.map((pUser) => (
                                                <tr key={pUser._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-800">{pUser.studentId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{pUser.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pUser.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${pUser.role === 'lecturer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {pUser.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold flex gap-2.5 justify-end">
                                                        <button 
                                                            onClick={() => handleApproveUser(pUser._id)}
                                                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-emerald-500/10 text-xs transition duration-200 cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectUser(pUser._id)}
                                                            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-rose-500/10 text-xs transition duration-200 cursor-pointer"
                                                        >
                                                            <X className="w-3.5 h-3.5 stroke-[3]" /> Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PC MANAGER PANEL */}
                    {activeTab === 'pcs' && (
                        <div className="space-y-8">
                            {/* Add PC Form */}
                            <div className="bg-slate-50 border rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-600" /> Add New Workstation
                                </h3>
                                <form onSubmit={handleAddPC} className="flex flex-wrap gap-4 items-end">
                                    <div className="flex-grow min-w-[200px]">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">PC Identifier</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., PC-41"
                                            value={newPc.pcId}
                                            onChange={(e) => setNewPc({ ...newPc, pcId: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                        />
                                    </div>
                                    <div className="w-48">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Row Allocation</label>
                                        <select 
                                            value={newPc.location}
                                            onChange={(e) => setNewPc({ ...newPc, location: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                        >
                                            <option value="Row A">Row A</option>
                                            <option value="Row B">Row B</option>
                                            <option value="Row C">Row C</option>
                                            <option value="Row D">Row D</option>
                                            <option value="Row E">Row E</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm transition duration-150 cursor-pointer"
                                    >
                                        Register Workstation
                                    </button>
                                </form>
                            </div>

                            {/* PC List Table */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800">All Registered PCs</h3>
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PC ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Row Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reported Issue</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pcs.map((pc) => (
                                                <tr key={pc._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-800">{pc.pcId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{pc.location}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {getStatusTextBadge(pc.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-550 max-w-xs truncate">
                                                        {pc.issueReported || <span className="text-gray-400 italic">None</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                                                        {pc.status === 'out-of-order' && (
                                                            <button 
                                                                onClick={() => handleResolveIssue(pc._id)}
                                                                className="text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200 cursor-pointer"
                                                            >
                                                                Mark Fixed
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDeletePC(pc._id)}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-100 transition-colors cursor-pointer"
                                                            title="Delete PC"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIVE SESSIONS PANEL */}
                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Active Lab Sessions</h2>
                                <p className="text-gray-500 text-sm mt-1">View active or booked seat reservations. You can force check-out or cancel a session if needed.</p>
                            </div>
                            
                            {sessions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed">
                                    No active computer sessions in the lab.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PC ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User details</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reservation Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Time</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sessions.map((session) => (
                                                <tr key={session._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-800">{session.pcId?.pcId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-800">{session.studentId?.name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{session.studentId?.studentId} • {session.studentId?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold capitalize text-gray-655">
                                                        {session.studentId?.role}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {session.status === 'active' ? (
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">Checked In</span>
                                                        ) : (
                                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">Booked (Pending Checkin)</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                                                        {new Date(session.endTime).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleForceCancelSession(session._id)}
                                                            className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Force Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* REGISTERED USERS PANEL */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 font-sans">Registered Users & Logs</h2>
                                    <p className="text-gray-500 text-sm mt-1">Review student and lecturer profiles, view their last login times, and apply blocks.</p>
                                </div>
                                {/* Search input */}
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by ID, Name, Email..." 
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    />
                                </div>
                            </div>
                            
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed">
                                    No users found matching your search.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login Log</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((userObj) => (
                                                <tr key={userObj._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-800">{userObj.studentId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{userObj.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userObj.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold capitalize text-gray-650">{userObj.role}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 font-mono">
                                                        {userObj.lastLogin ? new Date(userObj.lastLogin).toLocaleString() : <span className="text-gray-405 italic font-sans font-normal">Never logged in</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {userObj.isBlocked ? (
                                                            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Blocked</span>
                                                        ) : !userObj.isApproved ? (
                                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Pending Approval</span>
                                                        ) : (
                                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Approved</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold flex gap-2 justify-end items-center">
                                                        {!userObj.isApproved && (
                                                            <button 
                                                                onClick={() => handleApproveUser(userObj._id)}
                                                                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs transition duration-200 cursor-pointer shadow-sm hover:shadow-emerald-500/10"
                                                            >
                                                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleToggleBlock(userObj._id)}
                                                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 border rounded-lg transition-colors cursor-pointer ${
                                                                userObj.isBlocked 
                                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200' 
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                                                            }`}
                                                        >
                                                            {userObj.isBlocked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                                            {userObj.isBlocked ? 'Unblock User' : 'Block User'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ISSUE TICKETS PANEL */}
                    {activeTab === 'issues' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Hardware & Connection Issues</h2>
                                <p className="text-gray-500 text-sm mt-1">Review broken PC reports submitted by students. Workstations remain Out-of-Order until marked fixed.</p>
                            </div>
                            
                            {issues.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed">
                                    No reported PC issues found. Excellent!
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PC ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reported Issue Description</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {issues.map((pcIssue) => (
                                                <tr key={pcIssue._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-800">{pcIssue.pcId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{pcIssue.location}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-rose-700 bg-rose-50/30">
                                                        <div className="flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-500 flex-shrink-0" />
                                                            <span>{pcIssue.issueReported}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleResolveIssue(pcIssue._id)}
                                                            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                                                        >
                                                            Mark Issue Fixed
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
