import jwt from 'jsonwebtoken'


const userAuth = async (req,res , next )=>{
    const {token} = req.headers;
    if(!token){
        return res.json({success : false , message : 'Not Authorized'})

    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.body.userId =tokenDecode.id;
        }else{
             return res.json({success : false , message : 'Not Authorized'})
        }
        next(); //pass the control to next middleware 
    } catch (error) {
        res.json({success : false , message : 'Not Authorized'})
    }
}
export default userAuth