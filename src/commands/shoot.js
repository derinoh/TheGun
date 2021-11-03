/* eslint-disable no-underscore-dangle */
/* eslint-disable quotes */
const db = require("better-sqlite3")("src/core/database/gun.db");

module.exports = {
  name: "shoot",
  aliases: ["kill"],
  description:
    "Shooting someone will kill them. Only shoot members you intend to kill. You get 1 bullet.",

  // Whether the command requires arguments
  reqArgs: true,
  // Arguments usage
  usage: "{ @user }",
  // Example usage of the command
  exampleUsage: "!shoot @Davie",

  category: "'The Gun' Commands",

  // Command cooldown in milliseconds
  cooldown: 300,

  // eslint-disable-next-line no-unused-vars
  async run(ctx) {
    const toKill = await ctx.message.mentions.members.first();
    if (toKill) {
      // get number of bullets before shooting
      const row = await db
        .prepare(`SELECT bullets FROM bullets WHERE userId = ?`)
        .get(ctx.message.author.id);
      if (row === undefined) {
        await ctx.sendText(`**${ctx.message.author.username}** has not been given any bullets`);
        return;
      }
      const memberRoles = await ctx.message.member.roles._roles.map((role) => role.name);
      if (row.bullets || memberRoles.includes('🎙️Host') || memberRoles.includes('☕️ Intern Host')) {
        // if user is a host, deny
        const targetRoles = await toKill.roles._roles.map((role) => role.name);
        if (targetRoles.includes('🎙️Host') || targetRoles.includes('☕️ Intern Host')) {
          await ctx.sendText('You cannot kill that which cannot be killed');
          return;
        }
        if (targetRoles.includes('☠️ Dead')) {
          await ctx.sendText(`⚰️**${toKill.nickname || toKill.displayName}** is dead and cannot be killed.`);
          return;
        }
        if (memberRoles.includes('☠️ Dead')) {
          await ctx.sendText(`⚰️**${ctx.message.member.nickname || ctx.message.member.displayName}** is dead and cannot shoot anyone.`);
          return;
        }
        
        // otherwise shoot the target
        const stmt = await db.prepare(`
          UPDATE bullets set bullets = bullets - 1 WHERE userId = ?
        `);
        await stmt.run(ctx.message.author.id);
        const roleKill = await ctx.message.guild.roles.cache.find(
          (role) => role.name === "☠️ Dead",
        );
        await ctx.sendText(`💥***BANG***💥
        ⚰️**${toKill.nickname || toKill.displayName}** has dropped dead.`);
        await toKill.roles.add(roleKill);
      } else {
        await ctx.sendText(`**${ctx.message.author.username}** has no more bullets. No one was killed when **${ctx.message.author.username}** pulled the trigger.`);
      }
      // console.log(ctx.message.author);
    }
  },
};
