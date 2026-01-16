import Tiffin from "../models/Tiffin.js";
// @desc    Get all tiffins (with filters)
// @route   GET /api/tiffins
// @access  Public
export const getTiffins = async (req, res) => {
    try {
        const { keyword, type, mealType } = req.query;
        let query = { isAvailable: true };
        if (keyword) {
            query.name = { $regex: keyword, $options: "i" };
        }
        if (type) {
            query.type = type;
        }
        if (mealType) {
            query.mealType = mealType;
        }
        const tiffins = await Tiffin.find(query).populate("provider", "name address rating reviewCount");
        res.json(tiffins);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get single tiffin
// @route   GET /api/tiffins/:id
// @access  Public
export const getTiffinById = async (req, res) => {
    try {
        const tiffin = await Tiffin.findById(req.params.id).populate("provider", "name address rating reviewCount");
        if (tiffin) {
            res.json(tiffin);
        }
        else {
            res.status(404).json({ message: "Tiffin service not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create a tiffin
// @route   POST /api/tiffins
// @access  Private (Provider only)
export const createTiffin = async (req, res) => {
    try {
        const { name, description, price, type, mealType, cutoffTime, images } = req.body;
        const tiffin = new Tiffin({
            provider: req.user.id,
            name,
            description,
            price,
            type,
            mealType,
            cutoffTime,
            images,
        });
        const createdTiffin = await tiffin.save();
        res.status(201).json(createdTiffin);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update a tiffin
// @route   PUT /api/tiffins/:id
// @access  Private (Provider only)
export const updateTiffin = async (req, res) => {
    try {
        const { name, description, price, type, mealType, cutoffTime, isAvailable, images } = req.body;
        const tiffin = await Tiffin.findById(req.params.id);
        if (tiffin) {
            // Check if user is the provider owner
            if (tiffin.provider.toString() !== req.user.id) {
                res.status(401).json({ message: "Not authorized to update this tiffin" });
                return;
            }
            tiffin.name = name || tiffin.name;
            tiffin.description = description || tiffin.description;
            tiffin.price = price || tiffin.price;
            tiffin.type = type || tiffin.type;
            tiffin.mealType = mealType || tiffin.mealType;
            tiffin.cutoffTime = cutoffTime || tiffin.cutoffTime;
            tiffin.images = images || tiffin.images;
            if (isAvailable !== undefined)
                tiffin.isAvailable = isAvailable;
            const updatedTiffin = await tiffin.save();
            res.json(updatedTiffin);
        }
        else {
            res.status(404).json({ message: "Tiffin not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete a tiffin
// @route   DELETE /api/tiffins/:id
// @access  Private (Provider only)
export const deleteTiffin = async (req, res) => {
    try {
        const tiffin = await Tiffin.findById(req.params.id);
        if (tiffin) {
            if (tiffin.provider.toString() !== req.user.id) {
                res.status(401).json({ message: "Not authorized to delete this tiffin" });
                return;
            }
            await tiffin.deleteOne();
            res.json({ message: "Tiffin removed" });
        }
        else {
            res.status(404).json({ message: "Tiffin not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get provider tiffins
// @route   GET /api/tiffins/provider/me
// @access  Private (Provider only)
export const getMyTiffins = async (req, res) => {
    try {
        const tiffins = await Tiffin.find({ provider: req.user.id });
        res.json(tiffins);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=tiffinController.js.map