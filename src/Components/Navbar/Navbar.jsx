import React, { useState,useEffect } from 'react';
import logo from '../../Assets/logo.png';
import './navbar.css';

import Sidebar from './Sidebar';
import { signInWithPopup,signOut,  getAuth, signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider, signInWithCredential,fetchSignInMethodsForEmail,signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc,getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { auth, provider ,firestore} from '../../firebase/firebase';
import { Link } from 'react-router-dom';
import {useSelector} from 'react-redux'
import { selectUser } from '../../feature/UserSlice';
import { useNavigate } from 'react-router-dom';
import UAParser from 'ua-parser-js';
import { BackgroundColorContext} from '../../BackgroundColorContext'
import { useContext } from 'react';

import { toast } from 'react-toastify';
import axios from 'axios';
function Navbar() {


    const navigate=useNavigate()
    const user=useSelector(selectUser)
    const [verificationCode, setVerificationCode] = useState("");
    const [isDivVisibleForIntern, setDivVisibleForIntern] = useState(false);
    const [isDivVisibleForJob, setDivVisibleForJob] = useState(false);
    const [isDivVisibleForLogin, setDivVisibleForLogin] = useState(false);
    const [isDivVisibleForProfile, setDivVisibleForProfile] = useState(false);
    const [isStudent, setStudent] = useState(true);
    const { setBackgroundColor } = useContext(BackgroundColorContext);
    const [currentUser, setCurrentUser] = useState(null);
    const [isPhoneSignupVisible, setIsPhoneSignupVisible] = useState(false);
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    }, []);

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
  
  
    const sendOTPToMobile = async (mobileNumber) => {
     
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth,mobileNumber, appVerifier);
        setVerificationCode(confirmationResult.verificationId);
        
        return confirmationResult;
      } catch (error) {
        console.error('Error sending OTP to mobile:', error);
        throw error;
      }
    };
  
  
  

  
    const verifyMobileOTP = async (confirmationResult, otp) => {
      try {
        const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
        const userCredential = await signInWithCredential(auth, credential);
        console.log('Phone verification successful');
      } catch (error) {
        console.error('Error verifying mobile OTP:', error);
      }
    };
  
    
    const handleLanguageChange = async (event) => {
      const language = event.target.value;
      const selectField = document.querySelector('.goog-te-combo');
      
      const changeLanguage = () => {
        if (selectField) {
          selectField.value = language;
          selectField.dispatchEvent(new Event('change'));
        }
        changeBackgroundColor(language);
      };
    
      try {
        if (language === 'fr') {
          const email = prompt('Please enter your email address:');
          if (email) {
            console.log(`Sending verification email to: ${email}`);
            await sendOtp({ email });
            const otp = prompt(`A verification email has been sent to ${email}. Please enter the OTP:`);
            if (otp) {
              await verifyOtp({ email, otp });
              changeLanguage();
            } else {
              console.log('No OTP entered');
            }
          }
        } else {
          let mobileNumber = prompt('Please enter your mobile number:');
          if (mobileNumber) {
            if (!mobileNumber.startsWith('+91')) {
              mobileNumber = `+91${mobileNumber}`;
            }
    
            const confirmationResult = await sendOTPToMobile(mobileNumber);
            localStorage.setItem('verificationId', confirmationResult.verificationId);
    
            const otp = prompt(`A verification code has been sent to ${mobileNumber}. Please enter the code:`);
            if (otp) {
              console.log(`Authenticating with mobile: ${mobileNumber} and verifying OTP: ${otp}`);
              await verifyMobileOTP(otp);
              changeLanguage();
            } else {
              console.log('No OTP entered');
            }
          }
        }
      } catch (error) {
        console.error('Error during verification:', error);
      }
    };
    
  
    const changeBackgroundColor = (language) => {
      let color;
      switch (language) {
        case 'hi':
          color = '#ccf2ff';
          break;
        case 'zh-CN':
          color = '#e0ffe0';
          break;
        case 'fr':
          color = '#ffffcc';
          break;
        default:
          color = 'white';
          break;
      }
      document.body.style.backgroundColor = color;
    };
    const checkUserExists = async (uid) => {
      try {
    
        const userDoc = await getDoc(doc(firestore, 'users', uid));
        return userDoc.exists();
      } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
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
            setDivVisibleForLogin(false);
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
              setDivVisibleForLogin(false);
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
    
    
    
    const showLogin = () => {
        setDivVisibleForLogin(true);
    };

    const closeLogin = () => {
        setDivVisibleForLogin(false);
    };

    const setTrueForStudent = () => {
        setStudent(true);
    };

    const setFalseForStudent = () => {
        setStudent(false);
    };

    const showtheProfile=()=>{
        document.getElementById("ico3").className="bi bi-caret-up-fill"
        setDivVisibleForProfile(true)
    }

    const hidetheProfile=()=>{
        document.getElementById("ico4").className="bi bi-caret-down-fill"
        setDivVisibleForProfile(false)
    }
    const showInternShips=()=>{
        document.getElementById("ico").className="bi bi-caret-up-fill"
        setDivVisibleForIntern(true)
    }

    const hideInternShips=()=>{
        document.getElementById("ico").className="bi bi-caret-down-fill"
        setDivVisibleForIntern(false)
    }
    const showJobs=()=>{
        document.getElementById("ico2").className="bi bi-caret-up-fill"
        setDivVisibleForJob(true)
    }
    const hideJobs=()=>{
        document.getElementById("ico2").className="bi bi-caret-down-fill"
        setDivVisibleForJob(false)
    }
    const logoutFunction=()=>{
        signOut(auth)
        navigate("/")
    }

    return (
        <div>
            <div  id="recaptcha-container"></div>
        <nav className='nav1'>
          <ul>
            <div className="img">
              <Link to={"/"}>
                <img src={logo} alt="Logo" />
              </Link>
            </div>
            <div className="elem">
              <Link to={"/Internship"}>
                <p id='int' className='' onMouseEnter={showInternShips}>
                  Internships
                  <i onClick={hideInternShips} id='ico' className="bi bi-caret-down-fill"></i>
                </p>
              </Link>
              <Link to={"/Jobs"}>
                <p onMouseEnter={showJobs}>
                  Jobs
                  <i class="bi bi-caret-down-fill" id='ico2' onClick={hideJobs}></i>
                </p>
              </Link>
              
                <select id="languageDropdown" onChange={handleLanguageChange}>
                <option value="">Select Language</option>
                <option value="hi">Hindi</option>
                <option value="zh-CN">Chinese</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="pt">Portuguese</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="search">
              <i className="bi bi-search"></i>
              <input type="text" placeholder='Search' />
            </div>
            {user ? (
                
              <>
                <div className='profile'>
              
                  <Link to={"/profile"}>
                    <img src={user?.photo} alt="" onMouseEnter={showtheProfile} className='rounded-full w-12' id='picpro' />
                    <i className='bi bi-caret-up-fill' id='ico4' onMouseLeave={hidetheProfile}></i>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="auth">
                  <button className='btn1' onClick={showLogin}>
                    Login
                  </button>
                  <button className='btn2'>
                    <Link to={"/register"}>Register</Link>
                  </button>
                </div>
              </>
            )}
            {user ? (
              <>
                <button className='bt-log' id='bt' onClick={logoutFunction}>
                  Logout <i class="bi bi-box-arrow-right"></i>
                </button>
                
              </>
            ) : (
              <>
                <div className="flex mt-7 hire">Hire Talent</div>
                <div className="admin">
                  <Link to={"/adminLogin"}>
                    <button>Admin</button>
                  </Link>
                </div>
              </>
            )}
          </ul>
        </nav>
      
        {isDivVisibleForIntern && (
          <div className="profile-dropdown-2">
            <div className="left-section">
              <p>Top Locations</p>
              <p>Profile</p>
              <p>Top Category</p>
              <p>Explore More Internships</p>
            </div>
            <div className="line flex bg-slate-400"></div>
            <div className="right-section">
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
            </div>
          </div>
        )}
      
        {isDivVisibleForJob && (
          <div className="profile-dropdown-1">
            <div className="left-section">
              <p>Top Locations</p>
              <p>Profile</p>
              <p>Top Category</p>
              <p>Explore More Internships</p>
            </div>
            <div className="line flex bg-slate-400"></div>
            <div className="right-section">
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
              <p>Intern at India</p>
            </div>
          </div>
        )}
        
      
      
            <div className="login">
    {
             isDivVisibleForLogin &&(
            <>
            <button id='cross' onClick={closeLogin}><i class="bi bi-x"></i></button>
            <h5 id='state' className='mb-4 justify-center text-center'>
                <span id='Sign-in' style={{cursor:"pointer"}} className={`auth-tab ${isStudent? 'active':""}`} onClick={setTrueForStudent}>
                    Student
                </span>
                &nbsp;     &nbsp; &nbsp;    &nbsp;    &nbsp;    &nbsp;    &nbsp;
                <span id='join-in' style={{cursor:"pointer"}} className={`auth-tab ${isStudent? 'active':""}`} onClick={setFalseForStudent}>
                    Employee andT&P
                </span>
            </h5>
            {isStudent ?(
                <>
                <div className="py-6">


                    <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
<div className="w-full p-8 lg:w-1/2">
<p onClick={loginFunction} className='flex items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100' >
    <div className="px-4 py-3">
                                                    <svg className="h-6 w-6" viewBox="0 0 40 40">
                                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107" />
                                                        <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00" />
                                                        <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50" />
                                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2" />
                                                    </svg>
                                                </div>
                                                <h1 className='text-gray-500 text-sm'>Login with Google</h1>

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
             </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                 <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
<div className="w-full p-8 lg:w-1/2">
<p onClick={loginFunction} className='flex items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100' >
    <div className="px-4 py-3">
                                                    <svg className="h-6 w-6" viewBox="0 0 40 40">
                                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107" />
                                                        <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00" />
                                                        <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50" />
                                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2" />
                                                    </svg>
                                                </div>
                                                <h1 className='text-gray-500 text-sm'>Login with Google</h1>

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
             </div></>
                        )}
                    </>
                )
}
            {    isDivVisibleForProfile&&(
                    <div className="profile-dropdown h-16 rounded-sm shadow-sm">
                        <p className='font-bold'>{user?.name}</p>
                        <p className='font-medium'>{user?.email}</p>
                       
                    </div>
                )
            }
            </div>
            <div className='side'>
            <Sidebar /></div>
        </div>

    );
}

export default Navbar;
