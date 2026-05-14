import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Full name is required"],
            match: [/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'],
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [/^03\d{9}$/, 'Please enter a valid 11-digit Pakistan phone number starting with 03'],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL is required"],
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
      return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

  
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
