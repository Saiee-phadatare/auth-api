const jwt = require("jsonwebtoken");

exports.identifier = (req, res, next)=>{
    // const authHeader = req.headers.authorization;
    // // Check if token is missing
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    // }

    let token;
    if(req.headers.client === 'not-browser'){
        token = req.headers.authorization
    }else{
        token = req.cookies['Authorization']
    }
    if(!token){
        return res.status(403).json({success : false, message : "Unauthorized!"});
    }

    try {
        const userToken = token.split(" ")[1];
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET)
        if(jwtVerified){
            req.user = jwtVerified;
            next();
        }else{
            throw new Error('Error in the token(identification)');
        }
    } catch (error) {
        console.log(error);
    }
}