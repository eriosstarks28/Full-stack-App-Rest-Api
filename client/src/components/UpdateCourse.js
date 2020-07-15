import React, { Component } from "react";

export default class UpdateCourse extends Component {
  state = {
    title: "",
    description: "",
    materialsNeeded: "",
    estimatedTime: "",
    author: [],
    errors: [],
  };

  componentDidMount() {
    const { context } = this.props;
    const { id } = this.props.match.params;

    
    context.data.getCourse(id)
        .then((course) => {
          if (course) {
            this.setState({
              title: course.title,
              author: course.user,
              description: course.description,
              estimatedTime: course.estimatedTime,
              materialsNeeded: course.materialsNeeded,
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
      title,
      description,
      estimatedTime,
      materialsNeeded,
      errors
    } = this.state;

    return (
      <div className="bounds course--detail">
        <h1>Update Course</h1>
        <div>
          {errors.length ? 
            <React.Fragment>
              <h2 className="validation--errors--label">Validation errors</h2>
              <div className="validation-errors">
                <ul>
                  {errors.map((err, index) =>
                    <li key={index}>{err}</li>
                  )}
                </ul> 
              </div>
            </React.Fragment>
            : 
            <hr />
          }
          <form onSubmit={this.submit}>
            <div className="grid-66">
              <div className="course--header">
                <h4 className="course--label">Course</h4>
                <div>
                  <input onChange={this.change} id="title" name="title" type="text" className="input-title course--title--input" placeholder="Course title..." value={title} />
                </div>
              </div>

              <div className="course--description">
                <h4 className="course--label">Description</h4>
                <div>
                  <textarea onChange={this.change} id="description" name="description" className="" placeholder="Course description..." value={description}></textarea>
                </div>
              </div>
            </div>
            
            <div className="grid-25 grid-right">
              <div className="course--stats">
                <ul className="course--stats--list">
                  <li className="course--stats--list--item">
                    <h4>Estimated Time</h4>
                    <div>
                      <input onChange={this.change} id="estimatedTime" name="estimatedTime" type="text" className="course--time--input" placeholder="Hours" value={estimatedTime} />
                    </div>
                  </li>
                  
                  <li className="course--stats--list--item">
                    <h4>Materials Needed</h4>
                    <div><textarea onChange={this.change} id="materialsNeeded" name="materialsNeeded" className="" placeholder="Please list each material..." value={materialsNeeded}></textarea></div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="grid-100 pad-bottom">
              <button className="button" type="submit">Update Course</button>
              <button className="button button-secondary" onClick={this.cancel}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }




  submit = (event) => {
    event.preventDefault();
    const { context } = this.props;
    const { emailAddress } = context.authenticatedUser;
    const { password } = context.authenticatedUser;
    const { id } = this.props.match.params;


    const {
      title,
      description,
      estimatedTime,
      materialsNeeded,
    } = this.state;

   
    const course = {
      title,
      description,
      estimatedTime,
      materialsNeeded,
    }

//updates course passing course, email and password perams 

    context.data.updateCourse(id, course, emailAddress, password)
    .then(errors => {
      if (errors.errors) {
        this.setState({ errors: errors.errors});
      } else {
        this.props.history.push('/');
      }
    })
    .catch( err => { 
      console.log(err);
      this.props.history.push('/error');
    })
  }

  
  change = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState(() => {
      return {
        [name]: value
      };
    });
  }

  cancel = () => {
   const  courseId = this.props.match.params.id;
    const { from } = this.props.location.state || {
      from: { pathname: `/courses/${courseId}` },
    };
    this.props.history.push(from);
  };
}


