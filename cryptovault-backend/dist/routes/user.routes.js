"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/profile', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ message: 'User profile not implemented yet' });
}));
router.put('/profile', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ message: 'Profile update not implemented yet' });
}));
router.put('/change-password', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ message: 'Password change not implemented yet' });
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map