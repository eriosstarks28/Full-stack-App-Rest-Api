import Config from "./components/Config";

export default class Data {
  api(
    path,
    method = "GET",
    body = null,
    requiresAuth = false,
    credentials = null
  ) {
    const url = Config.apiBaseUrl + path;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    if (requiresAuth) {
      const encodedCredentials = btoa(
        `${credentials.emailAddress}:${credentials.password}`
      );
      options.headers["Authorization"] = `Basic ${encodedCredentials}`;
    }
    return fetch(url, options);
  }

  // Create a new user & catch any errors from the server

  async createUser(user) {
    const response = await this.api("/users", "POST", user);
    if (response.status === 201) {
      return [];
    } else if (
      response.status === 400 ||
      response.status === 405 ||
      response.status === 500
    ) {
      return response.json().then((data) => {
        return data.errors;
      });
    } else {
      throw new Error();
    }
  }

/////////////////////////////////////////////////////////////////////////////


  async getUser(emailAddress, password) {
    const response = await this.api(`/users`, "GET", null, true, {
      emailAddress,
      password,
    });
    if (response.status === 200) {
      return response.json().then((data) => data);
    } else if (response.status === 401) {
      return null;
    } else {
      throw new Error();
    }
  }

  // create a new course/////////////////////////////////////////////////////

  async createCourse(course, emailAddress, password) {
    const response = await this.api(`/courses`, "POST", course, true, {
      emailAddress,
      password,
    });
    if (response.status === 201) {
      return null;
    } else if (response.status === 400) {
      return response.json().then((data) => {
        return data;
      });
    } else {
      throw new Error();
    }
  }

  //get full list of courses////////////////////////////////////////////////////




  async getCourses() {
    const response = await this.api(`/courses`, "GET", null, false, null);
    if (response.status === 200 || 304) {
      return response.json().then((data) => data);
    } else if (response.status === 404) {
      console.log(response);
      return null;
    } else {
      throw new Error();
    }
  }



//get specific course by id/////////////////////////////////////////////////////



  async getCourse(id) {
    const response = await this.api(`/courses/${id}`, "GET", null, false, null);
    if (response.status === 200 || 304) {
      return response.json().then((data) => data);
    } else if (response.status === 404) {
      console.log(response.status);
      console.log(response.statusText);
      return null;
    } else {
      throw new Error();
    }
  }
  //updaate a course if authorized////////////////////////////////////////////////




  async updateCourse(id, course, emailAddress, password) {
    const response = await this.api(`/courses/${id}`, "PUT", course, true, {
      emailAddress,
      password,
    });
    if (response.status === 204) {
      return [];
    } else if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    ) {
      return response.json().then((data) => {
        return data;
      });
    } else {
      throw new Error();
    }
  }


  /////////////////////////////////////////////////////////////////////////////////


  
  async deleteCourse(courseId, emailAddress, password) {
    const response = await this.api(
      `/courses/${courseId}`,
      "DELETE",
      null,
      true,
      { emailAddress, password }
    );
    if (response.status === 200 || 304) {
      return [];
    } else if (response.status === 403) {
      return response.json().then((data) => {
        return data.errors;
      });
    } else {
      throw new Error();
    }
  }
}
