import React, { Component } from "react";

import Form from "./Form";

export default class UpdateCourse extends Component {
  state = {
    author: [],
    courseId: "",
    title: "",
    description: "",
    estimatedTime: "",
    materialsNeeded: "",
    userId: "",
    errors: [],
  };

  componentDidMount() {
    const { context } = this.props;

    context.data
      .getCourse(this.props.match.params.id)
      .then((course) => {
        if (course) {
          this.setState({
            courseId: course.id,
            author: course.user,
            title: course.title,
            description: course.description,
            estimatedTime: course.estimatedTime,
            materialsNeeded: course.materialsNeeded,
            userId: course.userId,
          });
        }
      })
      .catch((err) => {
       
        console.log(err);
        this.props.history.push("/error");
      });
  }

  render() {
    const {
      author,
      title,
      description,
      estimatedTime,
      materialsNeeded,
      errors,
    } = this.state;

    return (
      <div className="bounds course--detail">
        <h1>Update Course</h1>
        <div>
          <Form
            cancel={this.cancel}
            errors={errors}
            submit={this.submit}
            submitButtonText="Update Course"
            elements={() => (
              <React.Fragment>
                <div className="grid-66">
                  <div className="course--header">
                    <h4 className="course--label">Course</h4>
                    <div>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={title}
                        onChange={this.change}
                        className="input-title course--title--input"
                        placeholder="Course title..."
                      />
                    </div>
                    <p>By {author.firstName + " " + author.lastName}</p>
                  </div>
                  <div className="course--description">
                    <div>
                      <textarea
                        id="description"
                        name="description"
                        type="text"
                        value={description}
                        onChange={this.change}
                        placeholder="Course description..."
                      />
                    </div>
                  </div>
                </div>
                <div className="grid-25 grid-right">
                  <div className="course--stats">
                    <ul className="course--stats--list">
                      <li className="course--stats--list--item">
                        <h4>Estimated Time</h4>
                        <div>
                          <input
                            id="estimatedTime"
                            name="estimatedTime"
                            type="text"
                            className="course--time--input"
                            value={estimatedTime}
                            onChange={this.change}
                            placeholder="Hours"
                          />
                        </div>
                      </li>
                      <li className="course--stats--list--item">
                        <h4>Materials Needed</h4>
                        <div>
                          <textarea
                            id="materialsNeeded"
                            name="materialsNeeded"
                            type="text"
                            value={materialsNeeded}
                            onChange={this.change}
                            placeholder="Materials"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </React.Fragment>
            )}
          />
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

  
  submit = () => {
    const { context } = this.props;

    const {
      courseId,
      title,
      description,
      estimatedTime,
      materialsNeeded,
      userId,
      errors,
    } = this.state;

    const authUser = context.authenticatedUser;

    const emailAddress = authUser.emailAddress;
    const password = authUser.password;

    const course = {
      courseId,
      title,
      description,
      estimatedTime,
      materialsNeeded,
      userId,
      errors,
    };

    context.data
      .updateCourse(courseId, course, emailAddress, password) //update course using updateCourse from Data.js
      .then((errors) => {
        if (errors.length) {
          this.setState({ errors });
        } else {
          console.log("Course updated");
          this.props.history.push("/courses/" + courseId);
        }
      })
      .catch((err) => {
        console.log(err);
        this.props.history.push("/error");
      });
  };
  
  cancel = () => {
    const courseId = this.props.match.params.id;
    const { from } = this.props.location.state || {
      from: { pathname: `/courses/${courseId}` },
    };
    this.props.history.push(from);
  };
}