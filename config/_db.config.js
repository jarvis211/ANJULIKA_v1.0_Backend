'strict';

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    anjulika_users_db_url: `mongodb://${
        process.env.ANJULIKA_USERS_DB_USERNAME
    }:${
        process.env.ANJULIKA_USERS_DB_PASSWORD
    }@ds153556.mlab.com:53556/anjulika-users-database`
};
