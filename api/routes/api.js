const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const Course = require("../models").Course;
const User = require("../models").User;



//User validation

const userValidation = [
  check("firstName")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check("lastName")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check("emailAddress")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"')
    .isEmail()
    .withMessage('Please provide a valid email address for "emailAddress"'),
  check("password")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"')
    .isLength({ min: 8, max: 20 })
    .withMessage(
      'Please provide a value for "password" that is between 8 and 20 characters in length'
    ),
];

//course validation

const courseValidation = [
  check("title")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check("description")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
];

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
//handle validation errors



function validationErrors(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    res.status(400).json({ errors: errorMessages });

    return true;
  } else {
    return false;
  }
}

//Basic user authentication

const authenticateUser = async (req, res, next) => {
  let message = null;
  
  const credentials = auth(req);
  console.log(credentials);

  if (credentials) {
  
    const users = await User.findAll();
    const user= users.find((u) => u.emailAddress === credentials.name);
    console.log(user);

    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      if (authenticated) {
        console.log(`Authentication successful for ${user.emailAddress}`);
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
    res.status(401).json({ messgae: "Access Denied" });
  } else {
    next();
  }
};

//Get current user


router.get("/users", authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName:user.lastName,
    emailAddress: user.emailAddress,
    password: user.password,
  });
});

//Create & validate new user

router.post(
  "/users",
  
  userValidation,
  asyncHandler(async (req, res) => {
    try {
      const newUser = await req.body;
      let existingUser;

      if (newUser.emailAddress) {
        existingUser = await User.findOne({
          where: {
            emailAddress: newUser.emailAddress,
          },
        });
      }

      if (!existingUser) {
        // Hash the new user's password using bcryptjs
        if (newUser.password) {
          newUser.password = bcryptjs.hashSync(newUser.password);
        }

        // Add new user with hashed password to database
        await User.create({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          emailAddress: newUser.emailAddress,
          password: newUser.password,
        });

        //Set response status to 201 and end response
        res.status(201).location("/").end();
      } else {
        res.status(405).json({
          message: `Something Went Wrong`,
          errors: [`The email address ${newUser.emailAddress} already exists.`],
        });
      }
    } catch (err) {
      next(err);
    }
  })
);

//Get list of courses

router.get(
  "/courses",
  asyncHandler(async (req, res) => {
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

//Create authenticate & validate new course

router.post(
  "/courses",
  authenticateUser,
  courseValidation,
  asyncHandler(async (req, res) => {
    if (!validationErrors(req, res)) {
      try {
        const course = req.body;

        course.userId = req.currentUser.id;

        newCourse = await Course.create(course);
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          res.status(400).json({ error: error.msg });
        } else {
          res.status(500).json({ error: error.msg });
        }
      }

      res.header("Location", "api/courses/" + newCourse.id);

      return res.status(201).end();
    }
  })
);

//Get a course based on its ID

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

    const course = await Course.findOne(query);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: "no course matches the provided ID" });
    }
  })
);

//Edit existing course

router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);

    const errors = [];

    if (course.userId === req.currentUser.id) {
      if (!req.body.title) {
        errors.push("Please provide a title.");
      }

      if (!req.body.description) {
        errors.push("Please provide a description.");
      }

      if (errors.length > 0) {
        res.status(400).json({
          message: "Something went wrong.",
          errors: errors,
        });
      } else {
        try {
          await Course.update(req.body, { where: { id: req.params.id } });
          res.status(204).end();
        } catch (err) {
          next(err);
        }
      }
    } else {
      res.status(403).json({
        message: "Something went wrong.",
        errors: ["You are not authorized to edit this course."],
      });
    }
  })
);

//Delete a course

router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      let course = await Course.findByPk(parseInt(req.params.id));

      if (!course) {
        res
          .status(404)
          .json({ error: "there is no existing course with that ID" });
      }

      if (course.userId != req.currentUser.id) {
        res
          .status(403)
          .json({ error: "authorized user does not own this course" });
      }

      await Course.destroy({ where: { id: parseInt(req.params.id) } });
    } catch (error) {
      res.status(500).json({ error: error.msg });
    }

    return res.status(204).end();
  })
);

module.exports = router;
