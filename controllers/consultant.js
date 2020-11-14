const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../utils/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const Consultant = require("../models/Consultants");

// @desc    Get all consultants
// @route   GET /api/v1/consultant
// @access  Public
exports.getAllConsultants = asyncHandler(async (req, res, next) => {
  const consultants = await Consultant.find();

  res.status(200).json({
    success: true,
    data: consultants,
  });
});

// @desc    Get single consultants
// @route   GET /api/v1/consultant/:id
// @access  Public
exports.getSingleConsultant = asyncHandler(async (req, res, next) => {
  const consultant = await Consultant.findById(req.params.id);

  if (!consultant) {
    return next(
      new ErrorResponse(`No consultant with the id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: consultant,
  });
});

// @desc    Update consultant image
// @route   PUT /api/v1/consultant/image
// @access  Private
exports.updateConsultantImage = asyncHandler(async (req, res, next) => {
  let consultant = await Consultant.findById(req.consultant.id);

  if (!consultant) {
    return next(
      new ErrorResponse(`No consultant with the id: ${req.consultant.id}`, 404)
    );
  }

  if (consultant.cloudinaryId) {
    await cloudinary.uploader.destroy(consultant.cloudinaryId);
    const uploadResult = await cloudinary.uploader.upload(req.file.path);
    const data = {
      cloudinaryId: uploadResult.public_id,
      image: uploadResult.secure_url,
    };

    consultant = await Consultant.findByIdAndUpdate(req.consultant.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: consultant,
    });
  } else {
    const uploadResult = await cloudinary.uploader.upload(req.file.path);
    const data = {
      cloudinaryId: uploadResult.public_id,
      image: uploadResult.secure_url,
    };

    consultant = await Consultant.findByIdAndUpdate(req.consultant.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: consultant,
    });
  }
});

// @desc    Update consultant details
// @route   PUT /api/v1/consultant
// @access  Private
exports.updateConsultantDetails = asyncHandler(async (req, res, next) => {
  let consultant = await Consultant.findById(req.consultant.id);

  if (!consultant) {
    return next(
      new ErrorResponse(`No consultant with the id: ${req.consultant.id}`, 404)
    );
  }

  const updated = await Consultant.findByIdAndUpdate(
    req.consultant.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updated,
  });
});
