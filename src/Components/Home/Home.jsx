import React, { useEffect, useState } from 'react';
import first from "../../Assets/Firstslide.png";
import second from "../../Assets/secondslide.webp";
import third from "../../Assets/thirdsilde.webp";
import fourth from "../../Assets/fourthslide.webp";
import "./home.css";
import Job from './Job'
import { Link } from 'react-router-dom';
import axios from 'axios'
function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("Big Brands")
    const [internshipData,setInternshipData]=useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://internarea-backend-qfpt.onrender.com/api/internship`);
                setInternshipData(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        // Call fetchData here
        fetchData();
    }, []); // Make sure to pass an empty dependency array to run this effect only once after the component mounts
    
    const filterInternShips=internshipData.filter((item)=>
        !selectedCategory ||item.category === selectedCategory
    )

    const handleSlide = (direction) => {
        const container = document.getElementById("container");
        const step = 100;
        if (direction === 'left') {
            setCurrentSlide((prevSlide) => (prevSlide > 0 ? prevSlide - 1 : 0));
        } else {
            setCurrentSlide((prevSlide) => (prevSlide < 3 ? prevSlide + 1 : 3));
        }
        sideScroll(container, direction, 25, step, 10);
    };

    const slideLeft = () => handleSlide('left');
    const slideRight = () => handleSlide('right');

    const handleSlideIntern = (direction) => {
        const container = document.getElementById("container2");
        const step = 100;
        if (direction === 'left') {
            setCurrentSlide((prevSlide) => (prevSlide > 0 ? prevSlide - 1 : 0));
        } else {
            setCurrentSlide((prevSlide) => (prevSlide < 3 ? prevSlide + 1 : 3));
        }
        sideScrollIntern(container, direction, 25, step, 10);
    };

    const slideLeftIntern = () => handleSlideIntern('left');
    const slideRightIntern = () => handleSlideIntern('right');

    return (
        <>
            <h1 className='text-center text-3xl font-bold'>Make your dream career a reality</h1>
            <p className='text-center text-lg font-bold'>Trending on InternArea 🔥</p>

            <div className="imgs flex justify-center" id='container'>
                <div className="slide flex mt-10" id='content'>
                    <img className='slide_Img ml-4' src={first} alt="First Slide" />
                    <img className='slide_Img ml-4' src={second} alt="Second Slide" />
                    <img className='slide_Img ml-4' src={third} alt="Third Slide" />
                    <img className='slide_Img ml-4' src={fourth} alt="Fourth Slide" />
                </div>
            </div>
            <div className="flex BUttons">
                <button className="back" onClick={slideLeft}>
                    <i className="bi bi-chevron-left" id='sideBack'></i>
                </button>
                <button className="next" onClick={slideRight}>
                    <i className="bi bi-chevron-right" id='slide'></i>
                </button>
            </div>

            <div className="infosys">
                <div className="info-intern">
                    <div className="mt-16">
                        <h1 className='text-center font-bold'>Latest internships on Intern Area</h1>
                    </div>
                    <div className="categories flex flex-wrap mt-14">
                        <p>POPULAR CATEGORIES :</p>
                        <span className={`category mr-4 ml-6 ${ selectedCategory==='Big Brands'?'bg-blue-500 text-white':""}`} onClick={()=>setSelectedCategory('Big Brands')}>Big Brands</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="Work From Home"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("Work From Home")}>Work From Home</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="Part-time"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("Part-time")}>Part-time</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="MBA"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("MBA")}>MBA</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="Engineering"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("Engineering")}>Engineering</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="media"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("media")}>Media</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="Design"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("Design")}>Design</span>
<span className={`category mr-4 ml-6 ${selectedCategory==="Data Science"?'bg-blue-500 text-white':
""}`} onClick={()=>setSelectedCategory("Data Science")}>Data Science</span>
                    </div>
                    <div className="internships" id="container2">
                        <div className="Internship-Info flex">
                            {Array.isArray(filterInternShips) && filterInternShips.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="int-1 mt-6">
                                        <p className="mb-4 mt-3" id='boxer'>
                                            <i className='bi bi-arrow-up-right text-blue-500'></i> Actively Hiring</p>
                                        <p>{data.title}</p>
                                        <small className="text-slate-400 text-sm">{data.company}</small>
                                    <hr className='mt-5' />
                                    <p className='mt-3'><i className='bi bi-geo-alt text-slate-400'></i> {data.location}</p>
                                    <p className='mt-1'><i className='bi bi-cash-stack text-slate-400'></i> {data.stipend}</p>
                                    <p className='mt-1'><i className='bi bi-calendar-fill'></i>{data.Duration}</p>
                                    <div className='more flex justify-between mt-6'>
                                        <span classname='bg-slate-200 text-slate-400 w-20 rounded-sm text-center'>Internship</span>
                                     <Link to={`/detailInternship?q=${data._id}`}> <span className='text-blue-500 mr-2'>
                                        View details <i className="bi bi-chevron-right"></i></span></Link>  
                                    </div>
                                    </div>
                                </React.Fragment>
                            ))}
                             
                        </div>
                        
                    </div>
                    <div className="flex BUttons mt-9">
                <button className="back" onClick={slideLeftIntern}>
                    <i className="bi bi-chevron-left" id='sideBack'></i>
                </button>
                <button className="next" onClick={slideRightIntern}>
                    <i className="bi bi-chevron-right" id='slide'></i>
                </button>
            </div>
                </div>
            </div>
            <Job/>
            <hr />
<div className="analytics mt-8 flex flex-wrap justify-center items-center text-center">
    <div className="text-block mt-5">
    <span className='font-bold text-6xl text-blue-600'>300K+ &nbsp;</span>
<p>companies hiring</p>
    </div>
<div className="text-block mt-5">
    <span className='font-bold text-6xl text-blue-600'>10K+ &nbsp;</span>
    <p>new openings everyday</p>
</div>
<div className="text-block mt-5">
    <span className='font-bold text-6xl text-blue-600'>21Mn+ &nbsp;</span>
    <p>active students</p>
</div>
<div className="text-block mt-5">
    <span className='font-bold text-6xl text-blue-600'>600K+ </span>
    <p>learners</p>
</div>
</div>

<div className="logins flex  h-32 mt-8">
<div className="cont">
<p className="flex justify-center text-white text-xl items-center m-5 w-30">Empower your career with InternArea today</p>
</div>
<div className="log flex">


<a href="/register" id='buttons' class="flex items-center  bg-white h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
               <div class="px-4 py-3">
                   <svg class="h-6 w-6" viewBox="0 0 40 40">
                       <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                       <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                       <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                       <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                   </svg>
               </div>
               <p class="px-4 py-3 w-5/6 text-center text-sm text-gray-600 font-bold ">Sign in with Google</p>
  </a>
  <a to="/register">
    <button className='btn6 '> Register</button></a>
    </div>
</div>
<div>
   <footer class="bg-gray-800 text-white">
    <div class="container px-6 py-12 mx-auto">


        <div class="grid grid-cols-2 gap-6 mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div>
                <h3 class="text-sm font-bold  ">Internship by places</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                <p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">New York</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Los Angeles</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Chicago</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">San Francisco</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Miami</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Seattle</p>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-bold  ">Internship by stream</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                <p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">About us</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Careers</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Press</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">News</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Media kit</p>
<p class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Contact</p>

                </div>
            </div>

            <div>
                <h3 class="text-sm font-bold  ">Job Places</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Blog</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Newsletter</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Events</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Help center</a>                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Tutorials</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Supports</a>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-bold  ">Jobs by streams</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Startups</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Enterprise</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Government</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Saas</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Marketplaces</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Ecommerce</a>
                </div>
            </div>

           

          
        </div>
        
        <hr class="my-6 border-gray-200 md:my-10 dark:border-gray-700"/>
        <div>
                <h3 class="text-sm font-bold  ">About us</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Startups</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Enterprise</a>
                 
                </div>
            </div>
        <div>
                <h3 class="text-sm font-bold  ">Team diary</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Startups</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Enterprise</a>
                 
                </div>
            </div>
        <div>
                <h3 class="text-sm font-bold  ">Terms and conditions</h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Startups</a>
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Enterprise</a>
                 
                </div>
            </div>
        <div>
                <h3 class="text-sm font-bold  ">sitemap </h3>

                <div class="flex flex-col items-start mt-4 space-y-4">
                    <a href="/" class=" transition-colors duration-200 dark dark:hover:text-blue-400 hover:underline hover:text-blue-600">Startups</a>
            
                 
                </div>
            </div>
        <div class="flex flex-col items-center justify-between sm:flex-row">
          <p className='border-white' >
          <i class="bi bi-google-play text-black"></i>  Get Android App
          </p>
          <div class="social-icons">
  <i class="fab fa-facebook"></i>
  <i class="fab fa-twitter"></i>
  <i class="fab fa-instagram"></i>

</div>
            <p class="mt-4 text-sm  sm:mt-0 dark">© Copyright 2023. All Rights Reserved.</p>
        </div>
    </div>
</footer>

    </div>
    </>
  )
}

export default Home;

function sideScroll(element, direction, speed, distance, step) {
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
        if (direction === 'left') {
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }
        scrollAmount += step;
        if (scrollAmount >= distance) {
            window.clearInterval(slideTimer);
        }
    }, speed);
}

function sideScrollIntern(element, direction,speed,distance,step){
    let scrollAmount=0;
    const slideTimer=setInterval(function(){
        if (direction==='left') {
            element.scrollLeft-=step
        }
        else{
            element.scrollLeft+=step
        }
        scrollAmount+=step;
        if(scrollAmount>=distance){
            window.clearInterval(slideTimer)
        }
    },speed)
}