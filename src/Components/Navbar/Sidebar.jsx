import React, { useEffect, useState } from 'react'
import logo from "../../Assets/logo.png"
import './sidebar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { selectUser } from '../../feature/UserSlice';   
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    const openSidebar = () => {
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.open-btn')) {
                closeSidebar();
            }
        };

        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [sidebarOpen]);

    const logoutFunction = () => {
        signOut(auth)
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                console.error('Sign out error', error);
            });
    };

    return (
        <div className="App2 -mt-2 overflow-hidden">
            <Link to="/">
                <img src={logo} alt="Logo" id="nav2-img" />
            </Link>
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <span className="cursor-pointer close-btn" onClick={closeSidebar}>&times;</span>
                {user ? (
                    <div className="profile">
                        <Link to="/profile">
                            <img className="rounded-full justify-center" src={user.photo} alt="User Profile" />
                        </Link>
                        <p className="text-center">
                            Profile name <span className="font-bold text-blue-500">{user.name}</span>
                        </p>
                    </div>
                ) : (
                    <div className="auth">
                        {/* Render authentication links or components here */}
                    </div>
                )}
                <Link to="/internship">Internships</Link>
                <Link to="/Jobs">Jobs</Link>
                <Link to="/" className="small">Contact Us</Link>
                <hr />
                {user ? (
                    <div className="addmore">
                        <Link to="/userapplication">
                            <p>My Applications</p>
                        </Link>
                        <Link to="/viewresume">
                            <p>View Resume</p>
                        </Link>
                        <Link to="/more">
                            <p>More</p>
                        </Link>
                        <button onClick={logoutFunction}>Log Out <i class="bi bi-box-arrow-right"></i></button>
                    </div>
                ) : (
                    <div className="addmore">
                        <Link to="/register-student">
                            <p>Register - As a Student</p>
                        </Link>
                        <Link to="/register-employer">
                            <p>Register - As an Employer</p>
                        </Link>
                    </div>
                )}
            </div>
            <div className="main">
                <span style={{ fontSize: '25px' }} className="open-btn" onClick={openSidebar}>&#9776;</span>
            </div>
            <div className="search2">
                <i className="bi bi-search"></i>
                <input type="search" placeholder="Search" />
            </div>
            {!user && (
                <>
                    <div className="reg">
                        <Link to="/register">
                            <button className="btn4">Register</button>
                        </Link>
                    </div>
                    <div className="admin">
                        <Link to="/adminLog">
                            <button id="admin">Admin Login</button>
                        </Link>
                    </div>
                </>
            )}
            <p className="text-red-300 hire2">Hire Talent</p>
        </div>
    );
}

export default Sidebar;