import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup,signOut, createUserWithEmailAndPassword, getAuth, signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider, signInWithCredential,fetchSignInMethodsForEmail,signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc,getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { auth, firestore, provider } from '../../firebase/firebase';
import { toast } from 'react-toastify';
import './register.css';
import UAParser from 'ua-parser-js';
import axios from 'axios';

function Register() {
  const [isStudent, setStudent] = useState(true);
  const [isLoginDivVisible, setLoginDivVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPhoneSignupVisible, setIsPhoneSignupVisible] = useState(false);
  const [isOtpVisible, setIsOtpVisible] = useState(false);
 

  let navigate = useNavigate();

 


  useEffect(() => {
    if (!window.recaptchaVerifier) {
      const auth = getAuth();
      window.recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, []);


 

  const checkUserExists = async (uid) => {
    try {
     
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };
  



  const handleSignin = async () => {
 try{
      const res = await signInWithPopup(auth, provider);

      const { user } = res;
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        await signOut(auth);
        toast.success("User already signed up");

      } else {
      
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,

        });
        navigate("/");
        toast.success("Sign-in with Google Success");
      }
    } catch (err) {
    
      console.error("Sign-in with Google Failed:", err);
      toast.error("Sign-in with Google Failed: " + err.message);
    }
  };
  
  
  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
   
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
   
        toast.error("User already signed up with this email.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      
      await setDoc(doc(firestore, 'users', user.uid), {
        fname: fname,
        lname: lname,
        email: email,
      });
  
      console.log('User signed up:', user);
      toast.success("Signup Successful. Verification email sent.");
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error("Signup Failed: " + error.message);
    }
  };
  const handleSubmitPhoneSignup = async (event) => {
    event.preventDefault();
    try {

      const phoneNumberQuery = query(collection(firestore, 'users'), where('phone', '==', phone));
      const querySnapshot = await getDocs(phoneNumberQuery);
  
      if (!querySnapshot.empty) {
  
        toast.error("User already signed up with this phone number.");
        return;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      console.log('confirmationResult:', confirmationResult);
  
      setIsOtpVisible(true);
      setVerificationCode(confirmationResult.verificationId);
  
      toast.success("OTP sent to your phone number.");
    } catch (error) {
      console.error('Error signing up with phone number:', error);
      toast.error("Signup Failed: " + error.message);
    }
  };

  const loginFunction = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const userExists = await checkUserExists(user.uid);
  
      if (!userExists) {
        await signOut(auth);
        toast.error("You need to sign up first.");
        return;
      }
  
      const email = user.email;
      const phoneNumber = user.phoneNumber; 
  
      if (email) {
        localStorage.setItem('email', email);
        await handleOtpAndLogin({ email });
      } else if (phoneNumber) {
        localStorage.setItem('phoneNumber', phoneNumber);
        await handleOtpAndLogin({ phoneNumber });
      }
    } catch (err) {
      console.log('Authentication failed:', err);
    }
  };
  
  const handleOtpAndLogin = async (userInfo) => {
    const { email, phoneNumber } = userInfo;
  
    const parser = new UAParser();
    const userAgent = parser.getResult();
    const browser = userAgent.browser.name;
    const os = userAgent.os.name;
    const device = userAgent.device.type || 'desktop';
  
    if (browser === 'Chrome') {
      try {
     
        await sendOtp({ email });
  
        const otp = prompt('Please enter the OTP sent to your email:');
        if (!otp) {
          alert('OTP not entered. Login aborted.');
        
          await signOut(auth);
          window.location.href = '/';
          return;
        }
  
        try {
          await verifyOtp({ email, otp });
        
          await postUserInfo({ email, phoneNumber, browser, os, device });
          console.log('OTP verified successfully');
          setLoginDivVisible(false);
        } catch (error) {
          console.error('Error verifying OTP:', error);
          alert('OTP verification failed. Please try again.');
       
          await signOut(auth);
          window.location.href = '/';
          return;
        }
      } catch (error) {
        console.error('Error during OTP process:', error);
        alert('Error sending OTP. Please try again.');

        await signOut(auth);
        window.location.href = '/';
      }
    } else {
      
      await postUserInfo({ email, phoneNumber, browser, os, device });
    }
  };
  
  const sendOtp = async ({ email }) => {
    try {
      const response = await axios.post('https://internarea-backend-5p54.onrender.com/api/otp/sendotp', { email });
      console.log('OTP sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };
  
  const verifyOtp = async ({ email, otp }) => {
    try {
      const response = await axios.post('https://internarea-backend-5p54.onrender.com/api/otp/verifyotp', { email, otp });
      console.log('OTP verified successfully:', response.data);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('OTP verification failed');
    }
  };
  
  const postUserInfo = async (userInfo) => {
    const { email, phoneNumber, browser, os, device } = userInfo;
 
    const ip = await getIPAddress();
  
    const userInfoToSend = {
      email,
      phoneNumber,
      ip,
      deviceInfo: {
        browser,
        os,
        device,
      },
      loginHistory: [{
        loginTime: new Date(),
        ip,
        deviceInfo: {
          browser,
          os,
          device,
        }
      }],
      createdAt: new Date(),
    };
  
    try {
      const response = await axios.post('https://internarea-backend-5p54.onrender.com/api/users', userInfoToSend);
      console.log('User info posted successfully:', response.data);
      showLastLoginPopup({ email, phoneNumber });
    } catch (error) {
      console.error('Error posting user info:', error);
    }
  };
  
  const handleSubmitPhoneLogin = async (event) => {
    event.preventDefault();
    try {
      
      const phoneNumberQuery = query(collection(firestore, 'users'), where('phone', '==', phone));
      const querySnapshot = await getDocs(phoneNumberQuery);
  
      if (querySnapshot.empty) {
       
        toast.error("User not signed up.");
        return;
      }
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      console.log('confirmationResult:', confirmationResult);
      setIsOtpVisible(true);
      setVerificationCode(confirmationResult.verificationId);
  
      toast.success("OTP sent to your phone number.");
    } catch (error) {
      console.error('Error signing up with phone number:', error);
      toast.error("Signup Failed: " + error.message);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
   
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
        const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;
  
        const parser = new UAParser();
        const userAgent = parser.getResult();
        const browser = userAgent.browser.name;
        const os = userAgent.os.name;
        const device = userAgent.device.type || 'desktop';
  
        console.log('Device Info:', { browser, os, device });
  
        
        console.log('User signed up with phone:', user);
        
        
        await postUserInfo({
       
          phoneNumber: phone,
          browser,
          os,
          device
        });
        
        toast.success("Phone Verification Successful");
  
        
            navigate("/");
            setLoginDivVisible(false);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        toast.error("OTP Verification Failed: " + error.message);
    }
  };

  const showLastLoginPopup = async (userIdentifier) => {
    const { email, phoneNumber } = userIdentifier;
  
    try {
      console.log(`Fetching user data for identifier: ${email || phoneNumber}`);
  
      const query = email ? `email=${encodeURIComponent(email)}` : `phoneNumber=${encodeURIComponent(phoneNumber)}`;
      const response = await axios.get(`https://internarea-backend-5p54.onrender.com/api/users?${query}`);
      const user = response.data;
  
      if (user.loginHistory.length > 1) {
        const lastLogin = user.loginHistory[user.loginHistory.length - 2]; 
        const lastLoginTime = new Date(lastLogin.loginTime).toLocaleString();
        const lastLoginIp = lastLogin.ip;
        const lastLoginDevice = `${lastLogin.deviceInfo.browser} on ${lastLogin.deviceInfo.os} (${lastLogin.deviceInfo.device})`;
  
        alert(`Your last login was on ${lastLoginTime} from IP ${lastLoginIp} using ${lastLoginDevice}.`);
      } else {
        alert('This is your first login.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response) {
        console.error(`Response error: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.status === 404) {
          console.error('Endpoint not found. Please check the URL.');
        }
      } else {
        console.error('Request error:', error.message);
      }
    }
  };
 
  const getIPAddress = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return 'unknown';
    }
  };



  const setTrueForStudent = () => {
    setStudent(false);
  };
  const setFalseForStudent = () => {
    setStudent(true);
  };

  const showLogin = () => {
    setLoginDivVisible(true);
  };

  const closeLogin = () => {
    setLoginDivVisible(false);
  };
  

  return (
    <div>
      <div id="recaptcha-container"></div> 
     
        <div className="form">
          <h1>Sign-up and Apply For Free</h1>
          <p className='para3'>1,50,000+ companies hiring on Internshala</p>
          <div className="regi">
            <div className="py-6">
              <div className="flex bg-white rounded-lg justify-center shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                <div className="w-full p-8 lg:w-1/2">
                  <a onClick={handleSignin} className="flex items-center h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
                    <div className="px-4 py-3 cursor-pointer">
                    <svg className="h-6 w-6" viewBox="0 0 40 40">
                      <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                      <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                      <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                      <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                    </svg>
                    </div>
                    <h1 className="cursor-pointer px-4 py-3 w-5/6 text-center text-xl text-gray-600 font-bold text-sm">Sign in with Google</h1>
                  </a>
                  <div className="mt-4 flex items-center justify-between">
                    <span className='border-b w-1/5 lg:w1/4'></span>
                    <a href="/" className='text-xs text-center text-gray-500 uppercase'>or</a>
                    <span className='border-b w-1/5 lg:w1/4'></span>
                  </div>

                  <form onSubmit={handleSignUp}>
                    <div className="mt-4">
                      <label htmlFor="email" className='border-b text-gray-700 text-sm font-bold mb-2'>Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' id='email' />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="password" className='border-b text-gray-700 text-sm font-bold mb-2'>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' id='password' />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <label htmlFor="Fname" className='border-b text-gray-700 text-sm font-bold mb-2'>First Name</label>
                        <input type="text" className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' id='Fname' value={fname} onChange={(e) => setFname(e.target.value)} />
                      </div>
                      <div className='ml-5'>
                        <label htmlFor="Lname" className='border-b text-gray-700 text-sm font-bold mb-2'>Last Name</label>
                        <input type="text" className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' id='Lname' value={lname} onChange={(e) => setLname(e.target.value)} />
                      </div>
                      
                      </div>
                  
<button type="submit" className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-full rounded hover:bg-blue-600'>Sign Up </button>
</form>
<div className="mt-4 flex items-center justify-between">
                    <span className='border-b w-1/5 lg:w1/4'></span>
                    <a href="/" className='text-xs text-center text-gray-500 uppercase'>or</a>
                    <span className='border-b w-1/5 lg:w1/4'></span>
                  </div>
          <div className="flex items-center h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
           <button onClick={() => setIsPhoneSignupVisible(true)} className="cursor-pointer px-4 py-3 w-5/6 text-center text-xl text-gray-600 font-bold text-sm">Sign Up with Phone Number</button>
           </div>  
            <div className="mt-4">
            {isPhoneSignupVisible && (
                      <form onSubmit={handleSubmitPhoneSignup}>
                      <label htmlFor="phone" className="border-b text-gray-700 text-sm font-bold mb-2">Phone Number including country code</label>
                      <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' />
                      <button type="submit" className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-full rounded hover:bg-blue-600'>Send OTP</button>
                  </form>
            )}
                  {isOtpVisible && (
  <form onSubmit={handleVerifyOtp}>
    <label htmlFor="otp" className="text-gray-700 text-sm font-bold mb-2">OTP</label>
    <input
      type="text"
      id="otp"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none'
    />
    <button
      type="submit"
      className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-fullrounded hover:bg-green-600'
    >
      Verify OTP
    </button>
  </form>
)}
</div>
<small>By signing up, you agree to our <span className='text-blue-400'>Term and Conditions.</span></small>



<div className='mt-4'>
Already registered? <span className='text-blue-400 cursor-pointer' onClick={showLogin}>Login</span>
</div>
</div>
</div>
</div>
</div>
</div>


      <div className="login"style={{ width: '75%', left:'10%',top:'10%' }}>
    {
        isLoginDivVisible &&(
            <>
            <button id='cross' onClick={closeLogin}><i class="bi bi-x"></i></button>
            <h5 id='state' className='mb-4 justify-center text-center'>
                <span id='Sign-in' style={{cursor:"pointer"}} className={`auth-tab ${isStudent? 'active':""}`} onClick={setFalseForStudent}>
                    Student
                </span>
                &nbsp;     &nbsp; &nbsp;    &nbsp;    &nbsp;    &nbsp;    &nbsp;
                <span id='join-in' style={{cursor:"pointer"}} className={`auth-tab ${isStudent? 'active':""}`} onClick={setTrueForStudent}>
                    Employee andT&P
                </span>
            </h5>
            {isStudent ?(
                <>
                <div className="py-6">


                    <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
<div className="w-full p-8 lg:w-1/2">
<p onClick={loginFunction } className='flex
 items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100' >
    <div className="px-4 py-3">
    <svg class="h-6 w-6" viewBox="0 0 40 40">
                         <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                         <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                         <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                         <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                     </svg>
    </div>
    <h1 className='text-gray-500 text-sm'>Login With Google 
    </h1>
 </p>
 

 

<span className='border-b- w-1/5 lg:w-1/4'></span>
<p className='text-gray-500 text sm font-bold mb-2'> or</p>
<span className='border-b- w-1/5 lg:w-1/4'></span>

          <div className="flex items-center h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
           <button onClick={() => setIsPhoneSignupVisible(true)} className='btn3  bg-blue-500 h-12 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600 text-sm'>Login with Phone Number</button>
           </div>  
            <div className="mt-4">
            {isPhoneSignupVisible && (
                      <form onSubmit={handleSubmitPhoneLogin}>
                      <label htmlFor="phone"  class="block text-gray-700 text-sm font-bold mb-2">Phone Number including country code</label>
                      <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' />
                      <button type="submit" className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-full rounded hover:bg-blue-600'>Send OTP</button>
                  </form>
            )}
                  {isOtpVisible && (
  <form onSubmit={handleVerifyOtp}>
    <label htmlFor="otp" className="text-gray-700 text-sm font-bold mb-2">OTP</label>
    <input
      type="text"
      id="otp"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none'
    />
    <button
      type="submit"
      className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-fullrounded hover:bg-green-600'
    >
      Verify OTP
    </button>
  </form>
)}
</div>



          

             <div className="mt-4 flex items-center justify-between">
<p className='text-sm'>New to internarea? Register(<span className='text-blue-500 cursor-pointer' onClick={closeLogin}>Student</span>/<span className='text-blue-500 cursor-pointer' onClick={closeLogin}>company</span>) </p>
             </div>
</div>
                    </div>
                </div>
                
                </>
            ):(
                <>
                                   <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
<div className="w-full p-8 lg:w-1/2">
<p onClick={loginFunction } className='flex
 items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100' >
    <div className="px-4 py-3">
    <svg class="h-6 w-6" viewBox="0 0 40 40">
                         <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                         <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                         <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                         <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                     </svg>
    </div>
    <h1 className='text-gray-500 text-sm'>Login With Google 
    </h1>
 </p>
 

 

<span className='border-b- w-1/5 lg:w-1/4'></span>
<p className='text-gray-500 text sm font-bold mb-2'> or</p>
<span className='border-b- w-1/5 lg:w-1/4'></span>

          <div className="flex items-center h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
           <button onClick={() => setIsPhoneSignupVisible(true)} className='btn3  bg-blue-500 h-12 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600 text-sm'>Login with Phone Number</button>
           </div>  
            <div className="mt-4">
            {isPhoneSignupVisible && (
                      <form onSubmit={handleSubmitPhoneLogin}>
                      <label htmlFor="phone"  class="block text-gray-700 text-sm font-bold mb-2">Phone Number including country code</label>
                      <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none' />
                      <button type="submit" className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-full rounded hover:bg-blue-600'>Send OTP</button>
                  </form>
            )}
                  {isOtpVisible && (
  <form onSubmit={handleVerifyOtp}>
    <label htmlFor="otp" className="text-gray-700 text-sm font-bold mb-2">OTP</label>
    <input
      type="text"
      id="otp"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className='text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none'
    />
    <button
      type="submit"
      className='bg-blue-500 h-9 text-white font-bold py-2 mt-4 px-4 w-fullrounded hover:bg-green-600'
    >
      Verify OTP
    </button>
  </form>
)}
</div>
             <div className="mt-4 flex items-center justify-between">
<p className='text-sm'>new to internarea? Register(<span className='text-blue-500 cursor-pointer' onClick={closeLogin}>Student</span>/<span className='text-blue-500 cursor-pointer' onClick={closeLogin}>company</span>) </p>
             </div></div>
             </div>
                </>
            )
            }
            </>
        )
    }
</div>
    </div>
  )
}

export default Register;
