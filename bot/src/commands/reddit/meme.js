const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');
const { getRapidAPIKey, getRedditApiHost } = require('../../utility/database/get_bot_config')
const getConnection = require('../../functions/database/connectDatabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetches a random meme'),
    usage: '',
    async execute(interaction) {
        const subreddit = 'meme';
        const userId = interaction.member.user.id;
        const guildId = interaction.guild?.id;
        await interaction.deferReply();

        const rapidApiKey = await getRapidAPIKey(guildId);
        const redditApiHost = await getRedditApiHost(guildId);

        try {
            const url = `https://${redditApiHost}/api/scrape/new?subreddit=${encodeURIComponent(subreddit)}&limit=50`;

            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': redditApiHost
                }
            };

            const embedColor = await getEmbedColor(guildId, userId);

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error (
                    `Reddit API returned HTTP ${response.status}`
                );
            }

            const result = await response.json();

            if (
                !result?.success ||
                !Array.isArray(result?.posts) ||
                result.posts.length === 0
            ) {
                await interaction.editReply(
                    `No posts found for **r/${subreddit}**.`
                ); return;
            }

            const safePosts = result.posts.filter(post =>
                post?.data &&
                post.data.over_18 !== true
            );

            if (safePosts.length === 0) {
                await interaction.editReply(
                    `No non-NSFW posts found for **r/${subreddit}**.`
                );

                return;
            }

            /*
             * Pick a random safe post
             */
            const randomIndex =
                Math.floor(Math.random() * safePosts.length);

            const post =
                safePosts[randomIndex].data;

            /*
             * Basic post information
             */
            const title =
                post.title || "No title";

            const author =
                post.author || "Unknown";

            const permalink =
                post.permalink
                    ? `https://reddit.com${post.permalink}`
                    : "https://reddit.com";

            const score =
                post.score ?? "N/A";

            const ups =
                post.ups ?? 0;

            const downs =
                post.downs ?? 0;

            const comments =
                post.num_comments ?? 0;

            const subredditName =
                post.subreddit || subreddit;

            /*
             * Media information
             */
            const isVideo =
                post.is_video === true;

            const imageUrl =
                post.url || "";

            const thumbnail =
                post.thumbnail || "";

            /*
             * Build embed
             */
            const embed = new EmbedBuilder()

                .setTitle(title)

                .setURL(permalink)

                .setColor(embedColor)

                .setAuthor({
                    name: `Posted by u/${author}`,
                    url: `https://reddit.com/u/${author}`
                })

                .addFields(

                    {
                        name: "Score",
                        value: `${score}`,
                        inline: true
                    },

                    {
                        name: "Subreddit",
                        value: `r/${subredditName}`,
                        inline: true
                    }

                )

                .setFooter({
                    text:
                        `⬆️ ${ups}  ⬇️ ${downs}  💬 ${comments}  •  Posted on Reddit`
                });

            /*
             * Handle media
             */

            if (isVideo) {

                /*
                 * Reddit video
                 */
                if (
                    post.reddit_video_preview?.fallback_url
                ) {

                    embed.setImage(
                        post.reddit_video_preview.fallback_url
                    );

                    /*
                     * Reddit preview image
                     */
                } else if (
                    post.preview?.images?.[0]?.source?.url
                ) {

                    const previewUrl =
                        post.preview.images[0].source.url
                            .replace(/&amp;/g, '&');

                    embed.setImage(previewUrl);

                    /*
                     * Thumbnail fallback
                     */
                } else if (
                    thumbnail.startsWith("http")
                ) {

                    embed.setImage(thumbnail);
                }

            } else {

                /*
                 * Normal image
                 */
                if (
                    imageUrl &&
                    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(imageUrl)
                ) {

                    embed.setImage(imageUrl);

                    /*
                     * Reddit preview image
                     */
                } else if (
                    post.preview?.images?.[0]?.source?.url
                ) {

                    const previewUrl =
                        post.preview.images[0].source.url
                            .replace(/&amp;/g, '&');

                    embed.setImage(previewUrl);

                    /*
                     * Thumbnail fallback
                     */
                } else if (
                    thumbnail.startsWith("http")
                ) {

                    embed.setThumbnail(thumbnail);
                }
            }

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {
            console.error("Reddit command error:", error);
            await interaction.editReply(
                'An error occurred while fetching Reddit posts.'
            )
        }
    }
}