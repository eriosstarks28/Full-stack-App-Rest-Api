import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class UserSignIn extends Component {
  state = {
    emailAddress: "",
    password: "",
    errors: [],
  };

  render() {
    const { emailAddress, password, errors } = this.state;

    return (
      <div className="bounds">
        <div className="grid-33 centered signin">
          <h1>Sign in</h1>
          <div>
            {errors.length ? (
              <React.Fragment>
                <h2 className="validation--errors--label">Validation errors</h2>
                <div className="validation-errors">
                  <ul>
                    {errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              </React.Fragment>
            ) : (
              <hr />
            )}
            <form onSubmit={this.submit}>
              <input
                onChange={this.change}
                id="emailAddress"
                name="emailAddress"
                type="text"
                className=""
                placeholder="Email Address"
                value={emailAddress}
              />
              <input
                onChange={this.change}
                id="password"
                name="password"
                type="password"
                className=""
                placeholder="Password"
                value={password}
              />
              <div className="grid-100 pad-bottom">
                <button className="button" type="submit">
                  Sign in
                </button>
                <button
                  className="button button-secondary"
                  onClick={this.cancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <p>&nbsp;</p>
          <p>
            Dont have a user account? <Link to="/signUp">Click here</Link> to
            sign in!
          </p>
        </div>
      </div>
    );
  }

  change = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState(() => {
      return {
        [name]: value,
      };
    });
  };

  submit = (event) => {
    event.preventDefault()
    const { context } = this.props;
    const { from } = this.props.location.state || {
      from: { pathname: "/" },
    };
    const { emailAddress, password } = this.state;

    context.actions
      .signIn(emailAddress, password)
      .then((user) => {
        if (user === null) {
          this.setState(() => {
            return { errors: ["Sign-in was unsuccessful"] };
          });
        } else {
          this.props.history.push(from);
        }
      })
      .catch((error) => {
        console.error(error);
        this.props.history.push("/error");
      });
  };

  cancel = (event) => {
    event.preventDefault();
    this.props.history.push("/");
  };
}
