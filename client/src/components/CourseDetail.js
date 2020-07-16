import React, { Component } from "react";
import { Link } from "react-router-dom";
const Markdown = require("react-markdown");

export default class CourseDetail extends Component {
  state = {
    course: [],
    user: [],
  };

  componentDidMount() {
    const { context } = this.props;
    const { id } = this.props.match.params;

    //Grab each course using async function getCourse() and set the state
    
    context.data.getCourse(id).then((res) => {
      this.setState({
        course: res,
        user: res.user,
        materials: res.materialsNeeded,
        authenticatedUser: context.authenticatedUser,
      });
    });
  }

  //Delete function only avaliable to authorized users removes course from database 
  delete = () => {
    if (this.props.context.authenticatedUser) {
      const { password, emailAddress } = this.props.context.authenticatedUser;
      let courseId = this.props.match.params.id;
      this.props.context.data
        .deleteCourse(courseId, emailAddress, password)
        .then((errors) => {
          if (errors.length) {
            this.setState({ errors });
          } else this.props.history.push("/");
        });
    } else {
      this.props.history.push("/forbidden");
    }
  };

  render() {
    const { course, user, authenticatedUser } = this.state;

    return (
      <div>
        <div className="actions--bar">
          <div className="bounds">
            <div className="grid-100">
              <span>
                {authenticatedUser ? (
                  authenticatedUser.emailAddress === user.emailAddress ? (
                    <React.Fragment>
                      <Link
                        className="button"
                        to={`/courses/${course.id}/update`}
                      >
                        Update Course
                      </Link>
                      <button className="button" onClick={() => this.delete()}>
                        Delete Course
                      </button>
                    </React.Fragment>
                  ) : (
                    <hr />
                  )
                ) : (
                  <hr />
                )}
              </span>
              <Link className="button button-secondary" to="/">
                Return to List
              </Link>
            </div>
          </div>
        </div>
        <div className="bounds course--detail">
          <div className="grid-66">
            <div className="course--header">
              <h4 className="course--label">Course</h4>
              <h3 className="course--title">{course.title}</h3>
              <p>
                {" "}
                By {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="course--description">
              <p>{course.description}</p>
            </div>
          </div>
          <div className="grid-25 grid-right">
            <div className="course--stats">
              <ul className="course--stats--list">
                <li className="course--stats--list--item">
                  <h4>Estimated Time</h4>
                  <h3>{course.estimatedTime}</h3>
                </li>
                <li className="course--stats--list--item">
                  <h4>Materials Needed</h4>
                  <ul>
                    <Markdown source={course.materialsNeeded} />
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
