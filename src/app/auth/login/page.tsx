  "use client";

  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import PhoneVerification from "../PhoneAuth";
  import "bootstrap/dist/css/bootstrap.min.css";
  import "./login.module.css";

  const Login = () => {
    const router = useRouter();

    const handleVerified = (phone: string) => {
      localStorage.setItem("phoneNumber", phone);
      router.push("/");
    };

    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-body-secondary">
        
          <section>
            <main className="form-signin w-100 m-auto" style={{ maxWidth: "500px" }}>
              <form className="container text-center">
              <h1 className={`kablammo-myProject h3 mb-3 fw-normal`}>Login with your phone number</h1>
              <p>Please enter your mobile number. We will send a One-Time Password (OTP) to this number for verification.</p>
              <div>
              <PhoneVerification onVerified={handleVerified} />

              </div>

              </form>
            </main>
          </section>

          
       
      </div>
    );
  };

  export default Login;
