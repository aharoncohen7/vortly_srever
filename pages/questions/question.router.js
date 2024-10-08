const express = require("express");
const QuestionService = require("./question.service");
const questionRoute = express.Router();

// Get all tags for a particular post
questionRoute.post("/", async (req, res) => {
    try {
        const question = await QuestionService.create(req.body);
        if (question) {
            res.status(200).json(question);
            return;
        }
        res.status(404).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});



// // Get all tags for a particular post
// questionRoute.get("/:postId",IAM.validationParams, async (req, res) => {
//     try {
//         const tags = await db.getTagsByPostId(req.params.postId);
//         if (tags) {
//             res.status(200).json(tags);
//             return;
//         }
//         res.status(404).send();
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// //adding tags
// questionRoute.post("/", async (req, res) => {
//     try {
//         const isPostExist = await db2.isPostExist(req.body.postId)
//         if(!isPostExist) {
//             res.status(400).send("It is impossible to add a tags to a post that does not exist");
//         }
//             const [newTags] = await db.addTagsToPost(req.body.postId, req.body.tags);
//         if (newTags) {
//             res.status(201).json(newTags);
//             return;
//         }
//         res.status(400).send();
//     } catch (error) {
//         res.status(500).send(error.message)
//     }
// });



module.exports = questionRoute;





