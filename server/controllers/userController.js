import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    //bcrypt part
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //creates new userdata
    const userData = {
      name,
      email,
      password: hashedPassword,
    };
    const newUser = new userModel(userData); // ready the package to insert in database
    const user = await newUser.save(); //inserting in database
    // jwt token part
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{ expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for missing fields
    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    
    // Find user in database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Send success response
    res.json({ 
      success: true, 
      token, 
      user: { 
        
        name: user.name,
       
      } 
    });
    
  } catch (error) {
    console.log(error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};

 const userCredits = async(req,res) =>{
  try {
     const token = req.headers.token;
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userId = decoded.id;
     const user = await userModel.findById(userId)
     res.json({success:true , credits :user.creditBalance, user:{name: user.name}})
  } catch (error) {
     console.log(error)
     res.json({success : false , message:error.message})
  }
 }
export  {registerUser,loginUser,userCredits}

//JWT Purpose: Proves the user is authenticated and allows access to protected routes.
// After both registration and login, the user should be able to:

// Access their dashboard
// Make authenticated API calls
// Use protected features

// Bottom Line: Whether someone just created an account or logged into an existing one, they expect to be logged in and ready to use your app - that's what the JWT token enables in both cases!RetryClaude does not have the ability to run the code it generates yet.Claude can make mistakes. Please double-check responses.