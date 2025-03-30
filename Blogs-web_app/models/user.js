const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emaill = require('../controlers/email'); // Make sure you import your email utility correctly

const schema = mongoose.Schema;

const userSchema = new schema({
  email: {
    type: String,
    required: [true, 'email can not be empty'],
    unique: [true, 'this email is already taken'],
    validate: [isEmail, 'please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'password can not be empty'],
    minlength: [8, 'password can not be less than 8 chars'],
  },
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpiresAt: Date,
  otp: String,
  otpExpires: Date,
  isVerified:false,
  //verificationCode:String
});

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const auth = await bcrypt.compare(password.trim(), user.password);
   // if(user.isVerified & auth)
    if (user.isVerified & auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

// Instance method to create reset password token
userSchema.methods.createResetPasswordToken = function () {
  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the reset token before saving it to the database
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set the expiration time (10 minutes from now)
  this.passwordExpiresAt = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  
  // Return the plain reset token to be sent to the user
  return resetToken;
};


// Instance method to generate OTP
userSchema.methods.generateOTP = function () {
  const otp = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit OTP
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  return otp;
};

// Instance method to validate OTP
userSchema.methods.validateOTP = async function (enteredOtp) {
  // Check if OTP exists and has not expired
  if (!this.otp || this.otpExpires < Date.now()) {
    throw new Error('OTP has expired or is invalid.');
  }

  // Compare the OTP
  const isMatch = this.otp === enteredOtp;
  if (!isMatch) {
    throw new Error('Invalid OTP.');
  }

  // Clear OTP and expiration after validation
  this.otp = undefined;
  this.otpExpires = undefined;
  await this.save();

  return { success: true, message: 'OTP validated successfully.' };
};

// Instance method to handle sending OTP email
userSchema.statics.send_otp = async function (email) {
  /*try {
    const user = await this.model('User').findOne({ email });
    console.log(user);
    if (!user) {
      throw new Error("Can't find the user");
    }
*/
    // Create OTP and save it to the database
    const otp = User.generateOTP();
    console.log(otp);
    await this.save(); // Save the OTP

    // Create reset URL (example of OTP sent directly)
    const resetUrl = `${otp}`;

    // Email message
    const message = `OTP: Please use the following code to reset your password: ${resetUrl}`;

    // Send email
    try {
      await emaill.sendEmail({
        email: email,
        subject: 'Password OTP',
        message: message,
      });
      console.log('Sent OTP successfully to the user’s email');
      //return true;
    } catch (err) {
      // If email fails, reset the OTP fields and save
      this.otp = undefined;
      this.otpExpires = undefined;
      await this.save();
      
      console.error('Failed to send email. OTP reset.');
      //throw new Error('Failed to send OTP. Please try again later.');
      //return false;
    }
 /* } catch (err) {
    console.error('Error:', err);
    return false;
    //throw new Error('Internal server error.');
  }*/
};

module.exports = mongoose.model('User', userSchema);
