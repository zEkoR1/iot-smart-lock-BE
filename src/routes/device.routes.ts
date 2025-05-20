import { Router } from 'express';
import * as controller from '../controllers/device.controller';
import {validateDto} from "../middlewares/validate-dto.middleware";
import {CreateDeviceDto} from "../services/dto/create-device.dto";

const router = Router();
router.get("/device", controller.findAll);
router.get("/device/:id", controller.findOne);
router.post('/device',  validateDto(CreateDeviceDto), controller.create);
// router.post("auth/new", singup);
// router.post("/auth", login);

module.exports = router;
