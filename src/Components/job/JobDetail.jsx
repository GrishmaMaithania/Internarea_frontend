import React, { useEffect, useState } from 'react';
import { selectUser } from '../../feature/UserSlice';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './job.css';
import axios from 'axios';

function JobDetail() {
  const user = useSelector(selectUser);
  const [isDivVisible, setDivVisible] = useState(false);
  const [textarea, setTextarea] = useState('');
  const [jobDetails, setJobDetails] = useState(null); // Initialize as null to handle loading state
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('q');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://internarea-backend-qfpt.onrender.com/api/job/${id}`);
        console.log(response.data); 
        setJobDetails(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchData();
  }, [id]);

  const show = () => {
    setDivVisible(true);
  };

  const hide = () => {
    setDivVisible(false);
  };

  const submitApplication = async () => {
    if (textarea === '') {
      alert('Fill the mandatory fields');
    } else {
      const bodyJson = {
        coverLetter: textarea,
        category: jobDetails.category,
        company: jobDetails.company,
        user: user,
        Application: id,
      };

      try {
        await axios.post('https://internarea-backend-qfpt.onrender.com/api/application', bodyJson);
        alert('Done');
        navigate('/Jobs');
      } catch (error) {
        alert('Error occurred');
      }
    }
  };

  if (!jobDetails) {
    return <div>Loading...</div>; // Display loading state
  }

  return (
    <div>
      <div className="details-app">
        <h1 className='font-bold text-3xl text-center'>{jobDetails.title}</h1>
        <div className="m-14 shadow-sm rounded-md border">
          <p className='mb-4 mt-3' id='boxer'>
            <i className='bi bi-arrow-up-right text-blue-500'></i> Actively Hiring
          </p>
          <p className='text-xl font-bold mt-4'>{jobDetails.title}</p>
          <p className='text-sm text-slate-300'>{jobDetails.title}</p>
          <p><i className="bi bi-geo-alt-fill"></i> {jobDetails.location}</p>
  
          <div className="job-details flex justify-between">
            <p className='mt-3 text-slate-400'>
              <i className="bi bi-play-circle-fill"></i> Start Date <br /> {jobDetails.StartDate}
            </p>
            <p className='mt-3 text-slate-400 text-center'>
              <i className="bi bi-calendar-check-fill"></i> Experience <br /> {jobDetails.Experience}
            </p>
            <p className='mt-3 text-slate-400'>
              <i className="bi bi-cash"></i> Salary <br /> {jobDetails.CTC}
            </p>
          </div>
  
          <div className="flex">
            <p className='bg-green-100 rounded-md ml-4 text-green-300'>
              <i className="bi bi-clock"></i> 12/12/2012
            </p>
          </div>
  
          <hr />
          <div className="aboutCompany flex justify-start">
            <p className='mt-3 text-xl font-bold text-start'>About {jobDetails.company}</p>
          </div>
          <div className="flex">
            <p className='text-blue-500'>Instagram page <i className='bi bi-arrow-up-right-square'></i></p>
          </div>
          <p className='mt-4'>{jobDetails.aboutCompany}</p>
  
          <div className="about-Job">
            <p className='mt-3 text-xl font-bold text-start'>About Job</p>
            <p>{jobDetails.aboutJob}</p>
          </div>
          <p className='text-blue-500 justify-start'>Learn Business Communication</p>
  
          <div className="whocan">
            <p className='mt-3 text-xl font-bold text-start'>Who can apply</p>
            <p>{jobDetails.Whocanapply}</p>
          </div>
  
          <p className='mt-3 text-xl font-bold text-start'>Perks</p>
          <p>{jobDetails.perks}</p>
  
          <p className='mt-3 text-xl font-bold text-start'>Additional information</p>
          <p>{jobDetails.AdditionalInfo}</p>
  
          <p className='mt-3 text-xl font-bold text-start'>Number of openings</p>
          <p className='text-start'>{jobDetails.numberOfopning}</p>
          <div className='flex justify-center mt-6 bg-blue-500 w-40 text-center text-white font-bold'>
            <button className='flex justify-center align-middle' onClick={show}>Apply</button>
          </div>
        </div>
      </div>
  
      {isDivVisible && (
        <div className="application-page">
          <div className="bg">
            <button className='close2' onClick={hide}>
              <i className='bi-x'></i>
            </button>
            <p>Application for Company {jobDetails.company}</p>
            <p className='mt-3 text-sm font-bold text-start mb-3'>{jobDetails.aboutCompany}</p>
          </div>
          <div className="moreSteps">
            <p className='font-semibold text-xl'>Your resume</p>
            <small>Your current resume will be submitted along with the application</small>
  
            <p className='mt-5 font-semibold text-xl'>Cover letter</p>
            <br />
            <p>Why should we hire you for this role?</p>
            <textarea
              name="coverLetter"
              placeholder=''
              id="text"
              value={textarea}
              onChange={(e) => setTextarea(e.target.value)}
            ></textarea>
  
            <p className='mt-5 font-semibold text-xl'>Your availability</p>
            <p>Confirm your availability</p>
  
            <div>
              <label>
                <input
                  type="radio"
                  value="Yes, I am available to join immediately"
                />
                Yes, I am available to join immediately
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="No, I am currently on notice period"
                />
                No, I am currently on notice period
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="No, I will have to serve notice period"
                />
                No, I will have to serve notice period
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="Other"
                />
                Other <span className='text-slate-500'>(Please specify your availability)</span>
              </label>
            </div>
  
            <p className='mt-5 font-semibold text-xl'>Custom resume <span className='text-slate-500'>(Optional)</span></p>
            <small className='text-slate-500'>Employer can download and view this resume</small>
  
            <div className="submit flex justify-center">
              {user ? (
                <button className='submit-btn' onClick={submitApplication}>Submit application</button>
              ) : (
                <Link to={"/register"}>
                  <button className='submit-btn'>Submit application</button>
                </Link>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}  

export default JobDetail;
  