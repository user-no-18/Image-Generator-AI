import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from 'razorpay';
import dotenv from "dotenv";
dotenv.config();

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
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

const userCredits = async (req, res) => {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await userModel.findById(userId)
    res.json({ success: true, credits: user.creditBalance, user: { name: user.name } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}



const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Missing");
   console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");
    const { userId, planId } = req.body;


    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: "Missing userId or planId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Plan details
    let amount, credits;
    switch (planId) {
      case "Basic": amount = 10; credits = 100; break;
      case "Advanced": amount = 50; credits = 500; break;
      case "Business": amount = 250; credits = 5000; break;
      default:
        return res.status(400).json({ success: false, message: "Plan not found" });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Optional: Save transaction in DB
    await transactionModel.create({
      userId,
      plan: planId,
      amount,
      credits,
      payment: false,  // payment pending
    });
    

    res.json({ success: true, order });

  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




export { registerUser, loginUser, userCredits , paymentRazorpay }
