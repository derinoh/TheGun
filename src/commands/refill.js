/* eslint-disable no-underscore-dangle */
/* eslint-disable quotes */
const db = require("better-sqlite3")("src/core/database/gun.db");

module.exports = {
  name: "refill",
  aliases: [],
  description:
    "Sets inventory to 1 bullet. If no user is specified, all users will have their bullets refilled",

  // Whether the command requires arguments
  reqArgs: false,
  // Arguments usage
  usage: "{ @user }",
  // Example usage of the command
  exampleUsage: "!refill @Derek",

  category: "'The Gun' Commands",

  // Command cooldown in milliseconds
  cooldown: 300,

  // eslint-disable-next-line no-unused-vars
  async run(ctx) {
    const memberRoles = await ctx.message.member.roles._roles.map((role) => role.name);
    if(!memberRoles.includes('🎙️Host') || memberRoles.includes('☕️ Intern Host')) {
      await ctx.sendText('Your dainty feminine hands fumble with the firearm awkwardly. You can\'t figure out how to reload it.');
      return;
    }
    const toRefill = await ctx.message.mentions.members.first();
    if (toRefill) {
      try {
        const stmt = await db
          .prepare(
            `INSERT INTO bullets (userId, username, bullets) 
                        VALUES (?,?,1) 
                        ON CONFLICT(userId) DO UPDATE SET 
                        bullets = 1 
                        WHERE userId = ?`,
          );
        await stmt.run(toRefill._userID, toRefill.displayName, toRefill._userID);
        await ctx.sendText(
          `${toRefill.nickname || toRefill.displayName}'s bullets reset to 1`
        );
      } catch (ex) {
        await console.log(ex);
      }
      // console.log(ctx.message.author);
    } else {
      try {
        await ctx.sendText("Refilling the gun...");
        const members = await ctx.guild.members.fetch();
        await members.forEach(async (member) => {
          if (member.user.bot) return;
          try {
            const stmt = await db
              .prepare(
                `INSERT INTO bullets (userId, username, bullets) 
                VALUES (?, ?, 1) 
                ON CONFLICT(userId) DO UPDATE SET 
                bullets = 1 
                WHERE userId = ?`,
              );
            await stmt.run(member._userID, member.displayName, member._userID);
            await console.log(
              `Refilled gun for ${member.nickname || member.displayName}`,
            );
          }
          catch (ex) {
            await console.log(ex);
          }
        });
        await ctx.sendText("Gun refilled for all members");
      } catch (ex) {
        await console.log(ex);
      }
    }
  },
};
