import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  selectedRole?: string;
}

interface ApiError {
  error: string;
  details?: string;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerified,
  selectedRole,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setShowOtp(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.";
      setError(message);
      setShowOtp(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          otp: otp.trim(),
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      if (data.verified) {
        onVerified(phoneNumber);
      } else {
        throw new Error("Verification failed. Please try again.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setShowOtp(false);
    handleSendOtp();
  };

  return (
    <div className="space-y-4">
      <div>
        {/* <label className=" form-label block text-sm font-medium text-gray-700 mb-1 ">
          Phone Number
        </label> */}
        <div className="form-floating mb-3">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setError("");
              setPhoneNumber(e.target.value);
            }}
            className=" form-control"
            placeholder=" "
            disabled={showOtp && loading}
            id="floatingInput"
          />
          <label htmlFor="floatingInput">
            <i className="bi bi-phone"></i> ENTER MOBILE NO
          </label>
        </div>
      </div>

      {!showOtp ? (
        <button
          onClick={handleSendOtp}
          disabled={loading || !phoneNumber.trim()}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 
                     disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors "
          style={{
            backgroundColor: "#E8F54A",
          }}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <>
          <div className="w-100 ">
            <div  className="form-floating mb-3">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setError("");
                  setOtp(e.target.value);
                }}
                className=" form-control"
                placeholder=" " 
                maxLength={6}
                id="floatingInput2"
                disabled={showOtp && loading} 
              />
              <label htmlFor="floatingInput2">ENTER OTP</label>
            </div>
          </div>

          <div className="flex p-3 gap-3 m-2 row">
            <div className="col">
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp.trim()}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 
                         disabled:bg-green-300 disabled:cursor-not-allowed transition-colors  "
              style={{
                backgroundColor: "#E8F54A",
              }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            </div>
            <div className="col">
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="  btn btn-warning w-full text-blue-500 text-sm hover:text-blue-600 
                         disabled:text-blue-300 disabled:cursor-not-allowed transition-colors "
              style={{
                backgroundColor: "#E8F54A",
                color: "white",
                border: "none",
              }}
            >
              Resend OTP
            </button>
            </div>
            
            
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;
