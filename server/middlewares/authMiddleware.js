import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


export const protect = asyncHandler(async(req, res, next) => {
    
    const {userId} = await req.auth()
    if(!userId){
         throw new ApiError(401, "Unauthorized user")
    }
    return next()
})