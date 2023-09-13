import React from 'react';
import './Error.style.css'
import { Link as RouterLink } from 'react-router-dom';

const Error: React.FC = () => {
    return (
        <section className="page_404">
            <h1 style={{justifyContent: "center", marginTop: "100px"}}><span className="profile-p">ERROR 404</span></h1>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12 ">
                        <div className="col-sm-10 col-sm-offset-1  text-center">
                            <div className="four_zero_four_bg">
                                {/* <h1 className="text-center ">404</h1> */}
                            </div>
                            <div className="contant_box_404">
                                <h3 className="h2">
                                    Look like you're lost
                                </h3>
                                <p style={{fontSize: '20px'}}>the page you are looking for not avaible!</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{marginTop: '15%', alignContent: 'center', marginLeft: '30%'}}>
                <a href="" className="button-32">Go to Home</a>
                </div>
            </div>
        </section>
    );
}

export default Error;