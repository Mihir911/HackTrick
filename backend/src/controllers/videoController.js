import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import { cleanDocument, generateId, nowIso } from '../utils/helpers.js';
import logger from '../utils/logger.js';


//create a new  video

export const createVideo = async (req, res) => {
    try {
        const {
            title,
            description,
            video_type,
            tags,
            external_url,
            storage_path,
            thumbnail_url,
            duration_sec
        } = req.body;

        // Validate either external_url or storage_path
        if (!external_url && !storage_path) {
            return res.status(400).json({
                error: 'Either external_url or storage_path is required'
            });
        }

        const video = new Video({
            owner_id: req.user.id,
            owner_name: req.user.name,
            owner_role: req.user.role,
            title,
            description: description || '',
            video_type: video_type || 'long',
            tags: tags || [],
            external_url: external_url || null,
            storage_path: storage_path || null,
            thumbnail_url: thumbnail_url || null,
            duration_sec: duration_sec || null,
            views: 0,
            likes: []
        });

        await video.save();

        logger.info(`Video created: ${video.id} by ${req.user.id}`);
        res.status(201).json(video);
    } catch (error) {
        logger.error(`Create video error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create video' });
    }
};



//list videos with filters
export const listVideos = async (req, res) => {
    try {
        const { video_type, owner_id, tag } = req.query;
        const query = {};

        if (video_type) query.video_type = video_type;
        if (owner_id) query.owner_id = owner_id;
        if (tag) query.tags = tag;

        const videos = await Video.find(query)
            .sort({ created_at: -1 })
            .limit(200);

        res.json(videos);
    } catch (error) {
        logger.error(`List videos error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list videos' });
    }
};


//get a single video with comments
export const getVideo = async (req, res) => {
    try {
        const { vid } = req.params;

        const video = await Video.findOne({ id: vid });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Increment views
        await Video.findOneAndUpdate(
            { id: vid },
            { $inc: { views: 1 } }
        );

        // Get comments
        const comments = await Comment.find({
            target_id: vid,
            target_type: 'video'
        }).sort({ created_at: -1 }).limit(200);

        res.json({
            ...video.toJSON(),
            comments
        });
    } catch (error) {
        logger.error(`Get video error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get video' });
    }
};

//toggle like on a video
export const toggleLike = async (req, res) => {
    try {
        const { vid } = req.params;
        const userId = req.user.id;

        const video = await Video.findOne({ id: vid });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const alreadyLiked = video.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike
            await Video.findOneAndUpdate(
                { id: vid },
                { $pull: { likes: userId } }
            );
            res.json({ liked: false });
        } else {
            // Like
            await Video.findOneAndUpdate(
                { id: vid },
                { $addToSet: { likes: userId } }
            );
            res.json({ liked: true });
        }
    } catch (error) {
        logger.error(`Toggle like error: ${error.message}`);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};




//add comment to a video
export const addComment = async (req, res) => {
    try {
        const { vid } = req.params;
        const { text } = req.body;

        // Check if video exists
        const video = await Video.findOne({ id: vid });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const comment = new Comment({
            target_id: vid,
            target_type: 'video',
            user_id: req.user.id,
            user_name: req.user.name,
            text
        });

        await comment.save();

        logger.info(`Comment added to video ${vid} by ${req.user.id}`);
        res.status(201).json(comment);
    } catch (error) {
        logger.error(`Add comment error: ${error.message}`);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

export default { createVideo, listVideos, getVideo, toggleLike, addComment };