const User = require("../models/user");
const jwt = require('jsonwebtoken');
const emaill = require('./email');
const crypto = require('crypto');
//const emailService = require('../controlers/email'); // Email utility
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}
const handleForgotPassErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }




  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}
// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'nader elfeel', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}



// Controller to handle user signup and OTP generation
exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Create a new user instance (not saved yet)
    //const user = new User({ email, password });

    const otp = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit OTP

    // Step 3: Send OTP via email
    const message = `Your OTP for email verification is: ${otp}. It will expire in 5 minutes.`;
           // Save the user with the verification code
           const newUser = new User({
            email: email,
            password: password,  // Ensure you hash the password before saving
            otp: otp,
            isVerified: false,
            otpExpires : Date.now() + 10 * 60 * 1000
            //otpExpires: Date.now() + 5 * 60 * 1000 // OTP expires in 5 minutes
          });
      
          // Step 4: Save the user with the OTP
          await newUser.save();
    // Step 2: Generate OTP
    //const otp = user.generateOTP();
    console.log(otp);

    await emaill({
      email: email,
      subject: 'Email Verification OTP',
      message: message,
    });

    console.log('OTP sent successfully to the user’s email.');

    // Step 4: Save the user to the database
    await user.save();
    
    // Step 5: Redirect to the OTP verification page
    //res.render('error404');
  } catch (err) {
    console.error('Error during signup:', err.message);
    res.status(500).json({ error: err.message });
  }
};


/*module.exports.login_post = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const validate_2fa = await User._2fa_email(email);
    if(validate_2fa){
      console.log('validate_2fa is true')
      res.status(200).render('otp');

    const token = createToken(user._id);
    }
    
    
    //res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
   //res.status(200).json({ user: user._id }); 
    
    
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}*/
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}


/*
module.exports.verifyEmail_get = (req,res)=>{
  res.render('verifyEmail');
}*/
module.exports.verifyEmail = (req,res)=>{
   const code = req.body;
   console.log(code);
   res.json({code});
  //res.render('verifyEmail');
}
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }

  exports.forgotPassword = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        const errors = handleForgotPassErrors(err);
        res.status(400).json({ errors });;
      }
  
      // Create reset token and save it to the database
      const resetToken = user.createResetPasswordToken();
      await user.save({ validateBeforeSave: false });
      //await user.save(); // Save without running validators
     console.log(resetToken);
      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
      const message = `We have received a password reset request. Please use the following link to reset your password:\n\n${resetUrl}`;
  
      // Send email
      try {
        await emaill({
          email: user.email,
          subject: 'Password Reset Request',
          message: message,
        });
       console.log('await emaill.sendEmail')
        res.status(200).json({
          message: 'Password reset token sent successfully to the user’s email.',
        });
        //res.redirect('/login');
        
      } catch (err) {
        // If email fails, reset the token fields and save
        user.passwordResetToken = undefined;
        user.passwordExpiresAt = undefined;
        await user.save({ validateBeforeSave: false });
  
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
      }
    } catch (err) {
      console.error('Errror:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
  

  exports.resetPassword = async (req, res, next) => {
    // 1. Check if the user exists with the given token & token has not expired
    console.log(req.params.token);
    const token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    console.log(token);
    // Find user by the hashed token and check if the token has expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordExpiresAt: { $gt: Date.now() }, // Ensure the token has not expired
    });
  
    if (!user) {
      const error = 'Token is invalid or has expired!';
      console.log("not fucking found")
       next(error);
    }
  else{
    // 2. If user exists and token is valid, reset the password
    user.password = req.body.password;
   // user.confirmPassword = req.body.confirmPassword;
    
    // Reset the password reset fields
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;
    user.passwordChangedAt = Date.now();
  
    // Save the updated user information
    await user.save();
  
    // 3. Respond with success message
    res.status(200).json({
      message: 'Password reset successful!',
    });}
  };

 exports._send_otp = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
       console.log(req.body.email);
      if (!user) {
        //const errors = handleForgotPassErrors(err);
        const errors = "can't find the user";
        res.status(400).json({ errors });;
      }
       console.log('if (!user)')
      // Create reset token and save it to the database
      const resetToken = user.generateOTP();
      await user.save(); // Save without running validators
  
      // Create reset URL
      const resetUrl = `${resetToken}`;
      const message = `OTP. Please use the following link to reset your password:\n\n${resetUrl}`;
      console.log('const resetUrl = ${resetToken};')
      // Send email
      try {
        await emaill.sendEmail({
          email: user.email,
          subject: 'Password  OTP',
          message: message,
        });
        res.send('ffffffffffffffffffffffffffffffffffffffffffffff');
       /* res.status(200).json({
          message: 'Password reset token sent successfully to the user’s email.',
        });*/

        console.log('sent successfully to the user’s email')
        //res.redirect('/login');
        
      } catch (err) {
        // If email fails, reset the token fields and save
        user.otp = undefined;
        console.log(' user.otp = undefined;')
        user.Date = undefined;
        await user.save();
        console.log(' await user.save({ validateBeforeSave: false });')
  
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
      }
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
/*
  exports.resetPassword = async (req, res, next) => {
    // 1. Check if the user exists with the given token & token has not expired
    console.log(req.params.token);

    const token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by the hashed token and check if the token has expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordExpiresAt: { $gt: Date.now() }, // Ensure the token has not expired
    });
  
    if (!user) {
      const error =  'Token is invalid or has expired!';
      console.log("not fucking found")
       next(error);
    }
  else{
    // 2. If user exists and token is valid, reset the password
    user.password = req.body.password;
   // user.confirmPassword = req.body.confirmPassword;
    
    // Reset the password reset fields
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;
    user.passwordChangedAt = Date.now();
  
    // Save the updated user information
    await user.save();
  
    // 3. Respond with success message
    res.status(200).json({
      message: 'Password reset successful!',
    });}
  };
*/

  module.exports.otp_get =(req, res) => {
    
    res.render('otp'); // Render the OTP entry form
  };
  
  module.exports.otp_post =  async (req, res) => {
    const { otp } = req.body;
    console.log('const { otp } = req.body;')
    try {
      const isValid = await validateOTP(otp); // Your OTP validation logic
      if (isValid) {
        const token = createToken(user._id);
    
          console.log('const token = createToken(user._id);')
    
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        //res.status(200).json({ message: 'OTP validated successfully!' });

      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  