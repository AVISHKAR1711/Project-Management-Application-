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
        await prisma.projectMember.createMany({data : membersToAdd.map(memberId => ({
            projectId : project.id,
            userId : memberId  
        }))})
    }

    const projectWithMemebers = await prisma.project.findUnique({
        where : {id : project.id},
        include : {
            members : {include : {user : true}},
            tasks : {include : {assignee : true, comments : {include : {user : true}}}},
            owner : true
        }
    })

    res.status(200).json(new ApiResponse(200, {project : projectWithMemebers}, "Project created successfully "))
    

})

// Update Project

export const updateProject = asyncHandler( async(req, res) => {

    const {userId} = req.auth();
     const {id,workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority} = req.body;
    // chek if user has admin role for workspace
    
    const workspace = await prisma.workspace.findUnique({
        where : {id : workspaceId},
        include : {members : {include : {user : true}}}
    })

    if(!workspace){
        return res.status(404).json(new ApiResponse(404, {}, "workspacenot found"))
    }
    if(!workspace.members.some((member)=> member.userId=== userId && member.role === "ADMIN")){

        const project = await prisma.project.findUnique({
            where : {id}
        })
        if(!project){
             return res.status(404).json(new ApiResponse(404, {}, "project not found"))
        }
        else if(project.team_lead !== userId){
             return res.status(404).json(new ApiResponse(404, {}, "You dont have permission to update projects  in this workspace"))
        }
    }
    
    const project = await prisma.project.update({
        where : {id},
        data : {
            workspaceId,
            description,
            name,
            status,
            priority,
            progress,
            start_date : start_date ? new Date(start_date) : null,
            end_date : end_date ? new Date(end_date) : null,
        }
    })
     res.status(201).json(new ApiResponse(201, {project}, "Project updated successfully "))
    
})



// Add Member to Project

export const addMember = asyncHandler( async(req, res) => {
    const {userId} = await req.auth();
    const {projectId} = req.params;
    const {email} = req.body;

    // Check if user is project lead
    const project = await prisma.project.findUnique({
        where : {id: projectId},
        include : {members: {include : {user : true}}}
    })

     if(!project){
             return res.status(404).json(new ApiResponse(404, {}, "project not found"))
        }

    if(project.team_lead !== userId){
             return res.status(404).json(new ApiResponse(404, {}, "You dont have permission to update projects  in this workspace"))
        }

    // CHeck if user is alredy a memeber

    const existingMember = project.members.find((member)=> member.email === email)

    if(existingMember){
         return res.status(404).json(new ApiResponse(404, {}, "User is already a memeber"))
    }

    const user = await prisma.user.findUnique({where : {email}});
    if(!user){
            return res.status(404).json(new ApiResponse(404, {}, "User not found"))
    }
     
    const member = await prisma.projectMember.create({
        data : {
            userId : user.id,
            projectId
        }
    })
    res.status(201).json(new ApiResponse(201, {member}, "memeber added successfully "))
})