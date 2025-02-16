// commands/stopreply.js
const commandStopReply = {
  name: "stopareply",
  description: "Stop auto-reply for the current channel.",
  async execute(message, args, activeAutoReacts, client, targetUsers) {
    const channelId = message.channel.id;
    execute(message, args);
    if (message.author.id !== config.userId) {
      return; // Do nothing if the user doesn't have permission
    }

    if (targetUsers[channelId]) {
      delete targetUsers[channelId]; // Remove the target user for this channel
      console.log(`Auto-reply stopped for channel ${channelId}`);
      return message.reply(
        `\`\`\`ansi\n\x1b[31mareply has been canceled\x1b[0m\n\`\`\``
      );
    } else {
      return message.reply(
        `\`\`\`ansi\n\x1b[31mareply ia not active do .removettarget if it proceeds to autoreply.\x1b[0m\n\`\`\``
      );
    }
  },
};

module.exports = commandStopReply;
