const db = require('better-sqlite3')('src/core/database/gun.db');

function DBLogger(ctx) {
    const stmt = db.prepare('INSERT INTO log (userID, logMessage) VALUES (?, ?)');
    stmt.run(ctx.message.author.id, ctx.message.content);
}

module.exports.Log = DBLogger;
