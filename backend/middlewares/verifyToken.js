import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    
    if(!token) return res.status(400).json({
        success: false,
        message: "Unauthorized: No token Provided."
    })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) return res.status(400).json({
            success: false,
            message: "Unauthorized invalid token"
        }) 
        req.userID = decoded.userID;
        next();
    } catch (error) {
        console.log("Error in verify Token ", error);
        return res.status(500).json({
            success: false,
            message: "Server Error."
        })
    }
}