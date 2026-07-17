import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { Clock, Monitor, LogOut, CheckCircle, AlertTriangle, AlertCircle, MessageSquareWarning } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuthStore();
    const [pcs, setPcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPc, setSelectedPc] = useState(null);
    const [duration, setDuration] = useState(60); // Default 1 hour
    const [activeBooking, setActiveBooking] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueText, setIssueText] = useState('');

    // Fetch PCs and Active Booking
    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [pcsRes, bookingRes] = await Promise.all([
                axios.get('http://localhost:5000/api/pcs', config),
                axios.get('http://localhost:5000/api/bookings/my-active', config)
            ]);
            setPcs(pcsRes.data);
            setActiveBooking(bookingRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user.token]);

    const handleBook = async () => {
        if (activeBooking) {
            return toast.error('You already have an active or pending booking.');
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/bookings', {
                pcId: selectedPc._id,
                durationMinutes: Number(duration)
            }, config);
            toast.success('PC Booked Successfully! Please check in within 15 minutes.');
            setSelectedPc(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        }
    };

    const handleCheckIn = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${activeBooking._id}/checkin`, {}, config);
            toast.success('Successfully checked in!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`http://localhost:5000/api/bookings/${activeBooking._id}/checkout`, {}, config);
            toast.success(`Checked out! Time used: ${res.data.minutesUsed} mins`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        }
    };

    const handleReportIssue = async () => {
        if (!issueText.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Simulate reporting issue by updating PC status (in real app, use a dedicated endpoint)
            await axios.put(`http://localhost:5000/api/pcs/${activeBooking.pcId._id}/status`, {
                status: 'out-of-order',
                issueReported: issueText
            }, config);
            toast.success('Issue reported successfully. The PC is now marked out-of-order.');
            setShowIssueModal(false);
            handleCheckOut(); // Force checkout if PC is broken
        } catch (error) {
            toast.error('Failed to report issue');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200 cursor-pointer';
            case 'occupied': return 'bg-red-100 border-red-500 text-red-700 cursor-not-allowed opacity-75';
            case 'booked': return 'bg-yellow-100 border-yellow-500 text-yellow-700 cursor-not-allowed opacity-75';
            case 'out-of-order': return 'bg-gray-100 border-gray-500 text-gray-700 cursor-not-allowed opacity-75';
            default: return 'bg-gray-100 border-gray-300 text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return <CheckCircle className="w-5 h-5 mb-1" />;
            case 'occupied': return <Monitor className="w-5 h-5 mb-1" />;
            case 'booked': return <Clock className="w-5 h-5 mb-1" />;
            case 'out-of-order': return <AlertTriangle className="w-5 h-5 mb-1" />;
            default: return <Monitor className="w-5 h-5 mb-1" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-300">
            {/* Top Stats & Greeting */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm py-8 px-4 sm:px-6 lg:px-8 z-10">
                
                {/* Active Session Banner */}
                {activeBooking && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-8 rounded-r-xl shadow-sm flex justify-between items-center flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-blue-900">
                                {activeBooking.status === 'booked' ? 'Pending Check-In' : 'Active Session'}
                            </h3>
                            <p className="text-blue-700 mt-1 font-medium">
                                PC: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-800">{activeBooking.pcId?.pcId}</span> 
                                <span className="mx-2">•</span>
                                Booked Until: {new Date(activeBooking.endTime).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {activeBooking.status === 'active' && (
                                <button 
                                    onClick={() => setShowIssueModal(true)}
                                    className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors"
                                >
                                    <MessageSquareWarning className="w-4 h-4" /> Report Issue
                                </button>
                            )}
                            {activeBooking.status === 'booked' ? (
                                <button onClick={handleCheckIn} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors">
                                    Check In Now
                                </button>
                            ) : (
                                <button onClick={handleCheckOut} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors">
                                    Check Out
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats / Warning Card */}
                {user?.role === 'student' ? (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 mb-8 max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Book your daily PC session.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-blue-600">{user?.dailyUsageMinutes || 0}</span>
                            <span className="text-gray-500 ml-2">/ 180 mins</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 mb-8 flex items-center justify-between border-l-4 border-l-purple-500">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Lecturer Account</h3>
                            <p className="text-gray-500 mt-1">You have unlimited daily usage quota for academic purposes.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">Unlimited Quota</span>
                        </div>
                    </div>
                )}

                {/* PC Map Layout */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm relative z-10">
                    <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Live Lab Layout</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-6">Green PCs are available for booking. Click to select.</p>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-4 text-sm font-medium flex-wrap">
                            <div className="flex items-center gap-1.5 text-green-700"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
                            <div className="flex items-center gap-1.5 text-red-700"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied</div>
                            <div className="flex items-center gap-1.5 text-yellow-700"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Booked</div>
                            <div className="flex items-center gap-1.5 text-gray-600"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Out of Order</div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : pcs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
                            <p>No PCs have been added by the Admin yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                            {pcs.map((pc) => (
                                <div 
                                    key={pc._id}
                                    onClick={() => pc.status === 'available' && setSelectedPc(pc)}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${getStatusColor(pc.status)} ${pc.status === 'available' ? 'hover:-translate-y-1 hover:shadow-md' : ''}`}
                                >
                                    {getStatusIcon(pc.status)}
                                    <span className="font-bold text-sm">{pc.pcId}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {selectedPc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Book {selectedPc.pcId}</h3>
                            <button onClick={() => setSelectedPc(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col shadow-sm">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p>You must check-in within 15 minutes of booking, otherwise it will be automatically cancelled.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                >
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="120">2 Hours</option>
                                    <option value="180">3 Hours</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setSelectedPc(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleBook}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Issue Report Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-500" /> Report Issue
                            </h3>
                            <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Describe the problem with {activeBooking?.pcId?.pcId} (e.g. Broken Mouse, No Internet). Submitting this will check you out and mark the PC as Out-of-Order.
                            </p>
                            <textarea 
                                className="w-full p-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg mb-4 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Describe the issue..."
                                value={issueText}
                                onChange={(e) => setIssueText(e.target.value)}
                            ></textarea>
                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => setShowIssueModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleReportIssue}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
