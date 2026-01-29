import { Response } from "express";
import User from "../models/User.js";

// @desc    Get my saved addresses
// @route   GET /api/users/addresses
// @access  Private
export const getSavedAddresses = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id).select("savedAddresses");
        res.json(user?.savedAddresses || []);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new saved address
// @route   POST /api/users/addresses
// @access  Private
export const addSavedAddress = async (req: any, res: Response): Promise<void> => {
    try {
        const { label, street, city, state, pincode, coordinates, isDefault } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // If this is set as default, unset others
        if (isDefault && user.savedAddresses) {
            user.savedAddresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        // If this is the first address, make it default
        const makeDefault = isDefault || !user.savedAddresses?.length;

        if (!user.savedAddresses) {
            user.savedAddresses = [];
        }

        user.savedAddresses.push({
            label,
            street,
            city,
            state: state || "State",
            pincode,
            coordinates,
            isDefault: makeDefault,
        });

        await user.save();
        res.status(201).json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a saved address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateSavedAddress = async (req: any, res: Response): Promise<void> => {
    try {
        const { addressId } = req.params;
        const { label, street, city, state, pincode, coordinates, isDefault } = req.body;

        const user = await User.findById(req.user.id);
        if (!user || !user.savedAddresses) {
            res.status(404).json({ message: "Address not found" });
            return;
        }

        const addressIndex = user.savedAddresses.findIndex(
            (addr: any) => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            res.status(404).json({ message: "Address not found" });
            return;
        }

        // If setting as default, unset others
        if (isDefault) {
            user.savedAddresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        const existingAddress = user.savedAddresses[addressIndex];
        if (!existingAddress) {
            res.status(404).json({ message: "Address not found" });
            return;
        }

        user.savedAddresses[addressIndex] = {
            ...existingAddress,
            label: label || existingAddress.label,
            street: street || existingAddress.street,
            city: city || existingAddress.city,
            state: state || existingAddress.state,
            pincode: pincode || existingAddress.pincode,
            coordinates: coordinates || existingAddress.coordinates,
            isDefault: isDefault ?? existingAddress.isDefault,
        };

        await user.save();
        res.json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a saved address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteSavedAddress = async (req: any, res: Response): Promise<void> => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user || !user.savedAddresses) {
            res.status(404).json({ message: "Address not found" });
            return;
        }

        user.savedAddresses = user.savedAddresses.filter(
            (addr: any) => addr._id.toString() !== addressId
        );

        await user.save();
        res.json(user.savedAddresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) {
            user.address = {
                street: address.street || user.address?.street || "",
                city: address.city || user.address?.city || "",
                state: address.state || user.address?.state || "",
                pincode: address.pincode || user.address?.pincode || "",
                coordinates: address.coordinates || user.address?.coordinates,
            };
        }

        await user.save();
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
