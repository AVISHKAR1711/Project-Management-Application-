/*import prisma from "../configs/prisma.js"

// Get all workspace for user

export const getUserWorkspaces = async(req, res) => {
    try {
        const  {userId} = await req.auth()
        const workspaces = await prisma.workspaces.findMany({
            where : {
                members : {some : {userId : userId}}
            },
            include : {
                members : {include : {user : true}},
                projects : {
                    include : {
                        tasks : {include : { assignee : true, comments : {include : {user : true}}}},
                        members : {include : {user : true}}
                    }
                },
                owner : true
            }
        });
        res.json({workspaces})
    } catch (error) {
        console.log(error);
       return res.status(500).json({message : error.code || error.message})
    }
}

// Add member to workspace

export const addMember = async (req, res) => {
    try {
        const  {userId} = await req.auth();
        const {email, role, workspaceId, message} = req.body;

        // check if user exists

        const user = await prisma.user.findUnique({where :{ email}});

        if(!user){
           return res.status(404).json({message : "User not found"})
        }

        if(!workspaceId || !role){
             return  res.status(400).json({message : "Missing required parameters"})
        }

        if(!["ADMIN", "MEMBER"].includes(role)){
             return  res.status(400).json({message : "Invalid role"})
        }

        // fetch workspace 
        const workspace = await prisma.workspace.findUnique({where : {id : workspaceId}, include: {members : true}})
        
        if(!workspace){
             return  res.status(404).json({message : "Workspace not found"})
        }

        // Check creator has admin role

        if(!workspace.members.find((member)=>member.userId === userId && member.role === "ADMIN")){
              return  res.status(401).json({message : "You do not have admin privileges"})
        }

        // check if user is already a memeber

        const existingMember = workspace.members.find((member)=>member.userId === userId);

        if(existingMember){
              return  res.status(400).json({message : "User is alredy member"})
        }

        const member = await prisma.worksspaceMember.create({
            data : {
                userId : user.id,
                workspaceId,
                role,
                message
            }
        })

        res.status(201).json({member, message : "Member added succesfully"})

    } catch (error) {
         console.log(error);
        res.status(500).json({message : error.code || error.message})
    }
}*/

import prisma from "../configs/prisma.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * Get all workspaces for logged-in user
 */
const getUserWorkspaces = asyncHandler(async (req, res) => {
    const { userId } = await req.auth()

    if (!userId) {
        throw new ApiError(401, "Unauthorized user")
    }

    const workspaces = await prisma.workspace.findMany({
        where: {
            members: {
                some: { userId }
            }
        },
        include: {
            members: {
                include: { user: true }
            },
            projects: {
                include: {
                    tasks: {
                        include: {
                            assignee: true,
                            comments: {
                                include: { user: true }
                            }
                        }
                    },
                    members: {
                        include: { user: true }
                    }
                }
            },
            owner: true
        }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, workspaces, "Workspaces fetched successfully"))
})

/**
 * Add member to workspace
 */
const addMember = asyncHandler(async (req, res) => {
    const { userId } = await req.auth()
    const { email, role, workspaceId, message } = req.body

    if (!email || !role || !workspaceId) {
        throw new ApiError(400, "Missing required parameters")
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
        throw new ApiError(400, "Invalid role")
    }

    // check if user exists
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // fetch workspace with members
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: true }
    })

    if (!workspace) {
        throw new ApiError(404, "Workspace not found")
    }

    // check admin privilege
    const isAdmin = workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN"
    )

    if (!isAdmin) {
        throw new ApiError(403, "You do not have admin privileges")
    }

    // check if user already a member
    const existingMember = workspace.members.find(
        (member) => member.userId === user.id
    )

    if (existingMember) {
        throw new ApiError(400, "User is already a member")
    }

    const member = await prisma.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId,
            role,
            message
        }
    })

    return res
        .status(201)
        .json(new ApiResponse(201, member, "Member added successfully"))
})

export {
    getUserWorkspaces,
    addMember
}
