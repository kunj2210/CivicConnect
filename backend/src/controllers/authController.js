import User from '../models/User.js';
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // In a real app, you should use bcrypt to hash and compare passwords
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const register = async (req, res) => {
    try {
        const { name, email, password, role, departmentId } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User({ name, email, password, role, departmentId });
        await newUser.save();
        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            departmentId: newUser.departmentId
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // In a real app, use bcrypt comparison
        if (user.password !== currentPassword) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=authController.js.map