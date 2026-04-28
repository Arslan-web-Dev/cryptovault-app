"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/summary', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ total_value: 0, total_pnl: 0, pnl_percentage: 0 });
}));
router.get('/allocation', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ allocation: [] });
}));
router.get('/performance', rateLimit_middleware_1.apiRateLimit, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.status(200).json({ performance: [] });
}));
exports.default = router;
//# sourceMappingURL=portfolio.routes.js.map