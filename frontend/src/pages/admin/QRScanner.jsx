import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Camera, Loader } from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setCameraError(null);
        await html5QrCode.start(
          { facingMode: "environment" }, // Rear camera
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.65;
              return { width: size, height: size };
            }
          },
          onScanSuccess,
          onScanFailure
        );
        setIsScannerActive(true);
      } catch (err) {
        console.error("Error starting QR scanner:", err);
        setCameraError("Unable to access camera. Please ensure camera permissions are allowed.");
      }
    };

    const onScanSuccess = async (decodedText) => {
      if (isProcessing) return;
      
      try {
        setIsProcessing(true);
        const data = JSON.parse(decodedText);
        
        if (!data.referenceNumber) {
          throw new Error("Invalid QR Code format.");
        }

        // Pause scanning
        await html5QrCode.pause();

        // Call backend check-in
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
        // Resume scanning after 3 seconds
        setTimeout(async () => {
            setScanResult(null);
            try {
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.resume();
              }
            } catch (e) {
              console.error("Failed to resume scanner:", e);
            }
        }, 3000);
      }
    };

    const onScanFailure = (error) => {
      // Ignored
    };

    // Delay start slightly to ensure DOM element is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop()
            .then(() => html5QrCodeRef.current.clear())
            .catch(err => console.error("Error clearing scanner on unmount:", err));
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>QR Check-In Scanner</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Scan a student's booking QR code to grant them access to the lab.
        </p>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Scanner Container */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '350px', 
            aspectRatio: '1/1',
            borderRadius: '16px', 
            overflow: 'hidden', 
            background: '#0c0d1f',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--glass-shadow)',
            marginBottom: '1rem'
          }}>
            <div id="reader" style={{ width: '100%', height: '100%' }}></div>
            
            {!isScannerActive && !cameraError && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '12px', background: 'rgba(12, 13, 31, 0.95)', zIndex: 5
              }}>
                <Loader style={{ animation: 'spin 1s linear infinite' }} size={32} color="var(--accent-color)" />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Starting camera...</p>
              </div>
            )}

            {cameraError && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '12px', background: 'rgba(12, 13, 31, 0.95)', padding: '1.5rem', textAlign: 'center', zIndex: 5
              }}>
                <Camera size={44} color="#ff4b4b" />
                <p style={{ color: '#ff4b4b', fontWeight: '500', fontSize: '0.9rem' }}>{cameraError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="glass-button" 
                  style={{ marginTop: '10px', padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  Retry Access
                </button>
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <p style={{ color: 'var(--accent-color)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <Loader style={{ animation: 'spin 1s linear infinite' }} size={16} /> Verifying Booking...
            </p>
          )}
          
          {/* Result Display */}
          {scanResult && (
            <div style={{
              marginTop: '1.5rem',
              width: '100%',
              maxWidth: '350px',
              padding: '1.5rem',
              borderRadius: '12px',
              background: scanResult.success ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 75, 75, 0.1)',
              border: `1px solid ${scanResult.success ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 75, 75, 0.3)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              {scanResult.success ? <CheckCircle size={48} color="#00e676" /> : <XCircle size={48} color="#ff4b4b" />}
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: scanResult.success ? '#00e676' : '#ff4b4b', textAlign: 'center' }}>
                {scanResult.message}
              </h3>

              {scanResult.success && scanResult.data && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Student: {scanResult.data.studentName}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: {scanResult.data.studentId}</p>
                  <div style={{ 
                      marginTop: '15px', padding: '10px 30px', background: 'var(--accent-color)', 
                      borderRadius: '8px', fontWeight: 'bold', fontSize: '1.3rem', color: 'white'
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
