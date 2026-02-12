import express from "express";
import { updateTask ,createTask, deleteTask} from "../controllers/taskController.js";

const taskRouter = express.Router()

taskRouter.post('/', createTask)
taskRouter.put('/:id', updateTask)
taskRouter.post('/update',deleteTask)

export default taskRouter