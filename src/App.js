import React, { useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footerr/Footer';
import Home from './Components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import Register from './Components/auth/Register';
import Intern from './Components/Internships/Intern';
import JobAvl from './Components/job/JobAvl';
import JobDetail from './Components/job/JobDetail';
import InternDetail from './Components/Internships/InternDetail'; 
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, selectUser } from './feature/UserSlice';
import { auth } from './firebase/firebase';
import Profile from './profile/Profile';
import AdminLogin from './Admin/AdminLogin';
import Adminpanel from './Admin/Adminpanel';
import Postinternships from './Admin/Postinternships';
import PostJob from './Admin/PostJob';
import ViewAllApplication from './Admin/ViewAllApplication';
import DetailApplication from './Applications/DetailApplication.jsx';
import UserApplication from './profile/UserApplication.jsx';
import DetailApplicationUser from './Applications/DetailApplicationUser.jsx';

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(login({
          uid: authUser.uid,
          photo: authUser.photoURL,
          name: authUser.displayName,
          email: authUser.email,
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/Internship' element={<Intern />} />
        <Route path='/Jobs' element={<JobAvl />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/detailInternship' element={<InternDetail />} />
        <Route path='/detailjob' element={<JobDetail />} />
        <Route path='/adminLogin' element={<AdminLogin />} />   
        <Route path='/adminpanel' element={<Adminpanel />} />  
        <Route path='/postInternship' element={<Postinternships />} />   
        <Route path='/postJob' element={<PostJob />} />       
        <Route path='/applications' element={<ViewAllApplication />} />    
        <Route path='/detailApplication' element={<DetailApplication />} /> 
        <Route path='//UserapplicationDetail' element={<DetailApplicationUser />} />    
        <Route path='/userapplication' element={<UserApplication />} />      
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
