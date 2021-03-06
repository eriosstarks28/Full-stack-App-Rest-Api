import React from 'react';
import { Link } from 'react-router-dom';

export default function Header(props) {
    const { context } = props;
    const authUser = context.authenticatedUser;
    return (
      <div className="header">
        <div className="bounds">
          <h1 className="header--logo">My FullStack API </h1>
          
          <nav>
            {authUser ? (
              <React.Fragment>
                <span>Welcome, {authUser.firstName}!</span>
                <Link className="Button" to="/">Home</Link>

                <Link to="/signout">Sign Out</Link>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link className="Button" to="/">Home</Link>
                <Link className="signup" to="/signup">Sign Up</Link>
                <Link className="signin" to="/signin">Sign In</Link>
              </React.Fragment>
            )}
          </nav>
        </div>
      </div>
    );
  }

