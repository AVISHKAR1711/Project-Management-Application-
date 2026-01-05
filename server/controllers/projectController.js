import prisma from "../configs/prisma.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



// Create Project

export const createProject = asyncHandler( async(req, res) => {
    const {userId} = req.auth();
    const {workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority} = req.body;

    // check if user has admin role for workspace

    const workspace = await prisma.workspace.findUnique({
        where : {id : workspaceId},
        include : {members : {include : {user : true}}}
    })
    if(!workspace){
        return res.status(404).json(new ApiResponse(404, {}, "workspacenot found"))
    }
    if(!workspace.members.some((member)=> member.userId=== userId && member.role === "ADMIN")){
        return res.status(404).json(new ApiResponse(404, {}, "You have not permission to create projects in this workspaces"))
    }
    // Get Team Lead using email

    const teamLead = await prisma.user.findUnique({
        where : {email : team_lead},
        select : {id : true}
    })
    const project = await prisma.project.create({
        data : {
            workspaceId,
            name,
            description,
            status,
            priority,
            progress,
            team_lead : teamLead?.id,
            start_date : start_date ? new Date(start_date) : null,
            end_date : end_date ? new Date(end_date) : null,
        }
    })

    // Add  members to project if they are in the workspace
    if(team_members?.length > 0){
        const membersToAdd  = []
        workspace.members.forEach(member=> {
            if(team_members.include(member.user.email)){
                membersToAdd.push(member.user.id)
            }
            
        });
    }

})

// Update Project

export const updateProject = asyncHandler( async(req, res) => {
    
})



// Add Member to Project

export const addMember = asyncHandler( async(req, res) => {
    
})