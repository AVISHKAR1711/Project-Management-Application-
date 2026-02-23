import prisma from "../configs/prisma.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const addComment = asyncHandler( async(req , res ) => {
    const {userId} = req.auth();
    const {content, taskId} = req.body;

    // check if user is projectmember
    const task = await prisma.task.findUnique({
        where: {id: taskId},
    })
    const project = await prisma.project.findUnique({
        where: {id: task.projectId},
        include: {members: {include: {user: true}}}
    })

    if(!project){
        throw new ApiError(404, "Project not found")
    }

    const memeber = project.members.find((member) => member.userId === userId);
    if(!memeber){
        throw new ApiError(403, "You are not member of this project")
    }

    const comment = await prisma.comment.create({
        data: {taskId, content, userId},
        include: {user: true}
    })

    res.status(200).json(new ApiResponse(200, {comment}, "comment added successfully"))
})

// Get comments for task

export const getTaskComments = asyncHandler(async(req, res) => {
    const {taskId} = req.params;
    const comments = await prisma.comment.findMany({
        where: {taskId},
        include: {user : true}
    })
    console.log(comments);
     res.status(200).json(new ApiResponse(200, {comments}, "comments get successfully"))

})