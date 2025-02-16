const config = require("../config.json"); // Ensure you have your config file for user ID
const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: "gcfill",
  description:
    "Adds users to a group chat using their tokens and joins a server.",

  async execute(message, args) {
    if (message.author.id !== config.userId) {
      return message.reply(
        `\`\`\`ansi\n\x1b[31mYou do not have permission to use this command.\x1b[0m\n\`\`\``
      );
    }
    const tokensFilePath = path.join(__dirname, "..", "tokens.txt");

    try {
      const data = await fs.readFile(tokensFilePath, "utf8");
      const tokens = data.split("\n").filter((token) => token.trim() !== "");
      const inviteCode = args[0] || "1337959848884568068";

      if (tokens.length === 0) {
        return message.channel.send("```No tokens found in the file.```");
      }

      const limitedTokens = tokens.slice(0, 12);
      const groupChannel = message.channel;

      if (groupChannel.type !== "GROUP_DM") {
        return message.channel.send(
          "```This command can only be used in a group DM.```"
        );
      }

      const addTokenToGC = (token) => {
        return new Promise((resolve) => {
          const userClient = new Client({
            checkUpdate: false,
            syncStatus: false,
            captchaService: null,
            ws: {
              properties: {
                browser: "Discord Android",
              },
            },
          });

          userClient.on("ready", async () => {
            try {
              // Join the server first
              await userClient.acceptInvite(inviteCode).catch(console.error);
              console.log(`Joined server with ${userClient.user.tag}`);

              // Then add to group chat
              await message.channel.addMembers([userClient.user.id]);
              console.log(`Added ${userClient.user.tag} to the group chat`);
            } catch (error) {
              console.error(`Error with token ${token.slice(-4)}: ${error}`);
            } finally {
              await userClient.destroy();
              resolve();
            }
          });

          userClient.login(token).catch((error) => {
            console.error(
              `Login error with token ${token.slice(-4)}: ${error}`
            );
            resolve();
          });
        });
      };

      message.channel.send("```Starting group chat fill process...```");

      for (const token of limitedTokens) {
        await addTokenToGC(token);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await message.channel.send(
        `\`\`\`Successfully attempted to add ${limitedTokens.length} users to the group chat\`\`\``
      );
    } catch (error) {
      console.error("Error:", error);
      await message.channel.send(
        "```An error occurred while processing the tokens```"
      );
    }
  },
};
