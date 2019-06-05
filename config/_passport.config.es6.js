'strict';
const envConfig = require('./_env.config');

// Create a class CreateUserObject to instantiate the user object
class CreateUserObject {
    // constructor to initialize the variables
    constructor(email, password, subscribed, provider) {
        this.email = email;
        this.password = password;
        this.subscribed = subscribed;
        this.provider = provider;
    }
    // Add the required methods into the prototype chain of the CreateUserObject
    create() {
        // Validate the provider(local, google, facebook ...) and return the JSON object
        return {
            local: {
                email: this.email,
                password: this.password,
                subscribed: this.subscribed
            }
        };
    }
}

// Method to serialise and deserialise user details
function serializeAndDeserializeUser(Users, _passport) {
    // Serialise the user details
    _passport.serializeUser((user, done) => {
        if (user.constructor === Array) done(null, user[0]._id);
        else done(null, user.id);
    });
    // Deserialise the user details
    _passport.deserializeUser((id, done) => {
        Users.findById(id, (err, user) => {
            if (user === null) {
                Users.findById(id, (err, user) => {
                    done(err, user);
                });
            } else done(err, user);
        });
    });
}

// Method to check that the user object exist in the request object for authentication
function isLoggedIn(req, res, next) {
    // Check for user authentication
    if (req.isAuthenticated()) return next();

    // If user is not authenticated then redirect the user to the login page
    res.redirect();
}

/*************************************************************
	START OF LOCAL STRATERGIES FOR USER LOGIN AND USER SIGNUP
	AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
*************************************************************/

export function localStratergies(Users, Admin, _passport, localStratergy, jwt) {
    // Serialize and Deserialize user details
    serializeAndDeserializeUser(Users, _passport);
    // Stratergy for user login ::::::::::::::: LOCAL STRATERGY
    _passport.use(
        'local-user-login',
        new localStratergy(
            {
                usernameField: 'a_email',
                passwordField: 'a_password',
                passReqToCallback: true
            },
            (req, username, password, done) => {
                process.nextTick(() => {
                    let fetchedToken = req.session.passport.token;
                    // check for the jwt token provided by the browser and validated for authorisation
                    if (fetchedToken) {
                        jwt.verify(
                            fetchedToken,
                            envConfig.secret,
                            (err, decodedToken) => {
                                if (err) throw err;

                                // decodedToken['local']['username'] === username
                                // 	? // jwt token is verified and user object exist in the session so can be redirected to the dashboard
                                // 	  res.redirect()
                                // 	: // jwt token is not valid and user should be redirected to the login page
                                // 	  res.redirect();
                            }
                        );
                    }
                    // Find the user details from the mongo database and validate the username and password
                    Users.findOne({ 'local.email': username }, (err, user) => {
                        // Throw the error if the user details are not in the database
                        if (err) throw err;
                        // If the user object is null send the flash message to the template
                        if (!user) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `invalid-username`,
                                    `Username is invalid ::::: ${username}`
                                )
                            );
                        }
                        // Validate the password if not the one matched then send the flash message to the template
                        if (!user.validatePassword(password)) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `invalid-password`,
                                    `Password is invalid ::::: ${password}`
                                )
                            );
                        }
                        // If the form field are validated then return the user object to the caller
                        return done(null, user);
                    });
                });
            }
        )
    );
    // Stratergy for admin login ::::::::::::::: LOCAL STRATERGY
    _passport.use(
        'local-admin-login',
        new localStratergy(
            {
                usernameField: 'a_email',
                passwordField: 'a_password',
                passReqToCallback: true
            },
            (req, username, password, done) => {
                process.nextTick(() => {
                    let fetchedToken = req.session.passport.token;
                    // check for the jwt token provided by the browser and validated for authorisation
                    if (fetchedToken) {
                        jwt.verify(
                            fetchedToken,
                            envConfig.secret,
                            (err, decodedToken) => {
                                if (err) throw err;

                                // decodedToken['local']['username'] === username
                                // 	? // jwt token is verified and user object exist in the session so can be redirected to the dashboard
                                // 	  res.redirect()
                                // 	: // jwt token is not valid and user should be redirected to the login page
                                // 	  res.redirect();
                            }
                        );
                    }

                    // Find the admin details from the mongo database and validate the username and password
                    Admin.findOne({ 'local.email': username }, (err, admin) => {
                        if (err) throw err;
                        if (!admin) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `invalid-admin.id`,
                                    `Username is invalid ::::: ${username}`
                                )
                            );
                        }
                        if (!Admin.validatePassword(password)) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `invalid-password`,
                                    `Password is invalid ::::: ${password}`
                                )
                            );
                        }
                        return done(null, admin);
                    });
                });
            }
        )
    );
    // Stratergy for user Signup ::::::::::::::: LOCAL STRATERGY
    _passport.use(
        'local-user-signup',
        new localStratergy(
            {
                usernameField: 'a_email',
                passwordField: 'a_password',
                passReqToCallback: true
            },
            (req, username, password, done) => {
                process.nextTick(() => {
                    Users.findOne({ 'local.email': username }, (err, user) => {
                        if (err) throw err;

                        if (user) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `user-exist`,
                                    `The Username already exist ::::: ${username}`
                                )
                            );
                        } else {
                            // Create the user object and store the value of the fields into it
                            let user = new Users();
                            user.local.email = username;
                            user.local.password = password;
                            user.local.subscribed =
                                req.body.a_subscribed || false;
                            user.local.jwtToken = jwt.sign(
                                {
                                    local: {
                                        username: this.username,
                                        password: this.password
                                    }
                                },
                                envConfig.secret,
                                {
                                    expiresIn: '7d'
                                }
                            );

                            // Check for the valid email address and password provided by the user
                            req.checkBody(
                                `user-email`,
                                `Provide valid email id ::::: ${username}`
                            ).isEmail();
                            req.checkBody(
                                `user-password`,
                                `Password length should be minimum 8 ::::: ${password}`
                            ).isLength({ min: 8 });

                            // Throw error if there is some validation error
                            if (req.validationError()) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        `validation-error`,
                                        `Provide valid Username and Password`
                                    )
                                );
                            }

                            // Store the user details into the database by encrypting the password
                            user.save((err, user) => {
                                if (err) throw err;
                                return user
                                    ? done(
                                          null,
                                          user,
                                          req.flash(
                                              `user-signup-success`,
                                              `User has registered successfully with username ::::: ${username}`
                                          )
                                      )
                                    : done(
                                          null,
                                          false,
                                          req.flash(
                                              `admin-signup-unsuccess`,
                                              `Registration was unsuccessful with Username ::::: ${username}`
                                          )
                                      );
                            });
                        }
                    });
                });
            }
        )
    );
    // Stratergy for admin Signup ::::::::::::::: LOCAL STRATERGY
    _passport.use(
        'local-admin-signup',
        new localStratergy(
            {
                usernameField: 'a_email',
                passwordField: 'a_password',
                passReqToCallback: true
            },
            (req, username, password, done) => {
                process.nextTick(() => {
                    Admin.findOne({ 'local.email': username }, (err, admin) => {
                        if (err) throw err;

                        if (admin) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    `admin-exist-error`,
                                    `The Admin already exist with the Admin ID ::::: ${username}`
                                )
                            );
                        } else {
                            // Create the user object and store the value of the fields into it
                            let admin = new Admin();
                            admin.local.admin_id = username;
                            admin.local.password = password;
                            // Check for the valid email address and password provided by the admin
                            req.checkBody(
                                `admin-id`,
                                `Provide the valid admin id for the field ::::: ${username}`
                            ).isNumber();
                            req.checkBody(
                                `admin-password`,
                                `Provide the valid password with minimum length 8 ::::: ${password}`
                            ).isLength({ min: 8 });

                            if (req.validationError()) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        `validation-error`,
                                        `Provide valid username and password`
                                    )
                                );
                            }
                            // Store the admin details into the database by encrypting the password
                            admin.save((err, admin) => {
                                if (err) throw err;

                                return admin
                                    ? done(
                                          null,
                                          admin,
                                          req.flash(
                                              `admin-signup-success`,
                                              `Admin has registered successfully with Admin-ID ${username}`
                                          )
                                      )
                                    : done(
                                          null,
                                          false,
                                          req.flash(
                                              `admin-signup-unsuccess`,
                                              `Registration was unsuccessfull with Admin-ID: ${username}`
                                          )
                                      );
                            });
                        }
                    });
                });
            }
        )
    );
}

/**************************************************************************
    END OF LOCAL STRATERGIES IMPLEMENTATION FOR USER LOGIN AND USER SIGNUP
    AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
**************************************************************************/

/**************************************************************
    START OF GOOGLE STRATERGIES FOR USER LOGIN AND USER SIGNUP
    AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
**************************************************************/

export function googleOAuth20Stratergy(
    req,
    Users,
    _passport,
    googleOAuth20Stratergy,
    jwt
) {
    //	Serialize and deserialize user details
    serializeAndDeserializeUser(Users, _passport);

    // Stratergy for user login ::::::::::::::: GOOGLE OAUTH-2.0 STRATERGY
    _passport.use(
        'google-oauth20-login',
        new googleOAuth20Stratergy(
            {
                clientID: envConfig.googleOAuth20ClientID,
                clientSecret: envConfig.googleOAuth20Secret,
                callbackURL: 'http://localhost:8000/auth/google/callback'
            },
            (err, accessToken, refreshToken, profile, done) => {
                let user = new Users(
                    new CreateUserObject(
                        profile.username,
                        profile.password,
                        true // Replace with the acutal subscribed value fetched from the form
                    ).create()
                );

                // Add accessToken and refreshToken to the user schema to access it when needed
                [user.local.accessToken, user.local.refreshToken] = [
                    accessToken,
                    refreshToken
                ];

                if (err) throw err;

                process.nextTick(() => {
                    Users.findOne(
                        { 'google.email': `${profile.username}` },
                        (err, user) => {
                            // Throw the error if any
                            if (err) throw err;

                            if (user) {
                                // If user exist then create user session and redirect it to the home page
                            } else {
                                user.save((err, user) => {
                                    if (err) throw err;

                                    return user
                                        ? done(
                                              null,
                                              user,
                                              req.flash(
                                                  `google-oauth20-signup-success`,
                                                  `The user is successfully registered through google OAuth2.0 API with profile ::::: ${profile}`
                                              )
                                          )
                                        : done(
                                              null,
                                              false,
                                              req.flase(
                                                  `google-oauth20-signup-unsuccess`,
                                                  `Registration was unsuccessful through google OAuth2.0 API with profile ::::: ${profile}`
                                              )
                                          );
                                });
                            }
                        }
                    );
                });
            }
        )
    );

    // End of google OAuth2.0 Stratergy
}

/***************************************************************************
    END OF GOOGLE STRATERGIES IMPLEMENTATION FOR USER LOGIN AND USER SIGNUP
    AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
***************************************************************************/

/****************************************************************
    START OF FACEBOOK STRATERGIES FOR USER LOGIN AND USER SIGNUP
    AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
****************************************************************/

export function facebookOAuth20Stratergy(
    req,
    Users,
    _passport,
    facebookOAuth20Stratergy,
    jwt
) {
    //	Serialize and deserialize user details
    serializeAndDeserializeUser(Users, _passport);

    // Stratergy for user login ::::::::::::::: FACEBOOK OAUTH-2.0 STRATERGY
    _passport.use(
        'facebook-oauth20-login',
        new facebookOAuth20Stratergy(
            {
                // Add clientId, Access key etc
                clientID: envConfig.facebookOAuth20ClientID,
                clientSecret: envConfig.facebookOAuth20Secret,
                callbackURL: 'http://localhost:8000/auth/google/callback'
            },
            (err, accessToken, refreshToken, profile, done) => {
                let user = new Users(
                    new CreateUserObject(
                        profile.username,
                        profile.password,
                        true // Replace with the acutal subscribed value fetched from the form
                    ).create()
                );

                // Add accessToken and refreshToken to the user schema to access it when needed
                [user.local.accessToken, user.local.refreshToken] = [
                    accessToken,
                    refreshToken
                ];

                if (err) throw err;

                process.nextTick(() => {
                    Users.findOne(
                        { 'facebook.email': `${profile.username}` },
                        (err, user) => {
                            if (err) throw err;

                            if (user) {
                                // If user exist then create user session and redirect it to the home page
                            } else {
                                user.save((err, user) => {
                                    if (err) throw err;

                                    return user
                                        ? done(
                                              null,
                                              user,
                                              req.flash(
                                                  `facebook-oauth20-signup-success`,
                                                  `The user is successfully registered through facebook OAuth2.0 API with profile ::::: ${profile}`
                                              )
                                          )
                                        : done(
                                              null,
                                              false,
                                              req.flash(
                                                  `facebook-oauth20-signup-unsuccess`,
                                                  `Registration was unsuccessful through facebook OAuth2.0 API with profile ::::: ${profile}`
                                              )
                                          );
                                });
                            }
                        }
                    );
                });
            }
        )
    );
}

/*****************************************************************************
    END OF FACEBOOK STRATERGIES IMPLEMENTATION FOR USER LOGIN AND USER SIGNUP
    AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
*****************************************************************************/
