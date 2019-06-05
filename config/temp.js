// module.exports = (Users, Admin) => {
// 	// Serialise the user details
// 	serializeUser((user, done) => {
// 		if (user.constructor === Array) done(null, user[0]._id);
// 		else done(null, user.id);
// 	});
// 	// Deserialise the user details
// 	deserializeUser((id, done) => {
// 		Admin.findById(id, (err, user) => {
// 			if (user === null) {
// 				Users.findById(id, (err, user) => {
// 					done(err, user);
// 				});
// 			} else done(err, user);
// 		});
// 	});

// 	/************************************************************
// 		START OF LOCAL STRATERGIES FOR USER LOGIN AND USER SIGNUP
// 		AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
// 	************************************************************/

// 	// Stratergy for user login ::::::::::::::: LOCAL STRATERGY
// 	use(
// 		'local-user-login',
// 		new localStratergy(
// 			{
// 				usernameField: 'a_email',
// 				passwordField: 'a_password',
// 				passReqToCallback: true
// 			},
// 			(req, username, password, done) => {
// 				process.nextTick(() => {
// 					// Find the user details from the mongo database and validate the username and password
// 					Users.findOne({ 'local.email': username }, (err, user) => {
// 						// Throw the error if the user details are not in the database
// 						if (err) throw err;
// 						// If the user object is null send the flash message to the template
// 						if (!user) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'invalid-username',
// 									`Username is invalid ::::: ${username}`
// 								)
// 							);
// 						}
// 						// Validate the password if not the one matched then send the flash message to the template
// 						if (!user.validatePassword(password)) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'invalid-password',
// 									`Password is invalid ::::: ${password}`
// 								)
// 							);
// 						}
// 						// If the form field are validated then return the user object to the caller
// 						return done(null, user);
// 					});
// 				});
// 			}
// 		)
// 	);

// 	// Stratergy for admin login ::::::::::::::: LOCAL STRATERGY
// 	use(
// 		'local-admin-login',
// 		new localStratergy(
// 			{
// 				usernameField: 'a_email',
// 				passwordField: 'a_password',
// 				passReqToCallback: true
// 			},
// 			(req, username, password, done) => {
// 				process.nextTick(() => {
// 					// Find the admin details from the mongo database and validate the username and password
// 					Admin.findOne({ 'local.email': username }, (err, admin) => {
// 						if (err) throw err;

// 						if (!admin) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'invalid-admin.id',
// 									`Username is invalid ::::: ${username}`
// 								)
// 							);
// 						}

// 						if (!Admin.validatePassword(password)) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'invalid-password',
// 									`Password is invalid ::::: ${password}`
// 								)
// 							);
// 						}

// 						return done(null, admin);
// 					});
// 				});
// 			}
// 		)
// 	);

// 	// Stratergy for user Signup ::::::::::::::: LOCAL STRATERGY
// 	use(
// 		'local-user-signup',
// 		new localStratergy(
// 			{
// 				usernameField: 'a_email',
// 				passwordField: 'a_password',
// 				passReqToCallback: true
// 			},
// 			(req, username, password, done) => {
// 				process.nextTick(() => {
// 					Users.findOne({ 'local.email': username }, (err, user) => {
// 						if (err) throw err;

// 						if (user) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'user-exist',
// 									`The Username already exist ::::: ${username}`
// 								)
// 							);
// 						} else {
// 							// Create the user object and store the value of the fields into it
// 							let user = new Users();

// 							user.local.email = username;
// 							user.local.password = password;
// 							user.local.subscribed =
// 								req.body.a_subscribed || false;

// 							// Check for the valid email address and password provided by the user
// 							req.checkBody(
// 								`user-email', 'Provide valid email id ::::: ${username}`
// 							).isEmail();
// 							req.checkBody(
// 								'user-password',
// 								`Password length should be minimum 8 ::::: ${password}`
// 							).isLength({ min: 8 });
// 							// Throw error if there is some validation error
// 							if (req.validationError()) {
// 								return done(
// 									null,
// 									false,
// 									req.flash(
// 										'validation-error',
// 										`Provide valid Username and Password`
// 									)
// 								);
// 							}

// 							// Store the user details into the database by encrypting the password
// 							user.save((err, user) => {
// 								if (err) throw err;

// 								return user
// 									? done(
// 											null,
// 											user,
// 											req.flash(
// 												'user-signup-success',
// 												`User has registered successfully with username ::::: ${username}`
// 											)
// 									  )
// 									: done(
// 											null,
// 											false,
// 											req.flash(
// 												'admin-signup-unsuccess',
// 												`Registration was unsuccessful with Username ::::: ${username}`
// 											)
// 									  );
// 							});
// 						}
// 					});
// 				});
// 			}
// 		)
// 	);

// 	// Stratergy for admin Signup ::::::::::::::: LOCAL STRATERGY
// 	use(
// 		'local-admin-signup',
// 		new localStratergy(
// 			{
// 				usernameField: 'a_email',
// 				passwordField: 'a_password',
// 				passReqToCallback: true
// 			},
// 			(req, username, password, done) => {
// 				process.nextTick(() => {
// 					Admin.findOne({ 'local.email': username }, (err, admin) => {
// 						if (err) throw err;

// 						if (admin) {
// 							return done(
// 								null,
// 								false,
// 								req.flash(
// 									'admin-exist-error',
// 									`The Admin already exist with the Admin ID ::::: ${username}`
// 								)
// 							);
// 						} else {
// 							// Create the user object and store the value of the fields into it
// 							let admin = new Admin();

// 							admin.local.admin_id = username;
// 							admin.local.password = password;

// 							// Check for the valid email address and password provided by the admin
// 							req.checkBody(
// 								'admin-id',
// 								`Provide the valid admin id for the field ::::: ${username}`
// 							).isNumber();
// 							req.checkBody(
// 								'admin-password',
// 								`Provide the valid password with minimum length 8 ::::: ${password}`
// 							).isLength({ min: 8 });

// 							if (req.validationError()) {
// 								return done(
// 									null,
// 									false,
// 									req.flash(
// 										'validation-error',
// 										`Provide valid username and password`
// 									)
// 								);
// 							}

// 							// Store the admin details into the database by encrypting the password
// 							admin.save((err, admin) => {
// 								if (err) throw err;

// 								return admin
// 									? done(
// 											null,
// 											admin,
// 											req.flash(
// 												'admin-signup-success',
// 												`Admin has registered successfully with Admin-ID ${username}`
// 											)
// 									  )
// 									: done(
// 											null,
// 											false,
// 											req.flash(
// 												'admin-signup-unsuccess',
// 												`Registration was unsuccessfull with Admin-ID: ${username}`
// 											)
// 									  );
// 							});
// 						}
// 					});
// 				});
// 			}
// 		)
// 	);

/**************************************************************************
		END OF LOCAL STRATERGIES IMPLEMENTATION FOR USER LOGIN AND USER SIGNUP 
		AS WELL AS ADMIN LOGIN AND ADMIN SIGNUP
	**************************************************************************/

//};
