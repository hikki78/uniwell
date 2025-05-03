const { NextAuthHandler } = require("next-auth/netlify");
const { authOptions } = require("../../lib/auth");

exports.handler = NextAuthHandler({
  ...authOptions
}); 