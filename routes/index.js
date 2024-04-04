const { Router } = require('express');
const router = Router();

// redirect to API
router.get('/', (req, res) => {
  res.redirect('/api');
});

module.exports = router;
