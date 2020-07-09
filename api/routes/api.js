const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const Course = require("../models").Course;
const User = require("../models").User;


function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}



const authenticateUser = async (req, res, next) => {
  let message = null;
  const users = await User.findAll();
  const credentials = auth(req);

  if (credentials) {
    const userData = users.find((u) => u.emailAddress === credentials.name);
    console.log(userData);

    if (userData) {
      const user = userData.dataValues;
      const authenticated = bcryptjs.compare(credentials.pass, user.password);

      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failed for user: ${user.emailAddress}`;
      }
    } else {
      message = `User not found with email address: ${credentials.name}`;
    }
  } else {
    message = `Authorization header not found.`;
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ errors: [message] });
  } else {
    next();
  }
};



router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
  const user = await User.findByPk(req.currentUser.id, {
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  });

  res.status(200).json(user);
}));


router.post('/users', asyncHandler(async (req, res, next) => {

  try {
    const newUser = await req.body;
    let existingUser;

    if (newUser.emailAddress) {
      existingUser = await User.findOne({
        where: {
          emailAddress: newUser.emailAddress
        }
      });
    }
    
    if (!existingUser) {
     
      if (newUser.password) {
        newUser.password = bcryptjs.hashSync(newUser.password);
      }

    
      await User.create({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailAddress: newUser.emailAddress,
        password: newUser.password
      });
    
    
      res.status(201).location('/').end();

    } else {
      res.status(405).json({ 
        message: `Something Went Wrong`,
        errors: [`The email address ${newUser.emailAddress} already exists.`]
     });
    }

  } catch (err) {
    next(err);
  }
}));



router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    // construct the query
    const query = {
      order: [["title", "ASC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    };

    // get the courses
    const courses = await Course.findAll(query);

    if (courses) {
      
      res.status(200).json(courses);
    } else {
      
      res
        .status(200)
        .json({ message: "The course database is currently empty" });
    }
  })
);

router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    let course;

    try {
      course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: req.currentUser.id,
      });
      res
        .status(201)
        .location("/courses/" + course.id)
        .end();
    } catch (err) {
      next(err);
    }
  })
);



router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    
    const query = {
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    };

    // try to retrieve the course
    const course = await Course.findOne(query);
    if (course) {
      // return the course, less the time stamps
      res.json(course);
    } else {
      // no match

      res.status(404).json({ error: "no course matches the provided ID" });
    }
  })
);



  router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);
  
    const errors = [];
  
    if (course.userId === req.currentUser.id) {
      if (!req.body.title) {
        errors.push('Please provide a title.');
      }
  
      if (!req.body.description) {
        errors.push('Please provide a description.');
      }
  
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Something went wrong.',
          errors: errors
        });
      } else {
        try {
          await Course.update(req.body, {where: {id: req.params.id}});
          res.status(204).end();
        } catch (err) {
          next(err);
        }
      }
    } else {
      res.status(403).json({
        message: "Something went wrong.",
        errors: ['You are not authorized to edit this course.']
      });
    }
  }));



router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course.userId === req.currentUser.id) {
    await Course.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(200).end();
  } else {
    res.status(403).json({
      message: 'Something went wrong', 
      errors: ['You are not authorized to delete this course.']
    });
  }
}));

module.exports = router;
