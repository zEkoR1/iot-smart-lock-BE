const userService = require('../services/auth.service');  // no destructuring!

exports.findAll = async (req, res) => {
    try {
        const users = await userService.findAll();
        res.json(users)
        console.log('ASD')
    }
    catch (error){
        console.log("NO", error.message)
        res.status(500).json({message: `Unknown error ${error.message}`})
    }
}