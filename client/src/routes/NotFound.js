import React from 'react';
import {Link} from 'react-router-dom';
import '../styles/NotFound.css';

////404 page of our website

const NotFound = () => {
    return ( 
        <>
        <div className="not-found">
            <h2>Oops! Page not found.</h2>
            <div >
                <img src="https://www.maketecheasier.com/assets/uploads/2015/12/Creative-404-mte-01-Jonathan-Patterson.jpg" alt="404" />
            </div>
            <h4>We can't find the page you are looking for.</h4>
            <Link to="/"><button className='main-btn'>Back to Homepage...</button></Link>
        </div>
        </>
     );
}
 
export default NotFound;
