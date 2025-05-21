import { Router } from 'express';
const router = Router();
import { validateDto } from '../middlewares/validate-dto.middleware';
import { CreateUserDto } from '../services/dto/create-user.dto';
import { create, findAll } from '../controllers/user.controller';

router.get("/users", findAll);
router.post('/users', validateDto(CreateUserDto), create);


module.exports = router;
