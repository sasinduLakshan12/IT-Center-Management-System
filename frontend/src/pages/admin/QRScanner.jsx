import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText) => {
      if (isProcessing) return; // Prevent multiple rapid scans
      
      try {
        setIsProcessing(true);
        // We expect decodedText to be a JSON string: { "referenceNumber": "...", "studentId": "..." }
        const data = JSON.parse(decodedText);
        
        if (!data.referenceNumber) {
          throw new Error("Invalid QR Code format.");
        }

        scanner.pause(); // Pause scanning while we process

        // Call the backend to check-in
        const res = await API.put('/bookings/check-in', { referenceNumber: data.referenceNumber });
        
        setScanResult({
          success: true,
          message: res.data.message,
          data: res.data.data
        });
        toast.success("Check-in successful!");

      } catch (err) {
        let msg = "Invalid QR code.";
        if (err.response?.data?.message) {
            msg = err.response.data.message;
        } else if (err.message) {
            msg = err.message;
        }
        
        setScanResult({
          success: false,
          message: msg
        });
        toast.error("Check-in failed.");
      } finally {
        setIsProcessing(false);
        // Resume scanning after 3 seconds automatically
        setTimeout(() => {
            setScanResult(null);
            if (scannerRef.current) scannerRef.current.resume();
        }, 3000);
      }
    };

    const onScanFailure = (error) => {
      // Ignore routine scan failures (when no code is in frame)
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, [isProcessing]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>QR Check-In Scanner</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Scan a student's booking QR code to grant them access to the lab.
        </p>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Scanner Container */}
          <div id="reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}></div>
          
          {/* Result Display */}
          {scanResult && (
            <div style={{
              marginTop: '2rem',
              width: '100%',
              padding: '1.5rem',
              borderRadius: '12px',
              background: scanResult.success ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 75, 75, 0.1)',
              border: `1px solid ${scanResult.success ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 75, 75, 0.3)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              {scanResult.success ? <CheckCircle size={48} color="#00e676" /> : <XCircle size={48} color="#ff4b4b" />}
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: scanResult.success ? '#00e676' : '#ff4b4b', textAlign: 'center' }}>
                {scanResult.message}
              </h3>

              {scanResult.success && scanResult.data && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Student: {scanResult.data.studentName}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>ID: {scanResult.data.studentId}</p>
                  <div style={{ 
                      marginTop: '15px', padding: '10px 30px', background: 'var(--accent-color)', 
                      borderRadius: '8px', fontWeight: 'bold', fontSize: '1.3rem' 
                  }}>
                    Proceed to PC {scanResult.data.pcId}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRScanner;
