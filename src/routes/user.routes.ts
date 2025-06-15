import { Router } from 'express';
const router = Router();
import { validateDto } from '../middlewares/validate-dto.middleware';
import { CreateUserDto } from '../services/dto/create-user.dto';
import { create, findAll, deleteUser } from '../controllers/user.controller';
import { asyncHandler } from '../utils/async-handler';

router.get('/users', asyncHandler(findAll));
router.post('/users', validateDto(CreateUserDto), asyncHandler(create));
router.delete('/users/:id', asyncHandler(deleteUser));

module.exports = router;
