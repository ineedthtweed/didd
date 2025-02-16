const Discord = require("discord.js-selfbot-v13");
const config = require("../config.json"); // Import config

module.exports = {
  name: "vcjoin",
  description: "Manage voice channel connections.",
  async execute(message, args, activeAutoReacts, client) {
    execute(message, args);
    if (message.author.id !== config.userId) {
      return; // Do nothing if the user doesn't have permission
    }
    if (!message.guild) return; // Selfbots work in guilds only

    const subcommand = args[0]?.toLowerCase();

    switch (subcommand) {
      case "stable": {
        const channelId = args[1];
        if (!channelId) {
          return message.reply("Please provide a voice channel ID.");
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel || channel.type !== "GUILD_VOICE") {
          // Modified Line
          return message.reply("Invalid voice channel ID.");
        }

        try {
          const connection = await channel.join();
          await message.reply(`Connected to ${channel.name}`);
        } catch (error) {
          console.error("Error connecting to voice channel:", error);
          await message.reply(
            `Error connecting to voice channel: ${error.message}`
          );
        }
        break;
      }

      case "list": {
        const voiceChannels = message.guild.channels.cache.filter(
          (channel) => channel.type === "GUILD_VOICE"
        ); // Modified Line
        if (!voiceChannels.size) {
          return message.reply("No voice channels available.");
        }

        const channelList = voiceChannels
          .map((channel) => `• ${channel.id}: ${channel.name}`)
          .join("\n");
        await message.reply(`Available Voice Channels:\n\n${channelList}`);
        break;
      }

      case "status": {
        const voiceConnection = client.voice.connections.get(message.guild.id); // Use client.voice.connections
        if (voiceConnection && voiceConnection.joinConfig.channelId) {
          // Corrected
          const channel = client.channels.cache.get(
            voiceConnection.joinConfig.channelId
          );
          if (channel) {
            await message.reply(
              [
                `Current Voice Status:`,
                `• Connected to: ${channel.name}`,
                `• Channel ID: ${channel.id}`,
                `• Latency: N/A (discord.js-selfbot-v13 doesn't expose this easily)`,
              ].join("\n")
            );
          } else {
            await message.reply(
              "Connected to a channel, but channel info not found."
            );
          }
        } else {
          await message.reply("Not connected to any voice channel.");
        }
        break;
      }

      case "leave": {
        const voiceConnection = client.voice.connections.get(message.guild.id); // Use client.voice.connections

        if (voiceConnection) {
          try {
            voiceConnection.destroy();
            await message.reply("Left voice channel.");
          } catch (error) {
            console.error("Error disconnecting from voice channel:", error);
            await message.reply(
              `Error leaving voice channel: ${error.message}`
            );
          }
        } else {
          await message.reply("Not in a voice channel.");
        }
        break;
      }

      case "rotate": {
        // Implement rotation logic here (similar to the previous version,
        // but using message replies instead of ephemeral interactions
        // and client.voice.connections to manage the connection)
        // This is more complex to implement in this environment.
        // It is not complete.  See the comments in the code.

        const voiceChannels = message.guild.channels.cache.filter(
          (channel) => channel.type === "GUILD_VOICE"
        ); // Modified Line
        if (!voiceChannels.size) {
          return message.reply("No voice channels available.");
        }
        await message.reply(
          "Starting voice channel rotation (experimental).  This is not fully implemented."
        );

        let isRotating = true;
        async function startRotation() {
          // Get the active connection.
          let voiceConnection = client.voice.connections.get(message.guild.id);

          if (!voiceConnection) {
            // if no connection exists, attempt to connect to the first voice channel
            try {
              const firstChannel = voiceChannels.first();
              voiceConnection = await firstChannel.join();
            } catch (err) {
              console.error("Error joining first voice channel:", err);
              return; // exit if failed
            }
          }
          // Check if the bot is still connected to a voice channel.
          if (!voiceConnection) {
            return message.reply(
              "Could not connect to a voice channel. Rotation stopped."
            );
          }

          while (isRotating) {
            for (const channel of voiceChannels.values()) {
              if (!isRotating) break; // Check the flag
              if (channel.id === voiceConnection.joinConfig.channelId) continue; // skip if it's already connected
              try {
                await voiceConnection.move(channel); // Use move method

                console.log(`Moved to channel: ${channel.name}`);
                await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second delay
              } catch (error) {
                console.error(`Error rotating to ${channel.name}:`, error);
              }
            }
          }
          console.log("Voice channel rotation stopped.");
        }

        startRotation(); // Start rotation in the background.
        //Provide a stop command.

        break;
      }

      default:
        await message.reply(
          `Invalid vcjoin subcommand. Use: stable <channel_id>, list, status, leave, rotate.`
        );
    }
  },
};
