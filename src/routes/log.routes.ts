const { Router } = require('express');
import { LogController } from '../controllers/log.controller';
import { validateDto } from '../middlewares/validate-dto.middleware';
import { CreateLogDto } from '../services/dto/create-log.dto';

const router = Router();
const logController = new LogController();

router.get('/logs', logController.findAll);
router.post('/logs', validateDto(CreateLogDto), logController.create);

module.exports = router; 