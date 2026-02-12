import prisma from "../configs/prisma.js"
import { inngest } from "../inngest/index.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create task

export const createTask = asyncHandler( async(req, res) => {
    const {userId} = await req.auth();

    const {projectId, title, description, type, status, priority, assigneeId, due_date} = req.body;

    const origin = req.get('origin')

    // check if user has admin role for project

    const project = await prisma.project.findUnique({
        where : {id: projectId},
        include : {members : {include :{user: true}}}
    })

      if(!project){
             return res.status(404).json(new ApiResponse(404, {}, "project not found"))
        }else if(project.team_lead !== userId){
             return res.status(403).json(new ApiResponse(404, {}, "You dont have admin privillages for this project"))
        }else if(assigneeId && !project.members.find((member)=>member.user.id === assigneeId )){
             return res.status(403).json(new ApiResponse(404, {}, "assignee is not a member of the project/workspace"))
        }

        const task = await prisma.task.create({
            data : {
                projectId,
                title,
                description,
                priority,
                assigneeId,
                status,
                due_date : new Date(due_date)
            }
        })

        const taskWithAssignee = await prisma.task.findUnique({
             where: {id: task.id},
             include : {assignee : true}
        })

        await inngest.send({
            name:"app/task.assigned",
            data: {
                taskId : task.id, origin
            }
        })

        res.status(201).json(new ApiResponse(201, {task : taskWithAssignee}, "Task created successfully"))
})

// update task

export const updateTask = asyncHandler( async(req, res) => {

    const task = await prisma.task.findUnique({
        where : {id: req.params.id}
    })

    if(!task){
          return res.status(404).json(new ApiResponse(404, {}, "task not found"))
    }
    const {userId} = await req.auth();

    // check if user has admin role for project

    const project = await prisma.project.findUnique({
        where : {id:  task.projectId},
        include : {members : {include :{user: true}}}
    })

      if(!project){
             return res.status(404).json(new ApiResponse(404, {}, "project not found"))
        }else if(project.team_lead !== userId){
             return res.status(403).json(new ApiResponse(404, {}, "You dont have admin privillages for this project"))
        }

        const updatedTask = await prisma.task.update({
            where: {id : req.params.id},
            data: req.body
        }) 

        res.status(201).json(new ApiResponse(201, {task : updatedTask}, "Task updated successfully"))
}) 

// Delete task

export const deleteTask = asyncHandler( async(req, res) => {

    const {userId} = await req.auth();
    const {tasksIds} = req.body

    const tasks = await prisma.task.findMany({
        where: {id: {in : tasksIds}}
    })

    if(tasks.length === 0){
        return res.status(404).json(new ApiResponse(404, {}, "Task not found"))
    }

    const project = await prisma.project.findUnique({
        where : {id:  tasks[0].projectId},
        include : {members : {include :{user: true}}}
    })
  
    if(!project){
             return res.status(404).json(new ApiResponse(404, {}, "project not found"))
        }else if(project.team_lead !== userId){
             return res.status(403).json(new ApiResponse(404, {}, "You dont have admin privillages for this project"))
        }
    await prisma.task.deleteMany({
        where: {id : {in: tasksIds}}
    })

        res.status(201).json(new ApiResponse(201, {}, "Task deleted successfully"))
}) 
