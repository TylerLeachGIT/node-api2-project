// implement your posts router here
const express = require('express');
const Posts = require('./posts-model')

const router = express.Router()




router.get('/', (req, res) => {
    Posts.find()
    .then(posts => {
        res.status(200).json(posts);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'The posts information could not be retrieved' });
    });
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'The post with the specified ID does not exist' });
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'The post information could not be retrieved' });
    });
});

// POST /api/posts
router.post('/', (req, res) => {
    if (!req.body.title || !req.body.contents) {
        return res.status(400).json({ 
            message: "Please provide title and contents for the post" 
        });
    }

    Posts.insert(req.body)
    .then(result => {
        // After insert, we need to get the full post object
        return Posts.findById(result.id);
    })
    .then(post => {
        res.status(201).json(post);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ 
            message: 'There was an error while saving the post to the database' 
        });
    });
});

// PUT /api/posts/:id
router.put('/:id', (req, res) => {
    const { id } = req.params;

    if (!req.body.title || !req.body.contents) {
        return res.status(400).json({ 
            message: 'Please provide title and contents for the post' 
        });
    }

    Posts.findById(id)
    .then(post => {
        if (!post) {
            return res.status(404).json({ 
                message: 'The post with the specified ID does not exist' 
            });
        }

        return Posts.update(id, req.body)
        .then(count => {
            if (count > 0) {
                // Return the updated post
                return Posts.findById(id);
            } else {
                throw new Error('Update failed');
            }
        })
        .then(updatedPost => {
            res.status(200).json(updatedPost);
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ 
            message: 'The post information could not be modified' 
        });
    });
});

// DELETE /api/posts/:id
router.delete('/:id', (req, res) => {
    // First, get the post before deleting it
    Posts.findById(req.params.id)
    .then(post => {
        if (!post) {
            return res.status(404).json({ message: 'The post with the specified ID does not exist' });
        }

        // Post exists, now delete it
        return Posts.remove(req.params.id)
        .then(count => {
            if (count > 0) {
                res.status(200).json(post); // Return the deleted post
            } else {
                res.status(500).json({ 
                    message: 'The post could not be removed' 
                });
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ 
            message: 'The post could not be removed' 
        });
    });
});

// GET /api/posts/:id/comments
router.get('/:id/comments', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if (!post) {
            return res.status(404).json({ 
                message: 'The post with the specified ID does not exist' 
            });
        }

        return Posts.findPostComments(req.params.id)
        .then(comments => {
            res.status(200).json(comments);
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ 
            message: 'The comments information could not be retrieved' 
        });
    });
});

module.exports = router