import 'dotenv/config';
require('dotenv').config();

class Env {
    static PORT = process.env.PORT || 3000;
    static JWT_SECRET = process.env.JWT_SECRET;
}

export default Env;