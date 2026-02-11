const ensureAuthenticated = require('../middlewares/AuthProducts');


const router = require('express').Router();

router.get('/', ensureAuthenticated, (req , res) =>{
    console.log('User is authenticated, email:', req.user);
    res.status(200).json([
        {
            name: "Iphone 14 Pro Max",
            price: 120000,
       
        },
        {
            name: "Samsung Galaxy S23 Ultra",
            price: 110000,
         
        }
    ])
})

module.exports = router;