import { Router } from 'express';
import * as controller from '../controllers/access.controller';
import { authenticateDevice } from '../middlewares/device-auth.middleware';

const router = Router();

// All access routes require a valid device API key
router.use(authenticateDevice);

// Biometric authentication endpoint
router.post('/login', controller.authenticateBiometrics);

// Token verification endpoint
router.post('/verify-token', controller.verifyAccessToken);

module.exports = router;
