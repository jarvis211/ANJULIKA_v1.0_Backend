'strict';

// import * as env from 'dotenv';
const env = require('dotenv');
env.config();

// export const secret = `${process.env.JWT_SECRET}`;
// export const envConfig = {
//     secret: `${process.env.JWT_SECRET}`
// };

exports = {
    secret: `${process.env.JWT_SECRET}`,
    googleOAuth20ClientID: `${process.env.GOOGLE_OAUTH20_CLIENTID}`,
    googleOAuth20Secret: `${process.env.GOOGLE_OAUTH20_CLIENTSECRET}`,
    facebookOAuth20ClientID: `${process.env.FACEBOOK_OAUTH20_CLIENTID}`,
    facebookOAuth20Secret: `${process.env.FACEBOOK_OAUTH20_CLIENTSECRET}`
};
