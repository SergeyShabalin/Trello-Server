const Router = require('express').Router;
const router = new Router();

router.get('/', async (req, res, next) => {
    return res.json([])
})

module.exports = router