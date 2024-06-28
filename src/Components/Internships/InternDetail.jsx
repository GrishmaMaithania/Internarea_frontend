import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../feature/UserSlice';
import axios from 'axios';
import './detail.css';

function InternDetail() {
  const user = useSelector(selectUser);
  const [isDivVisible, setDivVisible] = useState(false);
  const [textare, setTextare] = useState('');
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('q');

  const show = () => {
    setDivVisible(true);
  };

  const hide = () => {
    setDivVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://internarea-backend-5p54.onrender.com/api/internship/${id}`);
        console.log('Fetched Data:', response.data); 
        setInternship(response.data);
      } catch (error) {
        setError('Failed to fetch internship details');
        console.log(error);
      }
    };
    fetchData();
  }, [id]);

  const submitApplication = async () => {
    if (textare === '') {
      alert('Fill the mandatory fields');
    } else {
      const bodyJson = {
        coverLetter: textare,
        category: internship.category,
        company: internship.company,
        user: user,
        Application: id,
      };

      try {
        await axios.post('https://internarea-backend-5p54.onrender.com/api/application', bodyJson);
        alert('Application submitted successfully');
        navigate('/Jobs');
      } catch (error) {
        alert('An error occurred while submitting the application');
        console.log(error);
      }
    }
  };

  if (!internship && !error) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="details-app">
        <h1 className="font-bold text-3xl text-center">{internship.title}</h1>
        <div className="m-14 shadow-sm rounded-md border">
          <p className="mb-4 mt-3" id="boxer">
            <i className="bi bi-arrow-up-right text-blue-500"></i> Actively Hiring
          </p>
          <p className="text-xl font-bold mt-4">{internship.title}</p>
          <p className="text-sm text-slate-300">{internship.company}</p>
          <p><i className="bi bi-geo-alt-fill"></i> {internship.location}</p>
          <div className="job-details flex justify-between">
            <p className="mt-3 text-slate-400">
              <i className="bi bi-play-circle-fill"></i> Start Date <br /> {internship.StartDate}
            </p>
            <p className="mt-3 text-slate-400 text-center">
              <i className="bi bi-calendar-check-fill"></i> Duration <br /> {internship.Duration}
            </p>
            <p className="mt-3 text-slate-400">
              <i className="bi bi-cash"></i> Stipend <br /> {internship.stipend}
            </p>
          </div>
          <div className="flex">
            <p className="bg-green-100 rounded-md ml-4 text-green-300">
              <i className="bi bi-clock"></i> {internship.deadline}
            </p>
          </div>
          <hr />
          <div className="aboutCompany flex justify-start">
            <p className="mt-3 text-xl font-bold text-start">About {internship.company}</p>
          </div>
          <div className="flex">
            <p className="text-blue-500">Instagram page <i className="bi bi-arrow-up-right-square"></i></p>
          </div>
          <p className="mt-4">{internship.aboutCompany}</p>
          <div className="about-Job">
            <p className="mt-3 text-xl font-bold text-start">About Job</p>
            <p>{internship.aboutInternship}</p>
          </div>
          <p className="text-blue-500 justify-start">Learn Business Communication</p>
          <div className="whocan">
            <p className="mt-3 text-xl font-bold text-start">Who can apply</p>
            <p>{internship.Whocanapply}</p>
          </div>
          <p className="mt-3 text-xl font-bold text-start">Perks</p>
          <p>{internship.perks}</p>
          <p className="mt-3 text-xl font-bold text-start">Additional information</p>
          <p>{internship.AdditionalInfo}</p>
          <p className="mt-3 text-xl font-bold text-start">Number of openings</p>
          <p className="text-start">{internship.numberOfopning}</p>
          <div className="flex justify-center mt-6 bg-blue-500 w-40 text-center text-white font-bold">
            <button className="flex justify-center align-middle" onClick={show}>Apply</button>
          </div>
        </div>
      </div>
      {isDivVisible && (
        <div className="application-page">
          <div className="bg">
            <button className="close2" onClick={hide}>
              <i className="bi bi-x"></i>
            </button>
            <p>Applying for {internship.company}</p>
            <p className="mt-3 text-sm font-bold text-start mb-3">{internship.aboutCompany}</p>
          </div>
          <div className="moreSteps">
            <p className="font-semibold text-xl">Your resume</p>
            <small>Your current resume will be submitted along with the application</small>
            <p className="mt-5 font-semibold text-xl">Cover letter</p>
            <br />
            <p>Why should we hire you for this role?</p>
            <textarea name="coverLetter" placeholder="" id="text" value={textare} onChange={(e) => setTextare(e.target.value)}></textarea>
            <p className="mt-5 font-semibold text-xl">Your availability</p>
            <p>Confirm your availability</p>
            <div>
              <label>
                <input type="radio" name="availability" value="Yes, I am available to join immediately" />
                Yes, I am available to join immediately
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="availability" value="No, I am currently on notice period" />
                No, I am currently on notice period
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="availability" value="No, I will have to serve notice period" />
                No, I will have to serve notice period
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="availability" value="Other" />
                Other <span className="text-slate-500">(Please specify your availability)</span>
              </label>
            </div>
            <p className="mt-5 font-semibold text-xl">Custom resume <span className="text-slate-500">(Optional)</span></p>
            <small className="text-slate-500">Employer can download and view this resume</small>
            <div className="submit flex justify-center">
              {user ? (
                <button className="submit-btn" onClick={submitApplication}>Submit application</button>
              ) : (
                <Link to="/register">
                  <button className="submit-btn">Submit application</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternDetail;
