const { setTimeout } = require("timers");
const path = require("path");
const fs = require("fs");
const config = require("/project/workspace/selfbot/config.json"); // Consider changing this path if needed.

module.exports = {
  name: "mimic",
  description: "Mimic a user's messages",

  execute: async (
    message,
    args,
    activeAutoReacts,
    client,
    targetUsers,
    cacheMessages,
    blockedContent
  ) => {
    if (!args[0]) {
      return message.reply("Please mention a user to mimic");
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply("Invalid user");
    }

    if (
      targetUsers[message.channel.id] &&
      targetUsers[message.channel.id].targetUserId === user.id
    ) {
      // Stop mimicking
      if (targetUsers[message.channel.id].task) {
        // Implement cancel logic, if needed (e.g., clearing an interval)
        // For this example, we assume the mimicTask already handles its own stopping.
      }
      delete targetUsers[message.channel.id];
      return message.reply(`Stopped mimicking ${user.username}`);
    }

    const channel = client.channels.cache.get(message.channel.id);

    if (!channel) {
      return message.reply("Could not find the channel.");
    }

    // Start mimicking
    if (!targetUsers[message.channel.id]) {
      targetUsers[message.channel.id] = {
        targetUserId: user.id,
        clientInstance: client, // Added client instance to targetUsers object
      };

      // Call the mimicTask *directly* (or queue it using `setTimeout`)
      mimicTask(
        client,
        targetUsers,
        user,
        message,
        cacheMessages,
        blockedContent,
        client // Pass client1 or client2
      );

      channel.send(`Started mimicking ${user.username}`);
    }
  },
};
