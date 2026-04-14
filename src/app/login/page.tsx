"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { setToken } from "@/lib/auth";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
 
const [password, setPassword] = useState("");

  const [timer, setTimer] = useState(0);
const [canResend, setCanResend] = useState(true);
const [loading, setLoading] = useState(false);

const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  /* ================= SEND OTP ================= */
  const sendOTP = async () => {
    if (!email) return alert("Enter email");
  
    setLoading(true);
  
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
  
      if (res.ok) {
        setStep("otp");
        setTimer(60);        // 🔥 start timer
        setCanResend(false); // 🔥 disable resend
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // only digits
  
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
  
    // move to next box
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };


  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
  
    if (!/^\d+$/.test(paste)) return;
  
    const newOtp = paste.split("");
    setOtpArray(newOtp);
  
    // focus last box
    const last = document.getElementById(`otp-${newOtp.length - 1}`);
    last?.focus();
  };

  /* ================= VERIFY OTP ================= */
  

const verifyOTP = async () => {
  const finalOtp = otpArray.join("");

  if (finalOtp.length !== 6) {
    alert("Enter valid OTP");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, otp: finalOtp })
    });

    const data = await res.json();

    console.log("OTP RESPONSE:", data); // 🔍 DEBUG

    if (!res.ok) {
      alert(data.message);
      return;
    }

    if (!data.token || typeof data.token !== "string") {
      alert("Invalid token from server");
      return;
    }

    //setToken(data.token); // ✅ SAFE STORE

    //router.push("/"); // ✅ no reload
    setToken(data.token);
window.location.href = "/";

  } catch (err) {
    console.error(err);
    alert("OTP verification failed");
  }
};

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
  
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timer]);

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
  
      <div className="bg-white p-6 rounded-xl w-[320px]">
  
        <h2 className="text-lg mb-4 text-center">
          Login / Signup
        </h2>
  
        {step === "email" ? (
          <>
            <input
              placeholder="Enter Email"
              className="mb-3 p-2 border w-full"
              onChange={(e) => setEmail(e.target.value)}
            />
  
            <button
              onClick={sendOTP}
              disabled={loading}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <div
  className="flex justify-between gap-2 mb-3"
  onPaste={handlePaste}
>
  {otpArray.map((digit, index) => (
    <input
      key={index}
      id={`otp-${index}`}
      type="text"
      
      maxLength={1}
      value={digit}
      onChange={(e) =>
        handleOtpChange(e.target.value, index)
      }
      onKeyDown={(e) => handleKeyDown(e, index)}
      className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  ))}
</div>
            <button
              onClick={verifyOTP}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
            >
              Verify OTP
            </button>
  
            {/* 🔥 RESEND SECTION */}
            <div className="text-center mt-3 text-sm">
              {canResend ? (
                <button
                  onClick={sendOTP}
                  className="text-blue-600 hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500">
                  Resend OTP in{" "}
                  <span className="font-semibold">{timer}s</span>
                </p>
              )}
            </div>
  
            {/* Optional UX */}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Didn’t receive OTP? Check spam folder
            </p>
          </>
        )}
  
      </div>
    </div>
  );
}