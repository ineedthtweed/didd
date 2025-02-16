const { PermissionsBitField } = require("discord.js");
const config = require("../config.json"); // Ensure you have your config file for user ID

module.exports = {
  name: "clone",
  description:
    "Clones channels from the specified source guild to the destination guild.",
  async execute(message, args) {
    if (message.author.id !== config.userId) return; // Do nothing if the user doesn't have permission
    // Get user ID from config.json
    const userId = config.userId;

    // Fetch guilds from the bot's client
    const guilds = message.client.guilds.cache;

    // Find the source and destination guilds (you can adjust this according to your logic)
    let sourceGuild, destinationGuild;

    // Fetch both guilds based on your logic (for example, by names or IDs)
    for (const guild of guilds.values()) {
      if (guild.ownerId === userId && !sourceGuild) {
        sourceGuild = guild; // First guild found
      } else if (guild.id !== sourceGuild.id) {
        destinationGuild = guild; // Any other guild found
      }
    }

    if (!sourceGuild || !destinationGuild) {
      return message.channel.send(
        "Unable to find both source and destination guilds."
      );
    }

    // Function to clone channels from source to destination
    async function cloneChannels() {
      try {
        // Iterate through the channels of the source guild
        for (const channel of sourceGuild.channels.cache.values()) {
          if (channel.type === "GUILD_TEXT" || channel.type === "GUILD_VOICE") {
            // Only clone text and voice channels
            await destinationGuild.channels.create(channel.name, {
              type: channel.type,
              topic: channel.topic,
              nsfw: channel.nsfw,
              parent: channel.parentId,
              permissionOverwrites: channel.permissionOverwrites.map(
                (overwrite) => ({
                  id: overwrite.id,
                  allow: overwrite.allow,
                  deny: overwrite.deny,
                })
              ),
            });
          }
        }

        message.channel.send(
          `\`\`\`ansi\n\x1b[32mSuccessfully cloned channels from ${sourceGuild.name} to ${destinationGuild.name}.\x1b[0m\n\`\`\``
        );
      } catch (error) {
        console.error("Error cloning channels:", error);
        message.channel.send(
          `\`\`\`ansi\n\x1b[35mAn error occurred while cloning channels:\n${error.message}\x1b[0m\n\`\`\``
        );
      }
    }

    // Execute the cloneChannels function
    await cloneChannels();
  },
};
