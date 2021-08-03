const { Router } = require('express');

const router = Router();

router.get('csfr', (req, res) => {
  res.send({ token: req.csrfToken() });
})

module.exports = router;