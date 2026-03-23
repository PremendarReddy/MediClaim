import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { sendOTPEmail } from '../services/emailService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (Hospital or Insurance)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, hospitalDetails, insuranceDetails } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        if (!['HOSPITAL', 'INSURANCE', 'ADMIN'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role for public registration. Patients are added by hospitals.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            hospitalDetails: role === 'HOSPITAL' ? hospitalDetails : undefined,
            insuranceDetails: role === 'INSURANCE' ? insuranceDetails : undefined,
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.twoFactorEnabled) {
                // Return a temporary token to proceed to 2FA verification
                const tempToken = jwt.sign({ id: user._id, is2FaPending: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
                return res.json({
                    success: true,
                    requires2FA: true,
                    tempToken,
                    message: 'Please complete 2FA verification'
                });
            }

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            
            if (user.role === 'PATIENT') {
                if (!user.patientDetails) user.patientDetails = {};
                if (req.body.phone) {
                    user.patientDetails.phoneNumber = req.body.phone;
                }
                if (req.body.emergencyContact) {
                    user.patientDetails.emergencyContact = {
                        name: req.body.emergencyContact.name || user.patientDetails.emergencyContact?.name,
                        relation: req.body.emergencyContact.relation || user.patientDetails.emergencyContact?.relation,
                        phone: req.body.emergencyContact.phone || user.patientDetails.emergencyContact?.phone
                    };
                }
            }
            
            await user.save();
            res.json({
                success: true,
                data: { _id: user._id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate 2FA Secret and QR Code
// @route   POST /api/auth/2fa/generate
// @access  Private
export const generate2FA = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ length: 20 });
        const user = await User.findById(req.user._id);
        
        user.twoFactorSecret = secret.base32;
        await user.save();

        const otpauth_url = speakeasy.otpauthURL({
             secret: secret.base32,
             label: encodeURIComponent(`MediClaim:${user.email}`),
             issuer: 'MediClaim',
             encoding: 'base32'
        });

        qrcode.toDataURL(otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ success: false, message: "Error generating QR Code" });
            res.json({ success: true, qrCodeUrl: data_url, secret: secret.base32 });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
export const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            user.twoFactorEnabled = true;
            await user.save();
            res.json({ success: true, message: 'Two-Factor Authentication enabled successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid 2FA token' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
export const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        res.json({ success: true, message: 'Two-Factor Authentication disabled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify 2FA Token for Login
// @route   POST /api/auth/login/verify-2fa
// @access  Public
export const verifyLogin2FA = async (req, res) => {
    try {
        const { tempToken, token } = req.body;
        if (!tempToken) return res.status(401).json({ success: false, message: 'Not authorized, no temp token' });

        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired temporary token' });
        }

        if (!decoded.is2FaPending) return res.status(401).json({ success: false, message: 'Invalid token type' });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid 2FA token' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Initiate forgot password flow Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.resetPasswordOTP = otp;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        const emailResult = await sendOTPEmail(email, otp);

        if (emailResult.success) {
            res.json({ success: true, message: 'OTP sent to email successfully' });
        } else {
            // Optional fallback/cleanup if email fails
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
