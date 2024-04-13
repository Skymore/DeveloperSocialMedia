const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
/*
router.get('/me', auth, async (req, res) => { ... });

router.get：定义了一个GET请求的路由。当HTTP GET请求被发送到服务器上的/me路径时，这个路由会被触发。
'/me'：是这个路由的路径。
auth：是一个中间件函数，它在请求的处理流程中的当前路由处理器之前被调用。这个中间件的作用通常是验证请求是否带有有效的认证信息（例如，检查JWT令牌），如果没有有效的认证，则请求会在这一步被拦截。
async (req, res) => { ... }：是一个异步的路由处理器函数，它接收两个参数：req（请求对象）和res（响应对象）。通过这个函数，可以实现对请求的处理和响应的发送。
const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

这一行代码使用Mongoose库来从数据库中查找一个文档。Profile.findOne({ user: req.user.id })调用在Profile集合中查找一个文档，该文档的user字段匹配当前请求用户的id。
.populate('user', ['name', 'avatar'])：是Mongoose的一个方法，用于填充（populate）查询到的文档中某个字段的引用，这里是将user字段引用的文档中的name和avatar字段的值填充到查询结果中。
if (!profile) { return res.status(400).json({ msg: 'There is no profile for this user' }); }

这段代码检查是否成功找到了用户的个人资料。如果没有找到（!profile为true），则向客户端发送一个状态码为400的响应，并附带一条消息说明没有为该用户找到个人资料。
res.json(profile);

如果找到了个人资料，这行代码将该个人资料以JSON格式发送回客户端。
} catch (err) { console.error(err.message); res.status(500).send('Server Error'); }

这是一个try...catch语句的catch部分，用于捕获并处理try部分中发生的任何错误。如果出现错误，它会记录错误消息并向客户端发送一个状态码为500的响应，表示服务器内部错误。
总之，这段代码的作用是定义了一个路由，该路由用于获取并返回经过身份验证的用户的个人资料信息，如果找不到个人资料或遇到服务器错误，则返回相应的错误消息。
*/

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', [auth, [check('status', 'Status is required').notEmpty(), check('skills', 'Skills is required').notEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {
            new: true, upsert: true
        });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        /*
        在这段代码中，populate 方法用于填充在 MongoDB 文档中引用的其他文档的实际数据。具体来说，这里使用 Mongoose（一个 MongoDB 对象建模工具）来操作 MongoDB 数据库。
        代码的上下文是一个使用 Express 和 Mongoose 的 Node.js 应用程序。这里，Profile.findOne 方法用于查询数据库中的一个 Profile 文档，其中查询条件是用户 ID（req.params.user_id）。
        通过 .populate('user', ['name', 'avatar']) 部分，它实际上是在说：“在找到的 Profile 文档中，将 user 字段填充为对应的 User 文档，并且只包含 User 文档的 name 和 avatar 字段”。

        总结一下，populate 的作用是：

        自动替换：它自动替换指定字段（在这个例子中是 Profile 文档中的 user 字段）的引用（通常是一个 ID）为实际的文档数据。
        字段选择：它允许选择性地指定哪些字段应该包括在填充的文档中，以此来减少传输的数据量。在这个例子中，只有 name 和 avatar 字段被包括在内。

        */

        if (!profile) return res.status(400).json({msg: 'Profile not found'});

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user posts
        await Post.deleteMany({ user: req.user.id });
        // Remove profile
        await Profile.findOneAndDelete({user: req.user.id});
        // Remove user
        await User.findOneAndDelete({_id: req.user.id});

        res.json({msg: 'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put('/experience', [auth, [check('title', 'Title is required').notEmpty(), check('company', 'Company is required').notEmpty(), check('from', 'From date is required').notEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title, company, location, from, to, current, description
    } = req.body;

    const newExp = {
        title, company, location, from, to, current, description
    };

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        //const foundProfile = await Profile.findOneAndUpdate( { user: req.user.id },
        //  { $pull: { experience: { _id: req.params.exp_id }}},
        //  {new: true});
        const foundProfile = await Profile.findOne({user: req.user.id});

        // Filter exprience array using _id (NOTE: _id is a BSON type needs to be converted to string)
        // This can also be omitted and the next line and findOneAndUpdate to be used instead (above implementation)
        foundProfile.experience = foundProfile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);

        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Server error"});
    }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put('/education', [auth, [check('school', 'School is required').notEmpty(), check('degree', 'Degree is required').notEmpty(), check('fieldofstudy', 'Field of study is required').notEmpty(), check('from', 'From date is required').notEmpty(),]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        school, degree, fieldofstudy, from, to, current, description
    } = req.body;

    const newEdu = {
        school, degree, fieldofstudy, from, to, current, description
    };

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({user: req.user.id});
        const eduIds = foundProfile.education.map(edu => edu._id.toString());
        // if i dont add .toString() it returns this weird mongoose coreArray and the ids are somehow objects and it still deletes anyway even if you put /education/5
        const removeIndex = eduIds.indexOf(req.params.edu_id);
        if (removeIndex === -1) {
            return res.status(500).json({msg: "Server error"});
        } else {
            // these console logs helped me figure it out
            /*   console.log("eduIds", eduIds);
            console.log("typeof eduIds", typeof eduIds);
            console.log("req.params", req.params);
            console.log("removed", eduIds.indexOf(req.params.edu_id));
       */
            foundProfile.education.splice(removeIndex, 1,);
            await foundProfile.save();
            return res.status(200).json(foundProfile);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Server error"});
    }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: encodeURI(`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`),
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({msg: 'No Github profile found'});
            }

            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;