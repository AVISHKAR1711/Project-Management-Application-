import prisma from "../configs/prisma.js"
import { inngest } from "../inngest/index.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create task

export const createTask = asyncHandler( async(req, res) => {
    console.log("🔥 CREATE TASK API HIT");

    const {userId} = await req.auth();
    console.log("USER ID:", userId);


    const {projectId, title, description, type, status, priority, assigneeId, due_date} = req.body;
    console.log("REQ BODY:", req.body);
    if (!projectId) {
  console.log("❌ projectId missing");
}



    const origin = req.get('origin')

    // check if user has admin role for project

     console.log("REQ BODY:", req.body);
    console.log("USER ID:", userId);
    
    const project = await prisma.project.findUnique({
        where : {id: projectId},
        include : {members : {include :{user: true}}}
    })

    if (!projectId) {
  console.log("❌ projectId missing");
}

console.log("ASSIGNEE:", assigneeId);
console.log("PROJECT MEMBERS:", project?.members);


   


      if(!project){
             throw new ApiError(404, "Project not found")
    //    }else if(project.team_lead !== userId){
      //       throw new ApiError(404, "You dont have admin privillages for this project")
        }else if(assigneeId && !project.members.find((member)=>member.user.id === assigneeId )){
            throw new ApiError(404, "Assignee is not a memeber of project/workspace")
        }

        const task = await prisma.task.create({
            data : {
                projectId,
                title,
                description,
                priority,
                assigneeId,
                status,
                type,
                due_date : new Date(due_date)
            },
            
        })
        console.log("CREATING TASK...");
        console.log("TASK CREATED:", task);



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
          throw new ApiError(404, "Task not found")
    }
    const {userId} = await req.auth();

    // check if user has admin role for project

    const project = await prisma.project.findUnique({
        where : {id:  task.projectId},
        include : {members : {include :{user: true}}}
    })

      if(!project){
             throw new ApiError(404, "Project not found")
        }else if(project.team_lead !== userId){
            throw new ApiError(404, "You dont have admin privillages for this project")
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
        throw new ApiError(404, "Task not found")
    }

    const project = await prisma.project.findUnique({
        where : {id:  tasks[0].projectId},
        include : {members : {include :{user: true}}}
    })
  
    if(!project){
             throw new ApiError(404, "Project not found")
        }else if(project.team_lead !== userId){
             throw new ApiError(404, "You dont have admin privillages for this project")
        }
    await prisma.task.deleteMany({
        where: {id : {in: tasksIds}}
    })

        res.status(201).json(new ApiResponse(201, {}, "Task deleted successfully"))
}) 
