/* eslint-disable no-underscore-dangle */
/* eslint-disable quotes */
const db = require("better-sqlite3")("src/core/database/gun.db");

module.exports = {
  name: "bullets",
  aliases: [],
  description:
    "Check the bullet inventory of a user",

  // Whether the command requires arguments
  reqArgs: true,
  // Arguments usage
  usage: "{ @user }",
  // Example usage of the command
  exampleUsage: "!bullets @Derek",

  category: "'The Gun' Commands",

  // Command cooldown in milliseconds
  cooldown: 300,

  // eslint-disable-next-line no-unused-vars
  async run(ctx) {
    const toCheck = await ctx.message.mentions.members.first();
    try {
      const row = await db
        .prepare(
          `SELECT bullets FROM bullets where userId = ?`,
        )
        .get(toCheck._userID);
      await ctx.sendText(
        `${toCheck.nickname || toCheck.displayName} has ${row.bullets || 0} bullet${(row.bullets || 0) < 1 ? 's' : ''}`,
      );
    } catch (ex) {
      await console.log(ex);
    }
  },
};
